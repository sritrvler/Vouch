import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createRateLimiter, getClientIp } from '@/lib/ratelimit';

const videoLimiter = createRateLimiter({ windowMs: 60 * 60_000, max: 5 });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (!videoLimiter.check(ip)) {
    return NextResponse.json({ error: 'Too many video uploads. Please try again later.' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const video = formData.get('video') as File | null;
    const formId = formData.get('formId') as string | null;

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!video || !formId || !UUID_RE.test(formId)) {
      return NextResponse.json({ error: 'Missing or invalid video/formId' }, { status: 400 });
    }

    if (!video.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
    if (video.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 100MB)' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Fetch form to get project_id and user_id
    const { data: form, error: formError } = await supabase
      .from('collection_forms')
      .select('id, project_id, user_id')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const adminClient = createAdminClient();

    // Check subscription plan
    const { data: sub } = await adminClient
      .from('subscriptions')
      .select('plan')
      .eq('user_id', form.user_id)
      .single();

    const isFree = !sub || sub.plan === 'free';

    if (isFree) {
      // Count existing video testimonials for this project
      const { count } = await adminClient
        .from('testimonials')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', form.project_id)
        .not('video_url', 'is', null);

      if ((count ?? 0) >= 3) {
        return NextResponse.json(
          { error: 'Video limit reached', limitReached: true },
          { status: 403 }
        );
      }
    }

    // Ensure bucket exists (lazy creation, ignore error if already exists)
    await adminClient.storage.createBucket('testimonial-videos', { public: true });

    const ext = video.type.includes('mp4') ? 'mp4' : 'webm';
    const path = `${formId}/${crypto.randomUUID()}.${ext}`;
    const videoBuffer = await video.arrayBuffer();

    const { error: uploadError } = await adminClient.storage
      .from('testimonial-videos')
      .upload(path, videoBuffer, {
        contentType: video.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Video upload error:', uploadError);
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 });
    }

    const { data: urlData } = adminClient.storage
      .from('testimonial-videos')
      .getPublicUrl(path);

    // Upload thumbnail if provided
    let thumbnailUrl: string | null = null;
    const thumbnail = formData.get('thumbnail') as File | null;
    if (thumbnail && thumbnail.type.startsWith('image/')) {
      const thumbBuffer = await thumbnail.arrayBuffer();
      const thumbPath = `${formId}/${crypto.randomUUID()}-thumb.jpg`;
      const { error: thumbError } = await adminClient.storage
        .from('testimonial-videos')
        .upload(thumbPath, thumbBuffer, { contentType: 'image/jpeg', upsert: false });
      if (!thumbError) {
        const { data: thumbData } = adminClient.storage
          .from('testimonial-videos')
          .getPublicUrl(thumbPath);
        thumbnailUrl = thumbData.publicUrl;
      }
    }

    return NextResponse.json({ url: urlData.publicUrl, thumbnailUrl });
  } catch (err) {
    console.error('Unhandled error in upload-video route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

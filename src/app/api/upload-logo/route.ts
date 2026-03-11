import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file extension and MIME type
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const ext = (file.name.split('.').pop() || '').toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, GIF, and WebP images are allowed' }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 2MB' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Ensure bucket exists and is public (createBucket is a no-op if bucket already exists,
    // so updateBucket ensures the public flag is enforced even for pre-existing buckets)
    await adminClient.storage.createBucket('vouch-assets', { public: true }).catch(() =>
      adminClient.storage.updateBucket('vouch-assets', { public: true })
    );
    const path = `logos/${user.id}/logo.${ext}`;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await adminClient.storage
      .from('vouch-assets')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Logo upload error:', uploadError);
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 });
    }

    const { data: urlData } = adminClient.storage
      .from('vouch-assets')
      .getPublicUrl(path);

    return NextResponse.json({ url: `${urlData.publicUrl}?t=${Date.now()}` });
  } catch (err) {
    console.error('Unhandled error in upload-logo route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

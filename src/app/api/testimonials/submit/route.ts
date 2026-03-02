import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendNewTestimonialNotification } from '@/lib/email';
import { createRateLimiter, getClientIp } from '@/lib/ratelimit';

const submitLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com', 'protonmail.com', 'proton.me',
  'aol.com', 'mail.com', 'yandex.com', 'yandex.ru', 'qq.com', '163.com',
  '126.com', 'zoho.com', 'gmx.com', 'gmx.net', 'web.de',
]);

function extractProfessionalDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.lastIndexOf('@');
  if (at === -1) return null;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain || PERSONAL_EMAIL_DOMAINS.has(domain)) return null;
  return domain;
}

interface SubmitBody {
  formId: string;
  rating: number;
  content: string;
  authorName: string;
  authorEmail?: string | null;
  authorRole?: string | null;
  authorCompany?: string | null;
  avatarDataUrl?: string | null;
  customAnswers?: Record<string, string>;
  videoUrl?: string | null;
}

function isSubmitBody(v: unknown): v is SubmitBody {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.formId === 'string' &&
    typeof obj.rating === 'number' &&
    typeof obj.content === 'string' &&
    typeof obj.authorName === 'string'
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (!submitLimiter.check(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  try {
    const rawBody: unknown = await request.json();

    if (!isSubmitBody(rawBody)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const {
      formId,
      rating,
      content,
      authorName,
      authorEmail,
      authorRole,
      authorCompany,
      avatarDataUrl,
      customAnswers,
      videoUrl,
    } = rawBody;

    // ── Validate fields ──────────────────────────────────────────────────────
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!formId || typeof formId !== 'string' || !UUID_RE.test(formId)) {
      return NextResponse.json({ error: 'formId is required' }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be an integer between 1 and 5' }, { status: 400 });
    }
    if (typeof content !== 'string' || content.trim().length < 20) {
      return NextResponse.json(
        { error: 'content must be at least 20 characters' },
        { status: 400 }
      );
    }
    if (typeof content === 'string' && content.length > 5000) {
      return NextResponse.json({ error: 'content must be 5000 characters or fewer' }, { status: 400 });
    }
    if (typeof authorName !== 'string' || authorName.trim().length === 0) {
      return NextResponse.json({ error: 'authorName is required' }, { status: 400 });
    }
    // Limit avatar to 500 KB (base64 adds ~37% overhead, so cap at 700 KB chars)
    if (avatarDataUrl && avatarDataUrl.length > 700_000) {
      return NextResponse.json({ error: 'Avatar image too large (max 500KB)' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // ── Fetch form ───────────────────────────────────────────────────────────
    const { data: form, error: formError } = await supabase
      .from('collection_forms')
      .select('id, is_active, project_id, user_id')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    if (!form.is_active) {
      return NextResponse.json({ error: 'This form is no longer accepting submissions' }, { status: 404 });
    }

    // ── Insert testimonial ───────────────────────────────────────────────────
    const { data: testimonial, error: insertError } = await supabase
      .from('testimonials')
      .insert({
        form_id: form.id,
        project_id: form.project_id,
        user_id: form.user_id,
        author_name: authorName.trim(),
        author_email: authorEmail?.trim() || null,
        author_role: authorRole?.trim() || null,
        author_company: authorCompany?.trim() || null,
        author_avatar_url: avatarDataUrl || null,
        rating,
        content: content.trim(),
        status: 'pending',
        source: 'form',
        custom_answers: customAnswers ?? {},
        video_url: videoUrl || null,
        email_domain: extractProfessionalDomain(authorEmail),
      })
      .select('id')
      .single();

    if (insertError || !testimonial) {
      console.error('Failed to insert testimonial:', insertError);
      return NextResponse.json(
        { error: 'Failed to save testimonial. Please try again.' },
        { status: 500 }
      );
    }

    // ── Record form view as submitted (non-blocking) ─────────────────────────
    void supabase
      .from('form_views')
      .insert({
        form_id: form.id,
        submitted: true,
        referrer: request.headers.get('referer') || null,
        user_agent: request.headers.get('user-agent') || null,
      });

    // ── Notify form owner by email (non-blocking) ─────────────────────────────
    void (async () => {
      try {
        const { data: ownerData } = await supabase.auth.admin.getUserById(form.user_id);
        const ownerEmail = ownerData?.user?.email;
        if (ownerEmail) {
          await sendNewTestimonialNotification({
            toEmail: ownerEmail,
            authorName: authorName.trim(),
            rating,
            content: content.trim(),
          });
        }
      } catch (e) {
        console.error('Failed to send testimonial notification email:', e);
      }
    })();

    return NextResponse.json(
      { success: true, testimonialId: testimonial.id },
      { status: 201 }
    );
  } catch (err) {
    console.error('Unhandled error in submit route:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

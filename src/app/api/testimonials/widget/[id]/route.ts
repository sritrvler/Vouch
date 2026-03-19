import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createRateLimiter, getClientIp } from '@/lib/ratelimit';
import { sanitizeFontUrl } from '@/lib/fonts';
import { PLANS } from '@/lib/lemonsqueezy';

const widgetLimiter = createRateLimiter({ windowMs: 60_000, max: 60, prefix: 'vouch:rl:widget' });

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=60, s-maxage=60',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest, { params }: PageProps) {
  const ip = getClientIp(request.headers);
  if (!(await widgetLimiter.check(ip))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: CORS_HEADERS });
  }

  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // ── Fetch widget config ───────────────────────────────────────────────────
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id, project_id, user_id, name, layout, theme, filter_mode, min_rating, max_items, hide_branding, pinned_ids')
      .eq('id', id)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const pinnedIds: string[] = Array.isArray(widget.pinned_ids) ? (widget.pinned_ids as string[]) : [];

    // ── Parallel fetch: project, subscription, and testimonials ─────────────
    const projectPromise = supabase
      .from('projects')
      .select('name, logo_url, font_family, font_url, accent_color')
      .eq('id', widget.project_id)
      .single();

    // Use admin client to bypass RLS (no public SELECT policy on subscriptions)
    const adminClient = createAdminClient();
    const subPromise = adminClient
      .from('subscriptions')
      .select('plan, is_banned')
      .eq('user_id', widget.user_id)
      .single();

    // Pre-build testimonials query (use generous limit; will be trimmed after plan check)
    const fetchLimit = pinnedIds.length > 0 ? 200 : Math.max(widget.max_items ?? 12, 50);
    let tQuery = supabase
      .from('testimonials')
      .select('id, author_name, author_role, author_company, author_avatar_url, rating, content, enhanced_content, featured, source_url, golden_sentence, metric_label, video_url, video_thumbnail_url, email_domain, show_text, show_video, created_at', { count: 'exact' })
      .eq('project_id', widget.project_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(fetchLimit);

    if (widget.filter_mode === 'featured') {
      tQuery = tQuery.eq('featured', true);
    } else if (widget.filter_mode === 'rating') {
      tQuery = tQuery.gte('rating', widget.min_rating ?? 4);
    }

    const [{ data: project }, { data: sub }, { data: rawTestimonials, count: totalCount, error: testimonialError }] =
      await Promise.all([projectPromise, subPromise, tQuery]);

    if (sub?.is_banned) {
      return NextResponse.json(
        { error: 'Widget unavailable' },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    if (testimonialError) {
      console.error('Error fetching testimonials for widget:', testimonialError);
      return NextResponse.json(
        { error: 'Failed to fetch testimonials' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const isPro = sub?.plan === 'pro' || sub?.plan === 'studio';
    const hardLimit = isPro ? (widget.max_items ?? 12) : Math.min(widget.max_items ?? 12, PLANS.free.widgetDisplayLimit);

    // Apply custom ordering if set, then enforce hardLimit
    let testimonials = rawTestimonials ?? [];
    if (pinnedIds.length > 0 && testimonials.length > 0) {
      const orderMap = new Map(pinnedIds.map((id, idx) => [id, idx]));
      testimonials = [...testimonials].sort((a, b) =>
        (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity)
      );
    }
    testimonials = testimonials.slice(0, hardLimit);

    // ── Record widget view (non-blocking) ─────────────────────────────────────
    void supabase.from('widget_views').insert({ widget_id: widget.id });

    const totalApproved = totalCount ?? testimonials.length;

    return NextResponse.json(
      {
        widget: {
          id: widget.id,
          name: widget.name,
          layout: widget.layout,
          theme: widget.theme,
          hideBranding: widget.hide_branding,
        },
        project: project ? { name: project.name, logoUrl: project.logo_url, fontFamily: project.font_family, fontUrl: sanitizeFontUrl(project.font_url), accentColor: project.accent_color ?? null } : null,
        testimonials,
        isPro,
        totalApproved,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error('Unhandled error in widget route:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createRateLimiter, getClientIp } from '@/lib/ratelimit';

const widgetLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=300, s-maxage=300',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest, { params }: PageProps) {
  const ip = getClientIp(request.headers);
  if (!widgetLimiter.check(ip)) {
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

    // ── Fetch project info for branding ──────────────────────────────────────
    const { data: project } = await supabase
      .from('projects')
      .select('name, logo_url')
      .eq('id', widget.project_id)
      .single();

    // ── Check Pro status for display limit ────────────────────────────────────
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', widget.user_id)
      .single();
    const isPro = sub?.plan === 'pro' || sub?.plan === 'agency';
    const hardLimit = isPro ? (widget.max_items ?? 12) : Math.min(widget.max_items ?? 12, 5);

    const pinnedIds: string[] = Array.isArray(widget.pinned_ids) ? (widget.pinned_ids as string[]) : [];

    // ── Build testimonials query ───────────────────────────────────────────────
    // Fetch up to 200 when custom order is set (sort in JS), otherwise use DB ordering + limit
    const fetchLimit = pinnedIds.length > 0 ? 200 : hardLimit;
    let query = supabase
      .from('testimonials')
      .select('id, author_name, author_role, author_company, author_avatar_url, rating, content, enhanced_content, featured, source_url, golden_sentence, metric_label, video_url, video_thumbnail_url, email_domain, created_at', { count: 'exact' })
      .eq('project_id', widget.project_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(fetchLimit);

    if (widget.filter_mode === 'featured') {
      query = query.eq('featured', true);
    } else if (widget.filter_mode === 'rating') {
      query = query.gte('rating', widget.min_rating ?? 4);
    }

    const { data: rawTestimonials, count: totalCount, error: testimonialError } = await query;

    // Apply custom ordering if set, then enforce hardLimit
    let testimonials = rawTestimonials ?? [];
    if (pinnedIds.length > 0 && testimonials.length > 0) {
      const orderMap = new Map(pinnedIds.map((id, idx) => [id, idx]));
      testimonials = [...testimonials].sort((a, b) =>
        (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity)
      );
    }
    testimonials = testimonials.slice(0, hardLimit);

    if (testimonialError ?? false) {
      console.error('Error fetching testimonials for widget:', testimonialError);
      return NextResponse.json(
        { error: 'Failed to fetch testimonials' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

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
        project: project ? { name: project.name, logoUrl: project.logo_url } : null,
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

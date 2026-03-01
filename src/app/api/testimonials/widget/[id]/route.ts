import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

export async function GET(_request: NextRequest, { params }: PageProps) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // ── Fetch widget config ───────────────────────────────────────────────────
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id, project_id, user_id, name, layout, theme, filter_mode, min_rating, max_items, hide_branding')
      .eq('id', id)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // ── Check Pro status for display limit ────────────────────────────────────
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', widget.user_id)
      .single();
    const isPro = sub?.plan === 'pro';
    const hardLimit = isPro ? (widget.max_items ?? 12) : Math.min(widget.max_items ?? 12, 5);

    // ── Build testimonials query ──────────────────────────────────────────────
    let query = supabase
      .from('testimonials')
      .select('id, author_name, author_role, author_company, author_avatar_url, rating, content, enhanced_content, featured, source_url, golden_sentence, metric_label, created_at')
      .eq('project_id', widget.project_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(hardLimit);

    if (widget.filter_mode === 'featured') {
      query = query.eq('featured', true);
    } else if (widget.filter_mode === 'rating') {
      query = query.gte('rating', widget.min_rating ?? 4);
    }

    const { data: testimonials, error: testimonialError } = await query;

    if (testimonialError) {
      console.error('Error fetching testimonials for widget:', testimonialError);
      return NextResponse.json(
        { error: 'Failed to fetch testimonials' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    // ── Record widget view (non-blocking) ─────────────────────────────────────
    void supabase.from('widget_views').insert({ widget_id: widget.id });

    // ── Count total approved for free-tier truncation note ────────────────────
    let totalApproved = (testimonials ?? []).length;
    if (!isPro) {
      const { count } = await supabase
        .from('testimonials')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', widget.project_id)
        .eq('status', 'approved');
      totalApproved = count ?? totalApproved;
    }

    return NextResponse.json(
      {
        widget: {
          id: widget.id,
          name: widget.name,
          layout: widget.layout,
          theme: widget.theme,
          hideBranding: widget.hide_branding,
        },
        testimonials: testimonials ?? [],
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

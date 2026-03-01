import { ImageResponse } from 'next/og';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface PageProps {
  params: Promise<{ id: string }>;
}

function StarsSVG({ rating, color }: { rating: number; color: string }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill={i <= rating ? color : 'none'}
        stroke={i <= rating ? color : '#cbd5e1'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {stars}
    </div>
  );
}

export async function GET(_request: Request, { params }: PageProps) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const { data: testimonial } = await supabase
    .from('testimonials')
    .select('id, author_name, author_role, author_company, rating, content, project_id, status')
    .eq('id', id)
    .eq('status', 'approved')
    .single();

  if (!testimonial) {
    return new Response('Not found', { status: 404 });
  }

  const { data: project } = await supabase
    .from('projects')
    .select('name, accent_color')
    .eq('id', testimonial.project_id)
    .single();

  const accentColor = project?.accent_color ?? '#6366F1';
  const projectName = project?.name ?? '';

  const displayContent =
    testimonial.content.length > 220
      ? testimonial.content.slice(0, 220) + '...'
      : testimonial.content;

  const initials = testimonial.author_name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const authorLine = [testimonial.author_role, testimonial.author_company]
    .filter(Boolean)
    .join(', ');

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 80px',
          position: 'relative',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Left accent stripe */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundColor: accentColor,
          }}
        />

        {/* Decorative open-quote */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 80,
            fontSize: 180,
            lineHeight: 1,
            color: accentColor,
            opacity: 0.08,
            fontFamily: 'Georgia, serif',
          }}
        >
          &ldquo;
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', marginBottom: 32, position: 'relative' }}>
          <StarsSVG rating={testimonial.rating} color={accentColor} />
        </div>

        {/* Quote */}
        <div
          style={{
            fontSize: 36,
            lineHeight: 1.5,
            color: '#374151',
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            position: 'relative',
          }}
        >
          {displayContent}
        </div>

        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 40 }}>
          {/* Initials circle */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: `${accentColor}20`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
              {testimonial.author_name}
            </div>
            {authorLine && (
              <div style={{ fontSize: 16, color: '#6b7280' }}>
                {authorLine}
              </div>
            )}
            {projectName && (
              <div style={{ fontSize: 14, color: '#9ca3af' }}>
                {projectName}
              </div>
            )}
          </div>
        </div>

        {/* Bottom-right branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 80,
            fontSize: 14,
            color: '#d1d5db',
          }}
        >
          vouch.so
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

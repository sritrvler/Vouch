import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 10;

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface WidgetTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  cardStyle?: 'shadow' | 'border' | 'flat';
  showRating?: boolean;
  showAvatar?: boolean;
  showDate?: boolean;
  showSource?: boolean;
}

interface Widget {
  id: string;
  name: string;
  layout: 'grid' | 'carousel' | 'wall' | 'list' | 'single';
  theme: WidgetTheme;
  hide_branding: boolean;
}

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_avatar_url: string | null;
  rating: number;
  content: string;
  featured: boolean;
  source_url: string | null;
  golden_sentence: string | null;
  metric_label: string | null;
  video_url: string | null;
  email_domain: string | null;
  created_at: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function companyToDomain(company: string): string {
  return (
    company
      .toLowerCase()
      .replace(
        /\b(inc|llc|ltd|corp|co|company|technologies|tech|labs|group|solutions|services)\b\.?/gi,
        ''
      )
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 30) + '.com'
  );
}

// ─── Platform icons (inline SVG) ──────────────────────────────────────────

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.629 5.905-5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Stars ─────────────────────────────────────────────────────────────────

function Stars({ rating, color }: { rating: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((v) => (
        <svg
          key={v}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={v <= rating ? color : 'none'}
          stroke={v <= rating ? color : '#cbd5e1'}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ─── Avatar with company favicon fallback ─────────────────────────────────

function AvatarWithFavicon({
  name,
  avatarUrl,
  company,
  primaryColor,
}: {
  name: string;
  avatarUrl: string | null;
  company: string | null;
  primaryColor: string;
}) {
  const initials = getInitials(name);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  if (company) {
    const domain = companyToDomain(company);
    // Use dangerouslySetInnerHTML so we can include a native onerror attribute.
    // React server components cannot use the onError JSX prop, and a separate
    // script tag has timing issues inside iframes. The native onerror attribute
    // fires instantly and never misses.
    const safeInitials = initials.replace(/[<>"'&]/g, '');
    const safeDomain = domain.replace(/[<>"'&]/g, '');
    const safePrimary = primaryColor.replace(/[<>"'&]/g, '');
    return (
      <div
        style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}
        dangerouslySetInnerHTML={{
          __html: `<img src="https://logo.clearbit.com/${safeDomain}" alt="" onerror="this.style.display='none';var f=this.nextElementSibling;if(f)f.style.display='flex'" style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:#f8fafc;padding:4px;border:1px solid #f1f5f9;display:block"><div style="display:none;position:absolute;inset:0;width:36px;height:36px;border-radius:50%;background:${safePrimary}20;color:${safePrimary};font-size:12px;font-weight:700;align-items:center;justify-content:center">${safeInitials}</div>`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        backgroundColor: `${primaryColor}20`,
        color: primaryColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─── Testimonial card ──────────────────────────────────────────────────────

function TestimonialCard({
  testimonial,
  theme,
  compact = false,
}: {
  testimonial: Testimonial;
  theme: WidgetTheme;
  compact?: boolean;
}) {
  const primaryColor = theme.primaryColor || '#6366F1';
  const textColor = theme.textColor || '#0f172a';
  const bgColor = theme.backgroundColor || '#ffffff';
  const cardStyle = theme.cardStyle || 'shadow';

  const cardBorder =
    cardStyle === 'border' ? '1px solid #e2e8f0' : cardStyle === 'flat' ? 'none' : 'none';
  const cardShadow =
    cardStyle === 'shadow' ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' : 'none';

  const authorLine = [testimonial.author_role, testimonial.author_company]
    .filter(Boolean)
    .join(', ');

  // Golden sentence split
  const golden = testimonial.golden_sentence;
  const hasGolden = !!(golden && testimonial.content.includes(golden));
  const goldenIdx = hasGolden ? testimonial.content.indexOf(golden!) : -1;
  const beforeGolden = hasGolden ? testimonial.content.slice(0, goldenIdx) : '';
  const afterGolden = hasGolden ? testimonial.content.slice(goldenIdx + (golden?.length ?? 0)) : '';

  // Verification badge
  const src = testimonial.source_url;
  const isX = !!(src && (src.includes('twitter.com') || src.includes('x.com')));
  const isLinkedIn = !!(src && src.includes('linkedin.com'));
  const verifiedDate = new Date(testimonial.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <article
      style={{
        backgroundColor: bgColor,
        border: cardBorder,
        boxShadow: cardShadow,
        borderRadius: 14,
        padding: compact ? '14px 16px' : '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 10 : 14,
      }}
    >
      {/* Zone A: Identity */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {theme.showAvatar !== false && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <AvatarWithFavicon
              name={testimonial.author_name}
              avatarUrl={testimonial.author_avatar_url}
              company={testimonial.author_company}
              primaryColor={primaryColor}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: textColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {testimonial.author_name}
              </div>
              {authorLine && (
                <div
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {authorLine}
                </div>
              )}
              {testimonial.email_domain && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, fontSize: 10, fontWeight: 600, color: '#059669' }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
                  </svg>
                  {testimonial.email_domain}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification badge: top right */}
        {(isX || isLinkedIn) ? (
          <a
            href={src!}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flexShrink: 0, color: '#9ca3af', textDecoration: 'none' }}
          >
            {isX ? <XIcon /> : <LinkedInIcon />}
          </a>
        ) : (
          <div style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0, whiteSpace: 'nowrap' }}>
            &#10003; {verifiedDate}
          </div>
        )}
      </div>

      {/* Zone B: Quote */}
      <blockquote style={{ margin: 0, padding: 0 }}>
        <p data-vouch-quote="" style={{ fontSize: compact ? 13 : 14, lineHeight: 1.65, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' as const }}>
          &ldquo;
          {hasGolden ? (
            <>
              {beforeGolden && <span style={{ color: '#9ca3af' }}>{beforeGolden}</span>}
              <span style={{ color: textColor, fontWeight: 600 }}>{golden}</span>
              {afterGolden && <span style={{ color: '#9ca3af' }}>{afterGolden}</span>}
            </>
          ) : (
            <span style={{ color: '#374151' }}>{testimonial.content}</span>
          )}
          &rdquo;
        </p>
        <button
          data-vouch-read-more=""
          style={{ display: 'none', fontSize: 11, color: primaryColor, background: 'none', border: 'none', padding: '4px 0 0', cursor: 'pointer', fontWeight: 600 }}
        >
          Read more
        </button>
        <cite style={{ display: 'none' }}>{testimonial.author_name}</cite>
      </blockquote>

      {/* Zone C: Proof */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        {theme.showRating !== false && (
          <Stars rating={testimonial.rating} color={primaryColor} />
        )}
        {testimonial.metric_label && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: primaryColor,
              backgroundColor: `${primaryColor}15`,
              border: `1px solid ${primaryColor}30`,
              borderRadius: 999,
              padding: '2px 8px',
              whiteSpace: 'nowrap',
            }}
          >
            {testimonial.metric_label}
          </span>
        )}
        {theme.showDate !== false && (
          <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 'auto' }}>
            {formatDistanceToNow(new Date(testimonial.created_at), { addSuffix: true })}
          </span>
        )}
      </div>

      {/* Inline video player with first-frame thumbnail */}
      {testimonial.video_url && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={testimonial.video_url}
          controls
          preload="metadata"
          style={{ width: '100%', borderRadius: 8, marginTop: 8, display: 'block', background: '#000' }}
        />
      )}
    </article>
  );
}

// ─── Layouts ───────────────────────────────────────────────────────────────

function GridLayout({
  testimonials,
  theme,
}: {
  testimonials: Testimonial[];
  theme: WidgetTheme;
}) {
  return (
    <div style={{ columns: '280px', columnGap: 16, padding: 4 }}>
      {testimonials.map((t) => (
        <div key={t.id} style={{ breakInside: 'avoid', marginBottom: 16 }}>
          <TestimonialCard testimonial={t} theme={theme} />
        </div>
      ))}
    </div>
  );
}

function CarouselLayout({
  testimonials,
  theme,
}: {
  testimonials: Testimonial[];
  theme: WidgetTheme;
}) {
  return (
    <>
      <style>{`
        @keyframes vouch-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .vouch-carousel-track {
          animation: vouch-scroll 30s linear infinite;
        }
        .vouch-carousel-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div style={{ overflow: 'hidden', padding: '4px 0' }}>
        <div
          className="vouch-carousel-track"
          style={{
            display: 'flex',
            gap: 16,
            width: 'max-content',
          }}
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={`${t.id}-${i}`} style={{ width: 300, flexShrink: 0 }}>
              <TestimonialCard testimonial={t} theme={theme} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function WallLayout({
  testimonials,
  theme,
}: {
  testimonials: Testimonial[];
  theme: WidgetTheme;
}) {
  return (
    <div style={{ columns: 3, columnGap: 16, padding: 4 }}>
      {testimonials.map((t) => (
        <div key={t.id} style={{ breakInside: 'avoid', marginBottom: 16 }}>
          <TestimonialCard testimonial={t} theme={theme} compact />
        </div>
      ))}
    </div>
  );
}

function ListLayout({
  testimonials,
  theme,
}: {
  testimonials: Testimonial[];
  theme: WidgetTheme;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 4 }}>
      {testimonials.map((t) => (
        <TestimonialCard key={t.id} testimonial={t} theme={theme} compact />
      ))}
    </div>
  );
}

function SingleLayout({
  testimonials,
  theme,
}: {
  testimonials: Testimonial[];
  theme: WidgetTheme;
}) {
  const featured = testimonials.find((t) => t.featured) || testimonials[0];
  if (!featured) return null;

  const primaryColor = theme.primaryColor || '#6366F1';
  const textColor = theme.textColor || '#0f172a';
  const bgColor = theme.backgroundColor || '#ffffff';

  const authorLine = [featured.author_role, featured.author_company].filter(Boolean).join(', ');

  const golden = featured.golden_sentence;
  const hasGolden = !!(golden && featured.content.includes(golden));
  const goldenIdx = hasGolden ? featured.content.indexOf(golden!) : -1;
  const beforeGolden = hasGolden ? featured.content.slice(0, goldenIdx) : '';
  const afterGolden = hasGolden ? featured.content.slice(goldenIdx + (golden?.length ?? 0)) : '';

  const src = featured.source_url;
  const isX = !!(src && (src.includes('twitter.com') || src.includes('x.com')));
  const isLinkedIn = !!(src && src.includes('linkedin.com'));

  return (
    <article
      style={{
        backgroundColor: bgColor,
        borderRadius: 16,
        padding: 32,
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      {theme.showRating !== false && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Stars rating={featured.rating} color={primaryColor} />
        </div>
      )}
      <blockquote style={{ margin: '0 0 24px' }}>
        <p style={{ fontSize: 18, lineHeight: 1.7, fontStyle: 'italic', margin: 0, color: '#374151' }}>
          &ldquo;
          {hasGolden ? (
            <>
              {beforeGolden && <span style={{ color: '#9ca3af' }}>{beforeGolden}</span>}
              <span style={{ color: textColor, fontWeight: 600 }}>{golden}</span>
              {afterGolden && <span style={{ color: '#9ca3af' }}>{afterGolden}</span>}
            </>
          ) : (
            featured.content
          )}
          &rdquo;
        </p>
        <cite style={{ display: 'none' }}>{featured.author_name}</cite>
      </blockquote>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {theme.showAvatar !== false && (
          <AvatarWithFavicon
            name={featured.author_name}
            avatarUrl={featured.author_avatar_url}
            company={featured.author_company}
            primaryColor={primaryColor}
          />
        )}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: textColor }}>
            {featured.author_name}
          </div>
          {authorLine && (
            <div style={{ fontSize: 12, color: '#6b7280' }}>{authorLine}</div>
          )}
          {featured.metric_label && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: primaryColor,
                backgroundColor: `${primaryColor}15`,
                borderRadius: 999,
                padding: '2px 8px',
                display: 'inline-block',
                marginTop: 4,
              }}
            >
              {featured.metric_label}
            </span>
          )}
        </div>
        {src && (isX || isLinkedIn) && (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#9ca3af', marginLeft: 8, textDecoration: 'none' }}
          >
            {isX ? <XIcon /> : <LinkedInIcon />}
          </a>
        )}
      </div>
    </article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function EmbedPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: widget, error: widgetError } = await supabase
    .from('widgets')
    .select('id, project_id, user_id, name, layout, theme, filter_mode, min_rating, max_items, hide_branding')
    .eq('id', id)
    .single();

  if (widgetError || !widget) {
    return (
      <html>
        <body style={{ margin: 0, padding: 16, fontFamily: 'sans-serif' }}>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Widget not found.</p>
        </body>
      </html>
    );
  }

  // Check subscription via admin client (bypasses RLS for anonymous iframe visitors)
  const adminClient = createAdminClient();
  const { data: sub } = await adminClient
    .from('subscriptions')
    .select('plan, is_banned')
    .eq('user_id', widget.user_id)
    .single();

  if (sub?.is_banned) {
    return (
      <html>
        <body style={{ margin: 0, padding: 0 }} />
      </html>
    );
  }

  const isPro = sub?.plan === 'pro' || sub?.plan === 'agency';
  const hardLimit = isPro ? (widget.max_items ?? 12) : Math.min(widget.max_items ?? 12, 5);

  const typedWidget = widget as Widget;
  const theme = (typedWidget.theme || {}) as WidgetTheme;

  let query = supabase
    .from('testimonials')
    .select(
      'id, author_name, author_role, author_company, author_avatar_url, rating, content, featured, source_url, golden_sentence, metric_label, video_url, email_domain, created_at'
    )
    .eq('project_id', widget.project_id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(hardLimit);

  if (widget.filter_mode === 'featured') {
    query = query.eq('featured', true);
  } else if (widget.filter_mode === 'rating') {
    query = query.gte('rating', widget.min_rating ?? 4);
  }

  const { data: testimonials } = await query;
  const typedTestimonials = (testimonials ?? []) as Testimonial[];

  // Free-tier: count total approved for truncation note
  let totalApproved = 0;
  if (!isPro) {
    const { count } = await supabase
      .from('testimonials')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', widget.project_id)
      .eq('status', 'approved');
    totalApproved = count ?? 0;
  }

  // Fetch project slug for "See all" link (free tier only)
  let projectSlug: string | null = null;
  if (!isPro && totalApproved > 5) {
    const { data: proj } = await supabase
      .from('projects')
      .select('slug')
      .eq('id', widget.project_id)
      .single();
    projectSlug = proj?.slug ?? null;
  }

  // Record widget view (non-blocking)
  void supabase.from('widget_views').insert({ widget_id: widget.id });

  const bg = theme.backgroundColor || '#ffffff';
  const textColor = theme.textColor || '#0f172a';

  function renderLayout() {
    switch (typedWidget.layout) {
      case 'carousel':
        return <CarouselLayout testimonials={typedTestimonials} theme={theme} />;
      case 'wall':
        return <WallLayout testimonials={typedTestimonials} theme={theme} />;
      case 'list':
        return <ListLayout testimonials={typedTestimonials} theme={theme} />;
      case 'single':
        return <SingleLayout testimonials={typedTestimonials} theme={theme} />;
      default:
        return <GridLayout testimonials={typedTestimonials} theme={theme} />;
    }
  }

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: ${bg};
            color: ${textColor};
            padding: 8px;
            -webkit-font-smoothing: antialiased;
          }
        `}</style>
      </head>
      <body>
        {typedTestimonials.length === 0 ? (
          <p
            style={{
              color: '#94a3b8',
              fontSize: 14,
              textAlign: 'center',
              padding: '32px 16px',
            }}
          >
            No testimonials yet.
          </p>
        ) : (
          renderLayout()
        )}

        {/* Free-tier truncation note */}
        {!isPro && totalApproved > 5 && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid #f1f5f9',
              fontSize: 11,
              color: '#94a3b8',
            }}
          >
            Showing 5 of {totalApproved} reviews
            {projectSlug && (
              <>
                {' '}
                &mdash;{' '}
                <a
                  href={`/p/${projectSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#94a3b8', textDecoration: 'underline' }}
                >
                  See all
                </a>
              </>
            )}
          </div>
        )}

        {!typedWidget.hide_branding && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <a
              href="/via"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none' }}
            >
              Powered by Vouch
            </a>
          </div>
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Auto-resize
              function sendHeight() {
                window.parent.postMessage({ height: document.body.scrollHeight }, '*');
              }
              sendHeight();
              window.addEventListener('resize', sendHeight);
              setTimeout(sendHeight, 500);
              setTimeout(sendHeight, 1500);

              // Read more expander, only show button when quote is actually clamped
              window.addEventListener('load', function() {
                document.querySelectorAll('[data-vouch-quote]').forEach(function(p) {
                  if (p.scrollHeight > p.clientHeight + 2) {
                    var btn = p.parentNode.querySelector('[data-vouch-read-more]');
                    if (btn) {
                      btn.style.display = 'inline-block';
                      btn.addEventListener('click', function() {
                        p.style.overflow = 'visible';
                        p.style.display = 'block';
                        p.style.webkitLineClamp = 'unset';
                        btn.style.display = 'none';
                        sendHeight();
                      });
                    }
                  }
                });
              });

            `,
          }}
        />
      </body>
    </html>
  );
}

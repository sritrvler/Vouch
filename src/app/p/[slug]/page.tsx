import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';
import { Star, ExternalLink, Play } from 'lucide-react';
import Link from 'next/link';
import { resolveFontUrl, sanitizeFontFamily } from '@/lib/fonts';

export const revalidate = 60;

// ─── Helpers ───────────────────────────────────────────────────────────────

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('slug', slug)
    .single();

  if (!project) {
    return { title: 'Testimonials' };
  }

  return {
    title: `${project.name} | Customer Reviews`,
    description: `See what customers are saying about ${project.name}.`,
  };
}

export default async function PublicTestimonialsPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch project by slug
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, logo_url, accent_color, form_bg_color, button_color, text_color, font_family, font_url, website, user_id')
    .eq('slug', slug)
    .single();

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-sm text-gray-500">This testimonial page does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Ban check via admin client
  const adminClient = createAdminClient();
  const { data: ownerSub } = await adminClient
    .from('subscriptions')
    .select('is_banned')
    .eq('user_id', project.user_id)
    .single();

  if (ownerSub?.is_banned) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Page unavailable</h1>
          <p className="text-sm text-gray-500">This testimonial page is no longer available.</p>
        </div>
      </div>
    );
  }

  // Fetch most recently updated widget for theme/ordering sync
  const { data: widget } = await supabase
    .from('widgets')
    .select('theme, pinned_ids, filter_mode, min_rating, max_items')
    .eq('project_id', project.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch active collection form for this project
  const { data: form } = await supabase
    .from('collection_forms')
    .select('id')
    .eq('project_id', project.id)
    .eq('is_active', true)
    .limit(1)
    .single();

  // Fetch approved testimonials
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('id, author_name, author_role, author_company, author_avatar_url, content, rating, featured, golden_sentence, metric_label, source_url, video_url, video_thumbnail_url, email_domain, created_at')
    .eq('project_id', project.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50);

  // Apply widget pinned_ids ordering
  let displayTestimonials = testimonials ?? [];
  const pinnedIds: string[] = Array.isArray(widget?.pinned_ids) ? (widget.pinned_ids as string[]) : [];
  if (pinnedIds.length > 0) {
    const idxMap = new Map(pinnedIds.map((id: string, i: number) => [id, i]));
    displayTestimonials = [...displayTestimonials].sort((a, b) => {
      const ai = idxMap.get(a.id) ?? Infinity;
      const bi = idxMap.get(b.id) ?? Infinity;
      return ai - bi;
    });
  }

  // Apply widget filtering
  if (widget?.filter_mode === 'featured') {
    displayTestimonials = displayTestimonials.filter((t: any) => t.featured);
  } else if (widget?.filter_mode === 'rating' && widget?.min_rating) {
    displayTestimonials = displayTestimonials.filter((t: any) => (t.rating ?? 0) >= widget.min_rating);
  }
  if (widget?.max_items) {
    displayTestimonials = displayTestimonials.slice(0, widget.max_items);
  }

  const avgRating =
    displayTestimonials.length > 0
      ? displayTestimonials.reduce((sum, t) => sum + (t.rating ?? 0), 0) / displayTestimonials.length
      : 0;

  // Derive colors from widget theme, falling back to project colors
  const theme = widget?.theme as Record<string, any> | null;
  const accentColor = theme?.primaryColor || project.button_color || project.accent_color || '#4f46e5';
  const textColor = theme?.textColor || project.text_color || '#1a1a1a';
  const cardColor = theme?.cardColor || '#ffffff';
  const backgroundColor = theme?.backgroundColor || '#f9fafb';
  const cardStyle: string = theme?.cardStyle || 'shadow';
  const ts: string = theme?.textSize || 'compact';
  const quoteSize = ts === 'large' ? 17 : ts === 'default' ? 15 : 14;
  const nameSize = ts === 'large' ? 14 : ts === 'default' ? 14 : 13;
  const roleSize = ts === 'large' ? 12 : ts === 'default' ? 12 : 11;
  const fontFamily = sanitizeFontFamily(theme?.fontFamily) || sanitizeFontFamily(project.font_family);
  const fontStyleUrl = resolveFontUrl(theme?.fontFamily, theme?.fontUrl) || resolveFontUrl(project.font_family, project.font_url);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: project.name,
    ...(project.website ? { url: project.website } : {}),
    ...(displayTestimonials.length > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating.toFixed(1),
            bestRating: '5',
            worstRating: '1',
            ratingCount: displayTestimonials.length,
          },
        }
      : {}),
    review: displayTestimonials.slice(0, 10).map((t) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(t.rating ?? 5),
        bestRating: '5',
      },
      author: { '@type': 'Person', name: t.author_name },
      reviewBody: t.content,
      datePublished: new Date(t.created_at).toISOString().split('T')[0],
    })),
  };

  return (
    <>
    {fontStyleUrl && (
      <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={fontStyleUrl} />
      </>
    )}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div
      className="min-h-screen"
      style={{
        backgroundColor,
        ...(fontFamily ? { fontFamily: `"${fontFamily}", sans-serif` } : {}),
      }}
    >
      {/* Header: accent-tinted gradient with decorative quotation mark */}
      <div
        className="border-b border-black/5"
        style={{
          background: `linear-gradient(160deg, ${accentColor}22 0%, ${accentColor}0c 55%, #ffffff 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14 text-center relative overflow-hidden">
          {/* Decorative large quotation mark */}
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2 font-serif text-[180px] leading-none pointer-events-none select-none"
            style={{ color: accentColor, opacity: 0.07 }}
            aria-hidden="true"
          >
            &ldquo;
          </div>

          {/* Logo / Avatar */}
          {project.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.logo_url}
              alt={project.name}
              className="h-14 w-auto mx-auto mb-4 rounded-xl object-contain"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-md"
              style={{ backgroundColor: accentColor }}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{project.name}</h1>
          {project.website && (
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              {project.website.replace(/^https?:\/\//, '')}
            </a>
          )}

          {displayTestimonials.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4"
                    fill={star <= Math.round(avgRating) ? accentColor : 'none'}
                    stroke={star <= Math.round(avgRating) ? accentColor : '#d1d5db'}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">
                from {displayTestimonials.length} review{displayTestimonials.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Testimonials grid */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {displayTestimonials.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No reviews yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {displayTestimonials.map((t) => {
              const initials = t.author_name
                .split(' ')
                .slice(0, 2)
                .map((w: string) => w[0])
                .join('')
                .toUpperCase();

              // Golden sentence split
              const golden = (t as { golden_sentence?: string | null }).golden_sentence ?? null;
              const hasGolden = !!(golden && t.content.includes(golden));
              const goldenIdx = hasGolden ? t.content.indexOf(golden!) : -1;
              const beforeGolden = hasGolden ? t.content.slice(0, goldenIdx) : '';
              const afterGolden = hasGolden ? t.content.slice(goldenIdx + (golden?.length ?? 0)) : '';

              const metricLabel = (t as { metric_label?: string | null }).metric_label ?? null;
              const sourceUrl = (t as { source_url?: string | null }).source_url ?? null;
              const videoUrl = (t as { video_url?: string | null }).video_url ?? null;
              const videoThumbnailUrl = (t as { video_thumbnail_url?: string | null }).video_thumbnail_url ?? null;
              const emailDomain = (t as { email_domain?: string | null }).email_domain ?? null;
              const isX = !!(sourceUrl && (sourceUrl.includes('twitter.com') || sourceUrl.includes('x.com')));
              const isLinkedIn = !!(sourceUrl && sourceUrl.includes('linkedin.com'));

              const companyDomain = t.author_company ? companyToDomain(t.author_company) : null;
              const verifiedDate = new Date(t.created_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              });

              return (
                <article
                  key={t.id}
                  data-vouch-card=""
                  data-card-content={t.content}
                  data-card-author={t.author_name}
                  data-card-role={[t.author_role, t.author_company].filter(Boolean).join(', ')}
                  data-card-rating={String(t.rating ?? '')}
                  className={`rounded-2xl flex flex-col overflow-hidden${
                    cardStyle === 'border' ? ' border border-gray-200' :
                    cardStyle === 'flat' ? '' :
                    ' border border-gray-100 shadow-sm'
                  }`}
                  style={{
                    backgroundColor: cardColor,
                    ...(t.featured ? { borderLeft: `3px solid ${accentColor}` } : {}),
                  }}
                >
                  <div className="p-5 flex flex-col gap-3">
                    {/* Zone C: Stars + metric (TOP) */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.rating != null && (
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-3.5 h-3.5"
                              fill={star <= t.rating! ? accentColor : 'none'}
                              stroke={star <= t.rating! ? accentColor : '#d1d5db'}
                            />
                          ))}
                        </div>
                      )}
                      {metricLabel && (
                        <span
                          className="text-[10px] font-semibold rounded-full px-2 py-0.5 border whitespace-nowrap"
                          style={{
                            color: accentColor,
                            backgroundColor: `${accentColor}15`,
                            borderColor: `${accentColor}30`,
                          }}
                        >
                          {metricLabel}
                        </span>
                      )}
                    </div>

                    {/* Zone B: Quote (MIDDLE) */}
                    <blockquote className="flex-1">
                      <p data-vouch-quote="" className="leading-relaxed line-clamp-6" style={{ fontSize: quoteSize }}>
                        &ldquo;
                        {hasGolden ? (
                          <>
                            {beforeGolden && <span style={{ color: `${textColor}99` }}>{beforeGolden}</span>}
                            <span className="font-semibold" style={{ color: textColor }}>{golden}</span>
                            {afterGolden && <span style={{ color: `${textColor}99` }}>{afterGolden}</span>}
                          </>
                        ) : (
                          <span style={{ color: textColor }}>{t.content}</span>
                        )}
                        &rdquo;
                      </p>
                      <button
                        data-vouch-read-more=""
                        className="hidden text-xs font-semibold mt-1 bg-transparent border-0 p-0 cursor-pointer"
                        style={{ color: accentColor }}
                      >
                        Read more
                      </button>
                      <cite className="sr-only">{t.author_name}</cite>
                    </blockquote>

                    {/* Zone A: Identity (BOTTOM) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Avatar / favicon / initials */}
                        {t.author_avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.author_avatar_url}
                            alt={t.author_name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : companyDomain ? (
                          <div
                            className="relative w-9 h-9 flex-shrink-0"
                            dangerouslySetInnerHTML={{
                              __html: `<img src="https://logo.clearbit.com/${companyDomain.replace(/[<>"'&]/g, '')}" alt="" onerror="this.style.display='none';var f=this.nextElementSibling;if(f)f.style.display='flex'" style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:#f9fafb;padding:4px;border:1px solid #f3f4f6;display:block"><div style="display:none;position:absolute;inset:0;width:36px;height:36px;border-radius:50%;background:${accentColor.replace(/[<>"'&]/g, '')}20;color:${accentColor.replace(/[<>"'&]/g, '')};font-size:12px;font-weight:700;align-items:center;justify-content:center">${initials.replace(/[<>"'&]/g, '')}</div>`,
                            }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                          >
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold truncate" style={{ fontSize: nameSize, color: textColor }}>{t.author_name}</p>
                          {(t.author_role || t.author_company) && (
                            <p className="leading-snug" style={{ fontSize: roleSize, color: `${textColor}99` }}>
                              {[t.author_role, t.author_company].filter(Boolean).join(', ')}
                            </p>
                          )}
                          {emailDomain && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 mt-0.5">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
                              </svg>
                              {emailDomain}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Verification badge */}
                      {(isX || isLinkedIn) ? (
                        <a
                          href={sourceUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={isX ? 'Verified on X' : 'Verified on LinkedIn'}
                        >
                          {isX ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.629 5.905-5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          )}
                        </a>
                      ) : sourceUrl ? (
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Verified source"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-400 flex-shrink-0 whitespace-nowrap">
                          &#10003; {verifiedDate}
                        </span>
                      )}
                    </div>

                    {/* Video thumbnail with play overlay */}
                    {videoUrl && (
                      <div className="pt-2 border-t border-gray-100">
                        <div
                          data-vouch-play=""
                          data-video-url={videoUrl}
                          data-video-poster={videoThumbnailUrl || ''}
                          className="relative rounded-xl overflow-hidden cursor-pointer group"
                          role="button"
                          aria-label="Play video testimonial"
                        >
                          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                          <video
                            src={videoUrl}
                            poster={videoThumbnailUrl || undefined}
                            preload="metadata"
                            muted
                            className="w-full block"
                            style={{ maxHeight: '160px', objectFit: 'cover', pointerEvents: 'none' }}
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200"
                              style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
                            >
                              <Play className="w-4 h-4 ml-0.5" style={{ fill: accentColor, color: accentColor }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>


      {/* Video modal overlay */}
      <div
        id="vouch-video-modal"
        style={{
          display: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(0,0,0,0.85)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
          <button
            id="vouch-video-modal-close"
            style={{
              position: 'absolute',
              top: '-44px',
              right: '0',
              color: 'white',
              fontSize: '28px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              lineHeight: '1',
              padding: '4px 8px',
            }}
          >
            &times;
          </button>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            id="vouch-video-player"
            controls
            style={{ width: '100%', borderRadius: '12px', background: 'black', display: 'block' }}
          />
        </div>
      </div>

      {/* Read more modal overlay */}
      <div
        id="vouch-read-modal"
        style={{
          display: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '80vh',
            overflowY: 'auto',
            borderRadius: '16px',
            padding: '28px',
            backgroundColor: cardColor,
          }}
        >
          <button
            id="vouch-read-modal-close"
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              color: '#9ca3af',
              fontSize: '22px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              lineHeight: '1',
              padding: '4px',
            }}
            aria-label="Close"
          >
            &times;
          </button>
          <div id="vouch-read-modal-stars" style={{ marginBottom: '12px' }}></div>
          <p id="vouch-read-modal-content" style={{ fontSize: quoteSize, lineHeight: '1.7', color: textColor }}></p>
          <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
            <p id="vouch-read-modal-author" style={{ fontWeight: 700, fontSize: nameSize, color: textColor }}></p>
            <p id="vouch-read-modal-role" style={{ fontSize: roleSize, color: `${textColor}99` }}></p>
          </div>
        </div>
      </div>

      {/* Read more expander + video modal */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              var readModal = document.getElementById('vouch-read-modal');
              var readContent = document.getElementById('vouch-read-modal-content');
              var readAuthor = document.getElementById('vouch-read-modal-author');
              var readRole = document.getElementById('vouch-read-modal-role');
              var readStars = document.getElementById('vouch-read-modal-stars');
              var readClose = document.getElementById('vouch-read-modal-close');
              var accentColor = '${accentColor.replace(/'/g, "\\'")}';

              function openReadModal(card) {
                if (!readModal || !readContent) return;
                var content = card.getAttribute('data-card-content') || '';
                var author = card.getAttribute('data-card-author') || '';
                var role = card.getAttribute('data-card-role') || '';
                var rating = parseInt(card.getAttribute('data-card-rating'));
                readContent.textContent = '\\u201C' + content + '\\u201D';
                readAuthor.textContent = author;
                readRole.textContent = role;
                if (readStars) {
                  readStars.innerHTML = '';
                  if (rating > 0) {
                    for (var s = 1; s <= 5; s++) {
                      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                      svg.setAttribute('width', '16');
                      svg.setAttribute('height', '16');
                      svg.setAttribute('viewBox', '0 0 24 24');
                      svg.setAttribute('fill', s <= rating ? accentColor : 'none');
                      svg.setAttribute('stroke', s <= rating ? accentColor : '#d1d5db');
                      svg.setAttribute('stroke-width', '2');
                      svg.innerHTML = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>';
                      svg.style.display = 'inline-block';
                      svg.style.marginRight = '2px';
                      readStars.appendChild(svg);
                    }
                  }
                }
                readModal.style.display = 'flex';
              }

              function closeReadModal() {
                if (readModal) readModal.style.display = 'none';
              }

              if (readClose) readClose.addEventListener('click', closeReadModal);
              if (readModal) readModal.addEventListener('click', function(e) {
                if (e.target === readModal) closeReadModal();
              });

              document.querySelectorAll('[data-vouch-quote]').forEach(function(p) {
                if (p.scrollHeight > p.clientHeight + 2) {
                  var btn = p.parentNode.querySelector('[data-vouch-read-more]');
                  if (btn) {
                    btn.classList.remove('hidden');
                    btn.classList.add('inline-block');
                    btn.addEventListener('click', function() {
                      var card = btn.closest('[data-vouch-card]');
                      if (card) openReadModal(card);
                    });
                  }
                }
              });

              document.querySelectorAll('[data-vouch-play]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                  var url = btn.getAttribute('data-video-url');
                  var poster = btn.getAttribute('data-video-poster');
                  var modal = document.getElementById('vouch-video-modal');
                  var video = document.getElementById('vouch-video-player');
                  if (modal && video && url) {
                    video.src = url;
                    video.poster = poster || '';
                    modal.style.display = 'flex';
                    video.play();
                  }
                });
              });

              var modalClose = document.getElementById('vouch-video-modal-close');
              var modalEl = document.getElementById('vouch-video-modal');
              if (modalClose && modalEl) {
                modalClose.addEventListener('click', function() {
                  var video = document.getElementById('vouch-video-player');
                  if (video) { video.pause(); video.src = ''; }
                  modalEl.style.display = 'none';
                });
                modalEl.addEventListener('click', function(e) {
                  if (e.target === modalEl) {
                    var video = document.getElementById('vouch-video-player');
                    if (video) { video.pause(); video.src = ''; }
                    modalEl.style.display = 'none';
                  }
                });
              }
            });
          `,
        }}
      />

      {/* Leave a review CTA */}
      {form && (
        <div className="pb-10 text-center px-4">
          <Link
            href={`/c/${form.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white border shadow-md px-6 py-3 text-sm font-semibold text-gray-700 hover:shadow-lg transition-all hover:-translate-y-0.5"
            style={{ borderColor: `${accentColor}40` }}
          >
            <Star className="w-4 h-4" style={{ fill: accentColor, color: accentColor }} />
            Leave your own review
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="pb-10 text-center">
        <a
          href="/via"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Powered by{' '}
          <span className="font-semibold">Vouch</span>
        </a>
      </div>
    </div>
    </>
  );
}

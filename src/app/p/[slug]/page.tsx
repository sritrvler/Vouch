import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';

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
    title: `${project.name} — Customer Reviews`,
    description: `See what customers are saying about ${project.name}.`,
  };
}

export default async function PublicTestimonialsPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch project by slug
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, logo_url, accent_color, website')
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
    .select('id, author_name, author_role, author_company, author_avatar_url, content, rating, golden_sentence, metric_label, source_url, created_at')
    .eq('project_id', project.id)
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  const displayTestimonials = testimonials ?? [];
  const avgRating =
    displayTestimonials.length > 0
      ? displayTestimonials.reduce((sum, t) => sum + (t.rating ?? 0), 0) / displayTestimonials.length
      : 0;

  const accentColor = project.accent_color ?? '#4f46e5';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — accent-tinted gradient with decorative quotation mark */}
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

      {/* Testimonials — CSS columns masonry */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {displayTestimonials.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No reviews yet.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
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
                  className="break-inside-avoid mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden"
                >
                  {/* Accent top line */}
                  <div
                    className="h-0.5 w-full shrink-0"
                    style={{ backgroundColor: accentColor }}
                  />

                  <div className="p-5 flex flex-col gap-3">
                    {/* Zone A: Identity */}
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
                          <p className="text-xs font-bold text-gray-900 truncate">{t.author_name}</p>
                          {(t.author_role || t.author_company) && (
                            <p className="text-xs text-gray-500 truncate">
                              {[t.author_role, t.author_company].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Verification badge — top right */}
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

                    {/* Zone B: Quote */}
                    <blockquote className="flex-1">
                      <p data-vouch-quote="" className="text-sm leading-relaxed line-clamp-6">
                        &ldquo;
                        {hasGolden ? (
                          <>
                            {beforeGolden && <span className="text-gray-400">{beforeGolden}</span>}
                            <span className="font-semibold text-gray-900">{golden}</span>
                            {afterGolden && <span className="text-gray-400">{afterGolden}</span>}
                          </>
                        ) : (
                          <span className="text-gray-700">{t.content}</span>
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

                    {/* Zone C: Stars + metric */}
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
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>


      {/* Read more expander */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              document.querySelectorAll('[data-vouch-quote]').forEach(function(p) {
                if (p.scrollHeight > p.clientHeight + 2) {
                  var btn = p.parentNode.querySelector('[data-vouch-read-more]');
                  if (btn) {
                    btn.classList.remove('hidden');
                    btn.classList.add('inline-block');
                    btn.addEventListener('click', function() {
                      p.classList.remove('line-clamp-6');
                      btn.style.display = 'none';
                    });
                  }
                }
              });
            });
          `,
        }}
      />

      {/* Leave a review CTA */}
      {form && (
        <div className="pb-8 text-center px-4">
          <Link
            href={`/c/${form.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white border shadow-sm px-5 py-3 text-sm font-medium text-gray-700 hover:shadow-md transition-all"
            style={{ borderColor: `${accentColor}50` }}
          >
            <Star className="w-4 h-4" style={{ color: accentColor }} />
            Share your experience with {project.name}
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="pb-10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-gray-500 transition-colors"
        >
          Powered by Vouch
        </Link>
      </div>
    </div>
  );
}

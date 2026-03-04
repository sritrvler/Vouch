import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Star } from 'lucide-react';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('report_token', token)
    .single();

  return {
    title: project ? `${project.name} | Testimonial Report` : 'Testimonial Report',
    robots: 'noindex',
  };
}

export default async function ClientReportPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, logo_url, accent_color, button_color, text_color')
    .eq('report_token', token)
    .single();

  if (!project) return notFound();

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('id, author_name, author_role, author_company, author_avatar_url, rating, content, created_at')
    .eq('project_id', project.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  const accent = project.button_color || project.accent_color || '#6366F1';
  const reportTextColor = project.text_color || '#1a1a1a';
  const total = testimonials?.length ?? 0;
  const avgRating = total > 0
    ? (testimonials!.reduce((sum, t) => sum + t.rating, 0) / total).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {project.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.logo_url}
                alt={project.name}
                className="h-8 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-base font-bold text-gray-900">{project.name}</h1>
              <p className="text-xs text-gray-400">Testimonial report</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 shrink-0">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{total}</div>
              <div className="text-xs">approved</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{avgRating}</div>
              <div className="text-xs">avg rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {total === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-base">No approved testimonials yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {testimonials!.map((t) => {
              const initials = t.author_name
                .split(' ')
                .map((w: string) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              const roleCompany = [t.author_role, t.author_company].filter(Boolean).join(' · ');

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                  style={{ borderLeftWidth: 3, borderLeftColor: accent }}
                >
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`size-3.5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-gray-200'}`}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-relaxed mb-4" style={{ color: reportTextColor }}>{t.content}</p>

                  {/* Author */}
                  <div className="flex items-center gap-2.5">
                    {t.author_avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.author_avatar_url}
                        alt={t.author_name}
                        className="size-8 rounded-full object-cover border border-gray-100"
                      />
                    ) : (
                      <div
                        className="size-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                        style={{ backgroundColor: accent }}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: reportTextColor }}>{t.author_name}</p>
                      {roleCompany && (
                        <p className="text-xs truncate" style={{ color: `${reportTextColor}99` }}>{roleCompany}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs text-gray-300">
        Powered by Vouch
      </div>
    </div>
  );
}

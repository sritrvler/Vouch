import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import CollectFormClient from '@/components/collect/CollectFormClient';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ formId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { formId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: form } = await supabase
    .from('collection_forms')
    .select('title, projects(name)')
    .eq('id', formId)
    .eq('is_active', true)
    .single();

  if (!form) {
    return { title: 'Share your feedback' };
  }

  const projectsData = form.projects as { name: string } | { name: string }[] | null;
  const projectName = (Array.isArray(projectsData) ? projectsData[0]?.name : projectsData?.name) ?? '';

  return {
    title: `${form.title} | ${projectName}`,
    description: `Share your experience with ${projectName}`,
  };
}

export default async function CollectPage({ params }: PageProps) {
  const { formId } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch form + project in a single query
  const { data: form, error } = await supabase
    .from('collection_forms')
    .select(`
      id,
      title,
      description,
      prompt,
      custom_questions,
      is_active,
      projects (
        id,
        name,
        logo_url,
        accent_color,
        form_bg_color,
        button_color,
        text_color,
        input_color,
        font_family,
        font_url,
        google_review_url,
        linkedin_url,
        user_id
      )
    `)
    .eq('id', formId)
    .single();

  // 404: form not found or inactive
  if (error || !form || !form.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            This form is no longer available
          </h1>
          <p className="text-sm text-muted-foreground">
            The testimonial collection link you followed is inactive or doesn&apos;t exist.
            Please contact the business that sent you this link.
          </p>
        </div>
      </div>
    );
  }

  type ProjectShape = {
    id: string;
    name: string;
    logo_url: string | null;
    accent_color: string | null;
    form_bg_color: string | null;
    button_color: string | null;
    text_color: string | null;
    input_color: string | null;
    font_family: string | null;
    font_url: string | null;
    google_review_url: string | null;
    linkedin_url: string | null;
    user_id: string;
  };
  const rawProject = form.projects as ProjectShape | ProjectShape[] | null;
  const project: ProjectShape | null = Array.isArray(rawProject) ? (rawProject[0] ?? null) : rawProject;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-muted-foreground">Something went wrong. Please try again later.</p>
      </div>
    );
  }

  // Check subscription plan + ban status via admin client (bypasses RLS for public visitors)
  const adminClient = createAdminClient();
  const { data: subscription } = await adminClient
    .from('subscriptions')
    .select('plan, is_banned')
    .eq('user_id', project.user_id)
    .single();

  if (subscription?.is_banned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">This form is no longer available</h1>
          <p className="text-sm text-muted-foreground">
            This testimonial collection link has been suspended. Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'agency';
  const showBranding = subscription?.plan === 'free' || !subscription;

  return (
    <CollectFormClient
      form={{
        id: form.id,
        title: form.title,
        description: form.description,
        prompt: form.prompt || 'What did you love? What stood out?',
        custom_questions: form.custom_questions,
      }}
      project={{
        id: project.id,
        name: project.name,
        logo_url: project.logo_url,
        accent_color: project.accent_color,
        form_bg_color: project.form_bg_color,
        button_color: project.button_color,
        text_color: project.text_color,
        input_color: project.input_color,
        font_family: project.font_family,
        font_url: project.font_url,
        // Google Review + LinkedIn nudges are Pro features
        google_review_url: isPro ? project.google_review_url : null,
        linkedin_url: isPro ? project.linkedin_url : null,
      }}
      showBranding={showBranding}
    />
  );
}

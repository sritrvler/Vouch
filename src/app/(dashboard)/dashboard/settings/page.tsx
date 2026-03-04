'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  User,
  Building2,
  CreditCard,
  Save,
  Loader2,
  ExternalLink,
  Lock,
  Upload,
  Zap,
  Check,
  Mail,
  Globe,
  Star,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  X,
  Linkedin,
  Copy,
  RefreshCw,
  Link2,
  Type,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useProject } from '@/context/ProjectContext';
import { GOOGLE_FONTS, sanitizeFontUrl, sanitizeFontFamily, resolveFontUrl } from '@/lib/fonts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
  slug: string | null;
  website: string | null;
  google_review_url: string | null;
  linkedin_url: string | null;
  logo_url: string | null;
  accent_color: string;
  form_bg_color: string | null;
  button_color: string | null;
  text_color: string | null;
  font_family: string | null;
  font_url: string | null;
  report_token: string | null;
}

interface Subscription {
  plan: 'free' | 'pro' | 'agency';
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

// ─── Color Presets ────────────────────────────────────────────────────────────
const ACCENT_PRESETS = [
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Violet', value: '#8B5CF6' },
  { label: 'Rose', value: '#F43F5E' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Sky', value: '#0EA5E9' },
];

// ─── Pro Features List ────────────────────────────────────────────────────────
const PRO_FEATURES = [
  'Unlimited forms and embed widgets',
  'Unlimited video testimonials',
  'Google Review and LinkedIn nudges',
  'Image cards for social sharing',
  'Carousel, wall of love, and list layouts',
  'React component embed',
  'CSV export of testimonials',
  'Custom public page address',
  'Remove Vouch branding',
  'Email support',
];

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, description, children, className }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-2xl border border-border p-6', className)}>
      <div className="mb-5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function SettingsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-border p-6">
          <div className="h-4 w-32 rounded bg-muted mb-5" />
          <div className="space-y-3">
            <div className="h-9 w-full rounded-xl bg-muted" />
            <div className="h-9 w-full rounded-xl bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsInner />
    </Suspense>
  );
}

function SettingsInner() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { projects, selectedProject, selectedProjectId, plan, refetchProjects, switchProject, loading: projectsLoading } = useProject();

  // ── Auth state ─────────────────────────────────────────────────────────────
  const [userEmail, setUserEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // ── Project state ──────────────────────────────────────────────────────────
  const [project, setProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [projectWebsite, setProjectWebsite] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#6366F1');
  const [formBgColor, setFormBgColor] = useState('#ffffff');
  const [buttonColor, setButtonColor] = useState('');
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const [fontUrl, setFontUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [slugCopied, setSlugCopied] = useState(false);
  const [reportToken, setReportToken] = useState<string | null>(null);
  const [reportCopied, setReportCopied] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // ── Billing state ──────────────────────────────────────────────────────────
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(false);

  // ── Active tab (URL-driven) ────────────────────────────────────────────────
  const tabParam = searchParams.get('tab');
  const isNewProject = searchParams.get('new') === 'true';
  const initialTab = tabParam === 'billing' || searchParams.get('upgrade') === 'success'
    ? 'billing'
    : tabParam === 'project'
      ? 'project'
      : 'general';
  const [activeTab, setActiveTab] = useState(initialTab);

  // ── Upgrade success toast ──────────────────────────────────────────────────
  useEffect(() => {
    if (searchParams.get('upgrade') === 'success') {
      toast.success("You're now on Pro. Welcome to the next level.");
      // Clean the param from the URL without a full navigation
      const url = new URL(window.location.href);
      url.searchParams.delete('upgrade');
      router.replace(url.pathname + (url.search || ''));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync project fields from context when selectedProject changes ─────────
  useEffect(() => {
    if (isNewProject) {
      // Create mode: clear all fields
      setProject(null);
      setProjectName('');
      setProjectSlug('');
      setProjectWebsite('');
      setGoogleReviewUrl('');
      setLinkedinUrl('');
      setAccentColor('#6366F1');
      setFormBgColor('#ffffff');
      setButtonColor('');
      setTextColor('#1a1a1a');
      setFontFamily(null);
      setFontUrl(null);
      setLogoPreview(null);
      setReportToken(null);
      return;
    }
    if (selectedProject) {
      const p = selectedProject;
      setProject(p);
      setProjectName(p.name);
      setProjectSlug(p.slug ?? '');
      setProjectWebsite(p.website ?? '');
      setGoogleReviewUrl(p.google_review_url ?? '');
      setLinkedinUrl(p.linkedin_url ?? '');
      setAccentColor(p.accent_color ?? '#6366F1');
      setFormBgColor(p.form_bg_color ?? '#ffffff');
      setButtonColor(p.button_color ?? '');
      setTextColor(p.text_color ?? '#1a1a1a');
      setFontFamily(p.font_family ?? null);
      setFontUrl(p.font_url ?? null);
      setLogoPreview(p.logo_url);
      setReportToken(p.report_token ?? null);
    } else if (!projectsLoading) {
      // No projects at all: clear fields for create mode
      setProject(null);
      setProjectName('');
      setProjectSlug('');
      setProjectWebsite('');
      setGoogleReviewUrl('');
      setLinkedinUrl('');
      setAccentColor('#6366F1');
      setFormBgColor('#ffffff');
      setButtonColor('');
      setTextColor('#1a1a1a');
      setFontFamily(null);
      setFontUrl(null);
      setLogoPreview(null);
      setReportToken(null);
    }
  }, [selectedProject, selectedProjectId, isNewProject, projectsLoading]);

  // ── Initial load (auth + subscription only) ───────────────────────────────
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email ?? '');
      setDisplayName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? '');

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subData) {
        setSubscription(subData as Subscription);
      }
    } catch (err) {
      toast.error('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Save profile ───────────────────────────────────────────────────────────
  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName },
      });
      if (error) throw error;
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  }, [supabase, displayName]);

  // ── Send password change magic link ───────────────────────────────────────
  const handleSendMagicLink = useCallback(async () => {
    setSendingMagicLink(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      toast.error('Failed to send password reset link');
      console.error(err);
    } finally {
      setSendingMagicLink(false);
    }
  }, [supabase, userEmail]);

  // ── Upload logo ────────────────────────────────────────────────────────────
  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be under 2MB');
        return;
      }

      setUploadingLogo(true);
      try {
        const body = new FormData();
        body.append('file', file);

        const res = await fetch('/api/upload-logo', { method: 'POST', body });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Upload failed');

        setLogoPreview(data.url);
        setProject((prev) => prev ? { ...prev, logo_url: data.url } : prev);
        toast.success('Logo uploaded');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Logo upload failed: ${msg}`);
        console.error(err);
      } finally {
        setUploadingLogo(false);
      }
    },
    []
  );

  // ── Save project ───────────────────────────────────────────────────────────
  const handleSaveProject = useCallback(async () => {
    if (!projectName.trim()) {
      toast.error('Project name is required');
      return;
    }
    setSavingProject(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Determine slug:
      // - Pro users can set a custom slug
      // - Free users (or Pro with no custom slug typed) get an auto-generated slug from the project name
      // - Preserve existing slug if user hasn't changed it
      let resolvedSlug: string | undefined;
      if (subscription?.plan === 'pro' && projectSlug.trim()) {
        resolvedSlug = projectSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      } else if (!project?.slug) {
        // Auto-generate from project name for new projects or projects without a slug
        resolvedSlug = projectName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 7);
      } else {
        resolvedSlug = project.slug; // Keep existing slug
      }

      // Resolve button color: if user set one use it, otherwise keep null (falls back to accent_color)
      const resolvedButtonColor = buttonColor.trim() || null;

      const payload = {
        name: projectName.trim(),
        slug: resolvedSlug,
        website: projectWebsite.trim() || null,
        google_review_url: googleReviewUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        accent_color: resolvedButtonColor || accentColor,
        form_bg_color: formBgColor || '#ffffff',
        button_color: resolvedButtonColor,
        text_color: textColor || '#1a1a1a',
        font_family: sanitizeFontFamily(fontFamily),
        font_url: sanitizeFontUrl(fontUrl),
        logo_url: logoPreview,
      };

      if (project) {
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', project.id);
        if (error) throw error;
        await refetchProjects();
      } else {
        // Free plan: max 1 project
        if (plan === 'free' && projects.length >= 1) {
          toast.error('Free plan allows 1 project. Upgrade to Pro for unlimited projects.');
          setSavingProject(false);
          return;
        }
        const { data, error } = await supabase
          .from('projects')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        const newProject = data as Project;
        setProject(newProject);
        await refetchProjects();
        switchProject(newProject.id);
        // Clean ?new=true from URL
        if (isNewProject) {
          const url = new URL(window.location.href);
          url.searchParams.delete('new');
          router.replace(url.pathname + (url.search || ''));
        }
      }

      toast.success('Project settings saved');
    } catch (err) {
      toast.error('Failed to save project settings');
      console.error(err);
    } finally {
      setSavingProject(false);
    }
  }, [supabase, project, projects, plan, projectName, projectSlug, projectWebsite, googleReviewUrl, linkedinUrl, accentColor, formBgColor, buttonColor, textColor, fontFamily, fontUrl, logoPreview, subscription, refetchProjects, switchProject, isNewProject, router]);

  // ── Generate report token ─────────────────────────────────────────────────
  const handleGenerateReportToken = useCallback(async () => {
    if (!project) return;
    setGeneratingReport(true);
    try {
      const token = Math.random().toString(36).slice(2, 9) + Math.random().toString(36).slice(2, 9);
      const { error } = await supabase
        .from('projects')
        .update({ report_token: token })
        .eq('id', project.id);
      if (error) throw error;
      setReportToken(token);
      toast.success('Report link generated');
    } catch (err) {
      toast.error('Failed to generate report link');
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  }, [supabase, project]);

  // ── Stripe Checkout / Portal ───────────────────────────────────────────────
  const handleUpgrade = useCallback(async () => {
    setLoadingBilling(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create checkout session');
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.');
      console.error(err);
    } finally {
      setLoadingBilling(false);
    }
  }, []);

  const handleManageBilling = useCallback(async () => {
    setLoadingBilling(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create portal session');
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      toast.error('Failed to open billing portal. Please try again.');
      console.error(err);
    } finally {
      setLoadingBilling(false);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6"
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your account, project, and billing preferences.
        </p>
      </div>

      {loading ? (
        <SettingsSkeleton />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 h-10 rounded-xl bg-muted/60 p-1 gap-1">
            <TabsTrigger value="general" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="size-3.5" />
              General
            </TabsTrigger>
            <TabsTrigger value="project" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 className="size-3.5" />
              Project
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CreditCard className="size-3.5" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* ──────────────── GENERAL TAB ──────────────── */}
          <TabsContent value="general" className="space-y-5">
            {/* Profile */}
            <Section title="Profile" description="Update your public display name.">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={userEmail}
                      readOnly
                      disabled
                      className="pl-9 rounded-xl bg-muted/40 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="size-3" />
                    Email address cannot be changed
                  </p>
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                >
                  {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Profile
                </Button>
              </div>
            </Section>

            {/* Password */}
            <Section title="Password" description="Send yourself a secure link to update your password.">
              {magicLinkSent ? (
                <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                  <Check className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Reset link sent!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Check your email at <strong>{userEmail}</strong> for a link to reset your password.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/80">We&apos;ll email you a secure magic link.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sent to <strong>{userEmail}</strong>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSendMagicLink}
                    disabled={sendingMagicLink}
                    className="gap-2 rounded-xl shrink-0"
                  >
                    {sendingMagicLink ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Mail className="size-4" />
                    )}
                    Send Reset Link
                  </Button>
                </div>
              )}
            </Section>
          </TabsContent>

          {/* ──────────────── PROJECT TAB ──────────────── */}
          <TabsContent value="project" className="space-y-5">
            {/* Basic Info */}
            <Section title="Project Details" description="Information about your business used in emails and the collection form.">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="project-name">Project / Business Name</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Acme Corp"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="project-slug">Public Page Address</Label>
                    {subscription?.plan === 'free' && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        <Lock className="size-3" /> Pro
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                      /p/
                    </span>
                    <Input
                      id="project-slug"
                      value={projectSlug}
                      onChange={(e) => setProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="your-name"
                      className="pl-9 pr-10 rounded-xl"
                      disabled={subscription?.plan === 'free'}
                    />
                    {projectSlug && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/p/${projectSlug}`);
                          setSlugCopied(true);
                          setTimeout(() => setSlugCopied(false), 2000);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Copy page address"
                      >
                        {slugCopied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subscription?.plan !== 'free'
                      ? 'This is the link to your public testimonials page. You can customise the address above.'
                      : 'This is the link where people can view your testimonials. Upgrade to Pro to set a custom address.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="project-website">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="project-website"
                      value={projectWebsite}
                      onChange={(e) => setProjectWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="pl-9 rounded-xl"
                      type="url"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="google-review-url">Google Review URL</Label>
                    {subscription?.plan === 'free' && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        <Lock className="size-3" /> Pro
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="google-review-url"
                      value={googleReviewUrl}
                      onChange={(e) => setGoogleReviewUrl(e.target.value)}
                      placeholder="https://g.page/r/your-business/review"
                      className="pl-9 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {subscription?.plan !== 'free'
                      ? "Paste your Google Business review link. After customers give a 4 or 5 star rating, we'll nudge them to also leave a Google review."
                      : 'Upgrade to Pro to automatically nudge 4 and 5 star customers to leave a Google review.'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                    {subscription?.plan === 'free' && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        <Lock className="size-3" /> Pro
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="linkedin-url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/company/your-company"
                      className="pl-9 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {subscription?.plan !== 'free'
                      ? "After a 4 or 5 star rating, we'll copy their review text to the clipboard and open your LinkedIn page so they can post it."
                      : 'Upgrade to Pro to nudge happy customers to share their experience on LinkedIn.'}
                  </p>
                </div>
              </div>
            </Section>

            {/* Client Report Link (Agency only) */}
            {subscription?.plan === 'agency' && project && (
              <Section
                title="Client Report Link"
                description="Share a read-only link with your client so they can view all approved testimonials."
              >
                {reportToken ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0 rounded-xl bg-muted/40 border border-border px-3 py-2">
                        <span className="text-xs font-mono text-muted-foreground truncate block">
                          {typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL ?? ''}/report/{reportToken}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/report/${reportToken}`);
                          setReportCopied(true);
                          setTimeout(() => setReportCopied(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all shrink-0"
                      >
                        {reportCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                        {reportCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateReportToken}
                      disabled={generatingReport}
                      className="gap-2 rounded-xl text-xs"
                    >
                      {generatingReport ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                      Regenerate link
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Anyone with this link can view approved testimonials. Regenerating it invalidates the old one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      No report link yet. Generate one to share with your client.
                    </p>
                    <Button
                      onClick={handleGenerateReportToken}
                      disabled={generatingReport}
                      className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                    >
                      {generatingReport ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
                      Generate report link
                    </Button>
                  </div>
                )}
              </Section>
            )}

            {/* Logo */}
            <Section title="Logo" description="Used in collection forms and emails. Recommended: square PNG or SVG, at least 200×200px.">
              <div className="flex items-center gap-5">
                {/* Preview */}
                <div className="size-20 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <div className="relative size-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Logo" className="size-full object-contain" />
                      <button
                        onClick={() => setLogoPreview(null)}
                        className="absolute top-0.5 right-0.5 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <Upload className="size-6 text-muted-foreground/50" />
                  )}
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="gap-2 rounded-xl"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
                  </Button>
                  <p className="mt-1.5 text-xs text-muted-foreground">PNG, JPG, or SVG. Max 2MB.</p>
                </div>
              </div>
            </Section>

            {/* Colors */}
            <Section title="Colors" description="Control the look of your collection form and public page.">
              <div className="space-y-5">
                {/* Button Color */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Button Color</Label>
                  <p className="text-xs text-muted-foreground">Buttons, stars, progress indicators, and interactive elements.</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {ACCENT_PRESETS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setButtonColor(c.value)}
                        title={c.label}
                        className={cn(
                          'size-8 rounded-full border-2 transition-all',
                          (buttonColor || accentColor) === c.value
                            ? 'border-foreground scale-110 shadow-md'
                            : 'border-transparent hover:scale-105 hover:border-muted-foreground'
                        )}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <input
                        type="color"
                        value={buttonColor || accentColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        className="size-8 rounded-full cursor-pointer border-2 border-border"
                      />
                      <input
                        type="text"
                        value={buttonColor || accentColor}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!v.startsWith('#')) v = '#' + v;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setButtonColor(v);
                        }}
                        onBlur={() => {
                          if (buttonColor && !/^#[0-9A-Fa-f]{6}$/.test(buttonColor)) setButtonColor('');
                        }}
                        maxLength={7}
                        className="w-20 text-xs font-mono px-2 py-1 rounded border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="#6366F1"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Background Color */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Form Background</Label>
                  <p className="text-xs text-muted-foreground">Background color for your collection form page.</p>
                  <div className="flex items-center gap-3">
                    {[
                      { label: 'White', value: '#ffffff' },
                      { label: 'Snow', value: '#fafafa' },
                      { label: 'Cream', value: '#fef9ef' },
                      { label: 'Slate', value: '#f1f5f9' },
                      { label: 'Stone', value: '#f5f5f4' },
                      { label: 'Dark', value: '#0f172a' },
                    ].map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setFormBgColor(c.value)}
                        title={c.label}
                        className={cn(
                          'size-8 rounded-full border-2 transition-all',
                          formBgColor === c.value
                            ? 'border-foreground scale-110 shadow-md'
                            : 'border-muted-foreground/30 hover:scale-105 hover:border-muted-foreground'
                        )}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <input
                        type="color"
                        value={formBgColor}
                        onChange={(e) => setFormBgColor(e.target.value)}
                        className="size-8 rounded-full cursor-pointer border-2 border-border"
                      />
                      <input
                        type="text"
                        value={formBgColor}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!v.startsWith('#')) v = '#' + v;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setFormBgColor(v);
                        }}
                        onBlur={() => {
                          if (!/^#[0-9A-Fa-f]{6}$/.test(formBgColor)) setFormBgColor('#ffffff');
                        }}
                        maxLength={7}
                        className="w-20 text-xs font-mono px-2 py-1 rounded border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Text Color</Label>
                  <p className="text-xs text-muted-foreground">Headings, labels, and body text on your form.</p>
                  <div className="flex items-center gap-3">
                    {[
                      { label: 'Near Black', value: '#1a1a1a' },
                      { label: 'Dark Gray', value: '#374151' },
                      { label: 'Slate', value: '#334155' },
                      { label: 'White', value: '#ffffff' },
                    ].map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setTextColor(c.value)}
                        title={c.label}
                        className={cn(
                          'size-8 rounded-full border-2 transition-all',
                          textColor === c.value
                            ? 'border-foreground scale-110 shadow-md'
                            : 'border-muted-foreground/30 hover:scale-105 hover:border-muted-foreground'
                        )}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="size-8 rounded-full cursor-pointer border-2 border-border"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!v.startsWith('#')) v = '#' + v;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setTextColor(v);
                        }}
                        onBlur={() => {
                          if (!/^#[0-9A-Fa-f]{6}$/.test(textColor)) setTextColor('#1a1a1a');
                        }}
                        maxLength={7}
                        className="w-20 text-xs font-mono px-2 py-1 rounded border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="#1a1a1a"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Font */}
            <Section title="Font" description="Applied to your collection form and public testimonials page.">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Google Fonts</Label>
                  <Select
                    value={fontFamily ?? '__none__'}
                    onValueChange={(val) => {
                      if (val === '__none__') {
                        setFontFamily(null);
                        setFontUrl(null);
                      } else {
                        setFontFamily(val);
                        setFontUrl(null);
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="System default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">System default</SelectItem>
                      {GOOGLE_FONTS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="custom-font-url">Custom CSS URL</Label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="custom-font-url"
                      value={fontUrl ?? ''}
                      onChange={(e) => {
                        setFontUrl(e.target.value || null);
                        if (e.target.value) setFontFamily(null);
                      }}
                      placeholder="https://fonts.adobe.com/..."
                      className="pl-9 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste a CSS URL from Adobe Fonts, Fontshare, or your own hosted font. When using a custom URL, type the font family name in the field below.
                  </p>
                </div>
                {fontUrl && !fontFamily && (
                  <div className="space-y-1.5">
                    <Label htmlFor="custom-font-family">Font Family Name</Label>
                    <Input
                      id="custom-font-family"
                      value={fontFamily ?? ''}
                      onChange={(e) => setFontFamily(e.target.value || null)}
                      placeholder="e.g. Proxima Nova"
                      className="rounded-xl"
                    />
                  </div>
                )}
                {/* Live preview */}
                {fontFamily && (
                  <>
                    {resolveFontUrl(fontFamily, fontUrl) && (
                      // eslint-disable-next-line @next/next/no-page-custom-font
                      <link rel="stylesheet" href={resolveFontUrl(fontFamily, fontUrl)!} />
                    )}
                    <div
                      className="rounded-xl border border-border p-4 bg-muted/20"
                      style={{ fontFamily: `"${fontFamily}", sans-serif` }}
                    >
                      <p className="text-sm text-foreground">The quick brown fox jumps over the lazy dog.</p>
                      <p className="text-xs text-muted-foreground mt-1">Preview: {fontFamily}</p>
                    </div>
                  </>
                )}
              </div>
            </Section>

            {/* Save Button */}
            <Button
              onClick={handleSaveProject}
              disabled={savingProject || !projectName.trim()}
              className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 w-full"
              size="lg"
            >
              {savingProject ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Project Settings
            </Button>
          </TabsContent>

          {/* ──────────────── BILLING TAB ──────────────── */}
          <TabsContent value="billing" className="space-y-5">
            {/* Current Plan Card */}
            <div
              className={cn(
                'rounded-2xl border p-6',
                subscription?.plan !== 'free'
                  ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200'
                  : 'bg-white border-border'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck
                      className={cn(
                        'size-5',
                        subscription?.plan !== 'free' ? 'text-indigo-600' : 'text-muted-foreground'
                      )}
                    />
                    <h3 className="text-base font-semibold text-foreground">
                      {subscription?.plan === 'agency' ? 'Agency Plan' : subscription?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </h3>
                    {subscription?.plan !== 'free' && (
                      <span className="text-xs bg-indigo-600 text-white rounded-full px-2 py-0.5 font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  {subscription?.plan !== 'free' && subscription?.current_period_end && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Calendar className="size-3.5" />
                      Renews{' '}
                      {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                    </div>
                  )}
                  {subscription?.plan === 'free' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      You&apos;re on the Free plan. Upgrade for full access.
                    </p>
                  )}
                </div>
                {subscription?.plan !== 'free' && (
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    disabled={loadingBilling}
                    className="gap-2 rounded-xl shrink-0"
                  >
                    {loadingBilling ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ExternalLink className="size-4" />
                    )}
                    Manage Billing
                  </Button>
                )}
              </div>
            </div>

            {/* Free Plan → Upgrade */}
            {subscription?.plan === 'free' && (
              <div className="bg-white rounded-2xl border border-indigo-100 p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Pro Plan</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Unlimited forms, video, Google Review nudges, and no Vouch branding.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-foreground leading-none">$19</div>
                    <div className="text-xs text-muted-foreground mt-0.5">/month</div>
                  </div>
                </div>
                <Button
                  onClick={handleUpgrade}
                  disabled={loadingBilling}
                  className="w-full gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 h-11"
                  size="lg"
                >
                  {loadingBilling ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Zap className="size-4" />
                  )}
                  Upgrade to Pro — $19/mo
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  No contracts. Cancel anytime. Billed monthly.
                </p>
              </div>
            )}

            {/* Paid Plan → Features + Manage */}
            {subscription?.plan !== 'free' && (
              <>
                <Section title="Plan Features" description={`What's included in your ${subscription?.plan === 'agency' ? 'Agency' : 'Pro'} plan.`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRO_FEATURES.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className="size-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                          <Check className="size-3 text-indigo-600" />
                        </div>
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Section>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Cancelling your subscription</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      If you cancel, you&apos;ll keep Pro access until the end of your billing period. After that, your account will revert to the Free plan. Your data will not be deleted.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageBilling}
                      disabled={loadingBilling}
                      className="mt-3 gap-1.5 rounded-xl border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      {loadingBilling ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="size-3.5" />
                      )}
                      Manage Subscription
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}

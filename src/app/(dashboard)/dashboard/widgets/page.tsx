'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { toast } from 'sonner';
import {
  LayoutGrid,
  Rows3,
  Heart,
  List,
  Star,
  Copy,
  Check,
  Save,
  Loader2,
  Code2,
  Lock,
  Zap,
  Globe,
  ExternalLink,
  Link2,
  GripVertical,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────
type WidgetLayout = 'grid' | 'carousel' | 'wall' | 'list';
type FilterMode = 'all' | 'featured' | 'rating';

interface WidgetTheme {
  primaryColor: string;
  backgroundColor: string;
  showRating: boolean;
  showAvatar: boolean;
  showDate: boolean;
}

interface WidgetSettings {
  name: string;
  layout: WidgetLayout;
  theme: WidgetTheme;
  filterMode: FilterMode;
  minRating: number;
  maxItems: number;
  hideBranding: boolean;
  pinnedIds: string[];
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
  created_at: string;
}

interface Widget {
  id: string;
  name: string;
  layout: WidgetLayout;
  theme: WidgetTheme;
  filter_mode: FilterMode;
  min_rating: number;
  max_items: number;
  hide_branding: boolean;
  project_id: string;
  pinned_ids: string[] | null;
}

// ─── Sample fallback testimonials ─────────────────────────────────────────────
const SAMPLE_TESTIMONIALS: Testimonial[] = [
  {
    id: 's1',
    author_name: 'Sarah Chen',
    author_role: 'Head of Marketing',
    author_company: 'Acme Corp',
    author_avatar_url: null,
    rating: 5,
    content: 'This tool completely transformed how we collect customer feedback. The setup took minutes and the results have been incredible. Highly recommend to any business owner.',
    featured: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 's2',
    author_name: 'James Wilson',
    author_role: 'Founder',
    author_company: 'Studio W',
    author_avatar_url: null,
    rating: 5,
    content: 'The widget looks beautiful on our website and we\'ve seen a 30% increase in conversions since adding social proof. Worth every penny.',
    featured: true,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 's3',
    author_name: 'Maria Lopez',
    author_role: 'Product Designer',
    author_company: 'Designco',
    author_avatar_url: null,
    rating: 4,
    content: 'Clean, simple, and effective. I love the automated Google review nudge. It has doubled our review count in just two months.',
    featured: false,
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
];

const COLOR_PRESETS = [
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Violet', value: '#8B5CF6' },
  { label: 'Rose', value: '#F43F5E' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Sky', value: '#0EA5E9' },
];

const LAYOUT_OPTIONS: { value: WidgetLayout; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'grid', label: 'Grid', icon: <LayoutGrid className="size-5" />, desc: '2-3 columns' },
  { value: 'carousel', label: 'Carousel', icon: <Rows3 className="size-5" />, desc: 'Horizontal scroll' },
  { value: 'wall', label: 'Wall of Love', icon: <Heart className="size-5" />, desc: 'Masonry layout' },
  { value: 'list', label: 'List', icon: <List className="size-5" />, desc: 'Single column' },
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="size-3.5"
          style={{ fill: i < rating ? color : 'transparent', color: i < rating ? color : '#d1d5db' }}
        />
      ))}
    </div>
  );
}

function TestimonialPreviewCard({
  testimonial,
  theme,
  compact = false,
}: {
  testimonial: Testimonial;
  theme: WidgetTheme;
  compact?: boolean;
}) {
  const displayContent = testimonial.content;
  const truncated = compact && displayContent.length > 120
    ? displayContent.slice(0, 120) + '…'
    : displayContent;

  const roleCompany = [testimonial.author_role, testimonial.author_company].filter(Boolean).join(' · ');
  const initials = testimonial.author_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="rounded-xl border border-border/60 p-4 shadow-sm"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {theme.showRating && <StarRating rating={testimonial.rating} color={theme.primaryColor} />}
      <p className={cn('mt-2 text-sm text-foreground/85 leading-relaxed', compact && 'text-xs')}>{truncated}</p>
      <div className="mt-3 flex items-center gap-2">
        {theme.showAvatar && (
          <Avatar size="sm">
            {testimonial.author_avatar_url && (
              <AvatarImage src={testimonial.author_avatar_url} alt={testimonial.author_name} />
            )}
            <AvatarFallback
              className="text-xs font-semibold"
              style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <p className="text-xs font-semibold text-foreground">{testimonial.author_name}</p>
          {roleCompany && <p className="text-xs text-muted-foreground">{roleCompany}</p>}
        </div>
        {theme.showDate && (
          <span className="ml-auto text-xs text-muted-foreground">
            {format(new Date(testimonial.created_at), 'MMM yyyy')}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Copy Code Button ─────────────────────────────────────────────────────────
function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-1"
    >
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WidgetsPage() {
  const supabase = createClient();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [orderedTestimonials, setOrderedTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedWidgetId, setSavedWidgetId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [embedTab, setEmbedTab] = useState<'link' | 'builder' | 'dev' | 'react'>('link');

  const [settings, setSettings] = useState<WidgetSettings>({
    name: 'My Widget',
    layout: 'grid',
    theme: {
      primaryColor: '#6366F1',
      backgroundColor: '#ffffff',
      showRating: true,
      showAvatar: true,
      showDate: true,
    },
    filterMode: 'all',
    minRating: 4,
    maxItems: 12,
    hideBranding: false,
    pinnedIds: [],
  });

  // ── Fetch approved testimonials ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoadingTestimonials(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [testimonialsRes, subRes, projectsRes] = await Promise.all([
        supabase
          .from('testimonials')
          .select('id, author_name, author_role, author_company, author_avatar_url, rating, content, featured, created_at')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('subscriptions').select('plan').eq('user_id', user.id).single(),
        supabase.from('projects').select('id, slug').eq('user_id', user.id).limit(1).single(),
      ]);

      const fetchedTestimonials = (testimonialsRes.data as Testimonial[]) ?? [];
      setTestimonials(fetchedTestimonials);
      if (subRes.data) setUserPlan(subRes.data.plan);
      if (projectsRes.data) {
        setProjectId(projectsRes.data.id);
        setProjectSlug((projectsRes.data as { id: string; slug: string | null }).slug);
      }

      // Try to load existing widget
      const { data: widgetData } = await supabase
        .from('widgets')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      const loadedPinnedIds: string[] = Array.isArray(widgetData?.pinned_ids)
        ? (widgetData.pinned_ids as string[])
        : [];

      if (loadedPinnedIds.length > 0) {
        const orderMap = new Map(loadedPinnedIds.map((id, idx) => [id, idx]));
        setOrderedTestimonials([...fetchedTestimonials].sort((a, b) =>
          (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity)
        ));
      } else {
        setOrderedTestimonials(fetchedTestimonials);
      }

      if (widgetData) {
        setSavedWidgetId(widgetData.id);
        setSettings({
          name: widgetData.name,
          layout: widgetData.layout,
          theme: widgetData.theme,
          filterMode: widgetData.filter_mode,
          minRating: widgetData.min_rating,
          maxItems: widgetData.max_items,
          hideBranding: widgetData.hide_branding,
          pinnedIds: loadedPinnedIds,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTestimonials(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filtered preview testimonials ──────────────────────────────────────────
  const previewTestimonials = useMemo(() => {
    const hasReal = orderedTestimonials.length > 0 || testimonials.length > 0;
    const source = hasReal ? orderedTestimonials : SAMPLE_TESTIMONIALS;
    let filtered = source;
    if (settings.filterMode === 'featured') {
      filtered = filtered.filter((t) => t.featured);
    } else if (settings.filterMode === 'rating') {
      filtered = filtered.filter((t) => t.rating >= settings.minRating);
    }
    return filtered.slice(0, settings.maxItems);
  }, [orderedTestimonials, testimonials.length, settings.filterMode, settings.minRating, settings.maxItems]);

  const usingSampleData = testimonials.length === 0;

  // ── Update helpers ─────────────────────────────────────────────────────────
  const updateTheme = useCallback((key: keyof WidgetTheme, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      theme: { ...prev.theme, [key]: value },
    }));
  }, []);

  const update = useCallback(<K extends keyof WidgetSettings>(key: K, value: WidgetSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReorder = useCallback((newOrder: Testimonial[]) => {
    setOrderedTestimonials(newOrder);
    if (testimonials.length > 0) {
      setSettings((prev) => ({ ...prev, pinnedIds: newOrder.map((t) => t.id) }));
    }
  }, [testimonials.length]);

  // ── Save widget ───────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!projectId) {
      toast.error('No project found. Create a project in Settings first.');
      return;
    }
    if (userPlan === 'free' && !savedWidgetId) {
      // Check if already has a widget
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from('widgets')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if ((count ?? 0) >= 1) {
          toast.error('Free plan allows 1 widget. Upgrade to Pro for unlimited widgets.');
          return;
        }
      }
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        user_id: user.id,
        project_id: projectId,
        name: settings.name,
        layout: settings.layout,
        theme: settings.theme,
        filter_mode: settings.filterMode,
        min_rating: settings.minRating,
        max_items: settings.maxItems,
        hide_branding: settings.hideBranding,
        pinned_ids: settings.pinnedIds,
      };

      if (savedWidgetId) {
        const { error } = await supabase.from('widgets').update(payload).eq('id', savedWidgetId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('widgets').insert(payload).select('id').single();
        if (error) throw error;
        setSavedWidgetId(data.id);
      }
      toast.success('Widget saved successfully');
    } catch (err) {
      toast.error('Failed to save widget');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [supabase, projectId, settings, savedWidgetId, userPlan]);

  // ── Embed snippets ────────────────────────────────────────────────────────
  const iframeSnippet = savedWidgetId
    ? `<iframe\n  src="${SITE_URL}/embed/${savedWidgetId}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  loading="lazy"\n></iframe>`
    : '';

  // Shadow DOM embed: renders testimonials directly in the page DOM (SEO-friendly).
  // Attribute name 'data-vouch' must match public/embed.js exactly. Do not rename either.
  const scriptSnippet = savedWidgetId
    ? `<div data-vouch="${savedWidgetId}"></div>\n<script src="${SITE_URL}/embed.js" defer></script>`
    : '';

  const reactSnippet = savedWidgetId
    ? `'use client';
import { useEffect, useState } from 'react';

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  rating: number;
  content: string;
}

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch('${SITE_URL}/api/testimonials/widget/${savedWidgetId}')
      .then((r) => r.json())
      .then((d) => setItems(d.testimonials ?? []));
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((t) => (
        <blockquote
          key={t.id}
          className="rounded-xl border border-border p-5 flex flex-col gap-3"
        >
          <p className="text-sm leading-relaxed text-foreground/80">
            &ldquo;{t.content}&rdquo;
          </p>
          <footer className="mt-auto">
            <p className="text-sm font-semibold text-foreground">
              {t.author_name}
            </p>
            {(t.author_role || t.author_company) && (
              <p className="text-xs text-muted-foreground">
                {[t.author_role, t.author_company].filter(Boolean).join(', ')}
              </p>
            )}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Widget Builder</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Customize your testimonial widget and embed it on your website.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {savedWidgetId ? 'Save Changes' : 'Save Widget'}
        </Button>
      </div>

      {!projectId && !loadingTestimonials && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              Create a project before saving your widget
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Go to Settings &gt; Project to set up your project first.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100">
            <Link href="/dashboard/settings?tab=project">Go to Settings</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        {/* ── Left Panel: Settings ── */}
        <div className="space-y-5">
          {/* Widget Name */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Widget Name</h3>
            <Input
              value={settings.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="My Widget"
              className="rounded-xl"
            />
          </div>

          {/* Layout */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Layout</h3>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUT_OPTIONS.map((opt) => {
                const isProLayout = opt.value !== 'grid';
                const isLocked = isProLayout && userPlan === 'free';
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (isLocked) {
                        toast.error('Upgrade to Pro to use this layout.');
                        return;
                      }
                      update('layout', opt.value);
                    }}
                    className={cn(
                      'relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all',
                      isLocked
                        ? 'border-border text-muted-foreground/50 cursor-not-allowed bg-muted/20'
                        : settings.layout === opt.value
                        ? 'border-indigo-500 bg-indigo-50/60 text-indigo-700'
                        : 'border-border text-muted-foreground hover:border-indigo-200 hover:bg-muted/30'
                    )}
                  >
                    {opt.icon}
                    <div>
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="text-xs opacity-70">{opt.desc}</p>
                    </div>
                    {isLocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="size-3 text-muted-foreground/50" />
                      </div>
                    )}
                    {!isLocked && settings.layout === opt.value && (
                      <div className="absolute top-2 right-2 size-2 rounded-full bg-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme */}
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Theme</h3>

            {/* Primary Color */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Primary Color</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateTheme('primaryColor', c.value)}
                    title={c.label}
                    className={cn(
                      'size-7 rounded-full border-2 transition-all',
                      settings.theme.primaryColor === c.value
                        ? 'border-foreground scale-110 shadow-md'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={settings.theme.primaryColor}
                    onChange={(e) => updateTheme('primaryColor', e.target.value)}
                    className="size-7 rounded-full cursor-pointer border-2 border-border"
                  />
                  <span className="text-xs text-muted-foreground font-mono">{settings.theme.primaryColor}</span>
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Background Color</Label>
              <div className="flex items-center gap-2">
                {['#ffffff', '#f8fafc', '#f1f5f9', '#fafafa', '#fffbeb'].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateTheme('backgroundColor', c)}
                    title={c}
                    className={cn(
                      'size-7 rounded-full border-2 transition-all',
                      settings.theme.backgroundColor === c
                        ? 'border-foreground scale-110 shadow-md'
                        : 'border-border hover:scale-105'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={settings.theme.backgroundColor}
                    onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                    className="size-7 rounded-full cursor-pointer border-2 border-border"
                  />
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-1">
              {(
                [
                  { key: 'showRating' as const, label: 'Show star rating' },
                  { key: 'showAvatar' as const, label: 'Show author avatar' },
                  { key: 'showDate' as const, label: 'Show date' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground/80">{label}</span>
                  <Switch
                    checked={settings.theme[key] as boolean}
                    onCheckedChange={(v) => updateTheme(key, v)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Filter Testimonials</h3>

            <div className="flex gap-2">
              {(['all', 'featured', 'rating'] as FilterMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => update('filterMode', mode)}
                  className={cn(
                    'flex-1 rounded-xl border px-2 py-1.5 text-xs font-medium capitalize transition-all',
                    settings.filterMode === mode
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-border text-muted-foreground hover:border-indigo-200'
                  )}
                >
                  {mode === 'all' ? 'All' : mode === 'featured' ? 'Featured' : 'Min Rating'}
                </button>
              ))}
            </div>

            {settings.filterMode === 'rating' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Minimum Rating</Label>
                  <span className="text-xs font-semibold text-foreground">{settings.minRating}+</span>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[settings.minRating]}
                  onValueChange={([v]) => update('minRating', v)}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>1 ★</span>
                  <span>5 ★</span>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">Max Items</Label>
                <span className="text-xs font-semibold text-foreground">{settings.maxItems}</span>
              </div>
              <Slider
                min={3}
                max={50}
                step={1}
                value={[settings.maxItems]}
                onValueChange={([v]) => update('maxItems', v)}
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>3</span>
                <span>50</span>
              </div>
            </div>
          </div>

          {/* Display Order */}
          {testimonials.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Display Order</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Drag to set the order. Filter and max items still apply.
                </p>
              </div>
              <Reorder.Group
                axis="y"
                values={orderedTestimonials}
                onReorder={handleReorder}
                className="space-y-1.5"
              >
                {orderedTestimonials.map((t, idx) => (
                  <Reorder.Item
                    key={t.id}
                    value={t}
                    className="flex items-center gap-2.5 bg-muted/40 rounded-xl border border-border px-3 py-2 cursor-grab active:cursor-grabbing select-none"
                  >
                    <GripVertical className="size-3.5 text-muted-foreground/50 shrink-0" />
                    <span className="text-[10px] font-mono text-muted-foreground/40 w-4 shrink-0 text-right">
                      {idx + 1}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {t.author_avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.author_avatar_url} alt={t.author_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] font-semibold text-indigo-600">
                          {t.author_name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate flex-1 min-w-0">
                      {t.author_name}
                    </p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="size-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}

          {/* Branding */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Remove &quot;Powered by Vouch&quot;</p>
                <p className="text-xs text-muted-foreground mt-0.5">Hide the Vouch branding from your widget</p>
              </div>
              {userPlan === 'pro' ? (
                <Switch
                  checked={settings.hideBranding}
                  onCheckedChange={(v) => update('hideBranding', v)}
                  size="sm"
                />
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-1">
                  <Lock className="size-3" />
                  Pro
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Panel: Preview ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-400/60" />
                  <div className="size-3 rounded-full bg-amber-400/60" />
                  <div className="size-3 rounded-full bg-emerald-400/60" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Live Preview</span>
              </div>
              {usingSampleData && (
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-medium">
                  Sample data. Approve testimonials to see yours.
                </span>
              )}
            </div>

            {/* Preview Area */}
            <div className="p-5" style={{ backgroundColor: settings.theme.backgroundColor + '80' }}>
              {loadingTestimonials ? (
                <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  <span className="text-sm">Loading testimonials…</span>
                </div>
              ) : previewTestimonials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm text-muted-foreground">No testimonials match your filter settings.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={settings.layout}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {settings.layout === 'grid' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {previewTestimonials.slice(0, 6).map((t) => (
                          <TestimonialPreviewCard
                            key={t.id}
                            testimonial={t}
                            theme={settings.theme}
                            compact
                          />
                        ))}
                      </div>
                    )}
                    {settings.layout === 'list' && (
                      <div className="space-y-3 max-w-2xl mx-auto">
                        {previewTestimonials.slice(0, 5).map((t) => (
                          <TestimonialPreviewCard key={t.id} testimonial={t} theme={settings.theme} />
                        ))}
                      </div>
                    )}
                    {settings.layout === 'carousel' && (
                      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                        {previewTestimonials.slice(0, 8).map((t) => (
                          <div key={t.id} className="min-w-[280px] snap-start">
                            <TestimonialPreviewCard testimonial={t} theme={settings.theme} compact />
                          </div>
                        ))}
                      </div>
                    )}
                    {settings.layout === 'wall' && (
                      <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3">
                        {previewTestimonials.slice(0, 9).map((t) => (
                          <div key={t.id} className="break-inside-avoid">
                            <TestimonialPreviewCard testimonial={t} theme={settings.theme} />
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Vouch branding */}
              {!settings.hideBranding && (
                <div className="mt-4 flex justify-center">
                  <span className="text-xs text-muted-foreground/60">
                    Powered by{' '}
                    <span style={{ color: settings.theme.primaryColor }} className="font-semibold">
                      Vouch
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Add to your website ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-border overflow-hidden"
          >
            {/* Section header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Code2 className="size-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-foreground">Add to your website</h3>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
              {([
                { id: 'link' as const, label: 'Share link', icon: <Link2 className="size-3.5" /> },
                { id: 'builder' as const, label: 'Website builder', icon: <Globe className="size-3.5" /> },
                { id: 'dev' as const, label: 'Script tag', icon: <Code2 className="size-3.5" /> },
                {
                  id: 'react' as const,
                  label: 'React',
                  icon: userPlan !== 'pro'
                    ? <Lock className="size-3.5 text-indigo-400" />
                    : <Code2 className="size-3.5" />,
                },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEmbedTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                    embedTab === tab.id
                      ? 'border-indigo-500 text-indigo-700 bg-white'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {/* ── Share link tab ── */}
              {embedTab === 'link' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Your public testimonials page</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      No website needed. Share this link anywhere. Customers can see all your approved testimonials instantly.
                    </p>
                    {projectSlug ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                          <Globe className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-mono text-foreground truncate">
                            {SITE_URL}/p/{projectSlug}
                          </span>
                        </div>
                        <CopyCodeButton code={`${SITE_URL}/p/${projectSlug}`} />
                        <a
                          href={`/p/${projectSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-border bg-muted/40 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        Save your project settings first to get your public page URL.
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 space-y-2">
                    <p className="text-xs font-semibold text-indigo-800">Where to share it:</p>
                    <ul className="space-y-1.5 text-xs text-indigo-700">
                      <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Email signature with a &ldquo;See what customers say&rdquo; link</span></li>
                      <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>WhatsApp or Instagram bio</span></li>
                      <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Google Business profile description</span></li>
                      <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Invoices or receipts as a review prompt</span></li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ── Website builder tab ── */}
              {embedTab === 'builder' && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Works with Webflow, Squarespace, Wix, Framer, and any builder that has an &ldquo;Embed&rdquo; block.
                  </p>
                  {savedWidgetId ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-foreground/70">Paste this code:</span>
                          <CopyCodeButton code={iframeSnippet} />
                        </div>
                        <pre className="rounded-xl bg-gray-950 p-3 text-xs text-emerald-400 overflow-x-auto font-mono leading-relaxed">
                          {iframeSnippet}
                        </pre>
                      </div>
                      <ol className="space-y-2">
                        {[
                          'Open your page in the website builder',
                          'Add an "Embed" block (usually found under Add Elements or the </> icon)',
                          'Paste the code above into the embed block',
                          'Publish your page',
                        ].map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs text-foreground/80">
                            <span className="size-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      Save your widget first to get the embed code.
                    </p>
                  )}
                </div>
              )}

              {/* ── Developer tab ── */}
              {embedTab === 'dev' && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Add to any HTML page. Testimonials render directly in your page DOM so Google indexes them as your content. Zero style conflicts (Shadow DOM isolation).
                  </p>
                  {savedWidgetId ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-foreground/70">Paste before <code className="bg-muted px-1 rounded">&lt;/body&gt;</code></span>
                          <CopyCodeButton code={scriptSnippet} />
                        </div>
                        <pre className="rounded-xl bg-gray-950 p-3 text-xs text-emerald-400 overflow-x-auto font-mono leading-relaxed">
                          {scriptSnippet}
                        </pre>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Updates automatically when you approve new testimonials. Also adds star rating schema markup to your page for Google rich snippets.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      Save your widget first to get the embed code.
                    </p>
                  )}
                </div>
              )}

              {/* ── React tab ── */}
              {embedTab === 'react' && (
                <div className="space-y-4">
                  {userPlan !== 'pro' ? (
                    /* Pro gate */
                    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 text-center">
                      <div className="inline-flex items-center justify-center size-12 rounded-xl bg-indigo-100 mb-3">
                        <Lock className="size-5 text-indigo-600" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">React component is Pro</p>
                      <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                        Get a copy-paste React component that fetches your testimonials directly from
                        the Vouch API. No npm install, no iframe, full control over styling.
                      </p>
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                        onClick={() => window.location.href = '/dashboard/settings?tab=billing'}
                      >
                        <Zap className="size-3.5" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  ) : (
                    /* Pro content */
                    <>
                      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex items-start gap-2.5">
                        <Code2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-indigo-800">No npm install needed</p>
                          <p className="text-xs text-indigo-700/80 mt-0.5">
                            Copy this component into your Next.js or React project. It fetches your
                            approved testimonials directly from the Vouch API. Style it with your own
                            Tailwind classes.
                          </p>
                        </div>
                      </div>
                      {savedWidgetId ? (
                        <>
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-medium text-foreground/70">
                                Paste into <code className="bg-muted px-1 rounded">components/Testimonials.tsx</code>
                              </span>
                              <CopyCodeButton code={reactSnippet} />
                            </div>
                            <pre className="rounded-xl bg-gray-950 p-3 text-xs text-emerald-400 overflow-x-auto font-mono leading-relaxed max-h-72">
                              {reactSnippet}
                            </pre>
                          </div>
                          <ol className="space-y-2">
                            {[
                              'Copy the component above into your project',
                              'Import and render it: <Testimonials />',
                              'Style the blockquote and grid with your own Tailwind classes',
                              'Testimonials update automatically as you approve new ones',
                            ].map((step, i) => (
                              <li key={i} className="flex items-start gap-3 text-xs text-foreground/80">
                                <span className="size-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </>
                      ) : (
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          Save your widget first to get the component code.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Pro upgrade for branding ── */}
          {userPlan === 'free' && (
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-indigo-100 p-2 shrink-0">
                  <Zap className="size-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-indigo-900">Upgrade to Pro</p>
                  <p className="text-xs text-indigo-700/80 mt-0.5">
                    Remove branding, get all layouts, and create unlimited widgets.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/stripe/checkout', { method: 'POST' });
                        const { url } = await res.json();
                        if (url) window.location.href = url;
                      } catch {
                        toast.error('Could not start checkout');
                      }
                    }}
                  >
                    <Zap className="size-3.5" />
                    Upgrade to Pro, $19/mo
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

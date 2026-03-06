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
  Plus,
  Trash2,
  X,
  ChevronDown,
  Palette,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useProject } from '@/context/ProjectContext';
import { UpgradeModal } from '@/components/upgrade-modal';
import { GOOGLE_FONTS, resolveFontUrl, sanitizeFontUrl } from '@/lib/fonts';

// ─── Types ────────────────────────────────────────────────────────────────────
type WidgetLayout = 'grid' | 'carousel' | 'wall' | 'list' | 'single';
type FilterMode = 'all' | 'featured' | 'rating';

interface WidgetTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardStyle: 'shadow' | 'border' | 'flat';
  fontFamily: string;
  fontUrl: string | null;
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
  { value: 'single', label: 'Single', icon: <Star className="size-5" />, desc: 'Featured card' },
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

  const cardStyles: React.CSSProperties = {
    backgroundColor: theme.backgroundColor,
    ...(theme.cardStyle === 'shadow'
      ? { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }
      : theme.cardStyle === 'border'
        ? { boxShadow: 'none' }
        : { boxShadow: 'none', borderColor: 'transparent' }),
  };

  return (
    <div
      className={cn('rounded-xl p-4', theme.cardStyle !== 'flat' && 'border border-border/60')}
      style={cardStyles}
    >
      {theme.showRating && <StarRating rating={testimonial.rating} color={theme.primaryColor} />}
      <p className={cn('mt-2 text-sm leading-relaxed', compact && 'text-xs')} style={{ color: theme.textColor + 'd9' }}>{truncated}</p>
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
          <p className="text-xs font-semibold" style={{ color: theme.textColor }}>{testimonial.author_name}</p>
          {roleCompany && <p className="text-xs" style={{ color: theme.textColor + '80' }}>{roleCompany}</p>}
        </div>
        {theme.showDate && (
          <span className="ml-auto text-xs" style={{ color: theme.textColor + '60' }}>
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

// ─── Collapsible Section ──────────────────────────────────────────────────────
function CollapsibleSection({
  id,
  title,
  icon,
  summary,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  summary?: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 w-full px-5 py-3.5 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        {!isOpen && summary && (
          <span className="text-xs text-muted-foreground truncate max-w-[140px]">{summary}</span>
        )}
        <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="px-5 pb-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WidgetsPage() {
  const supabase = createClient();
  const { selectedProjectId, selectedProject, plan: userPlan, showAllProjects, projects } = useProject();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [orderedTestimonials, setOrderedTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [saving, setSaving] = useState(false);
  const [embedTab, setEmbedTab] = useState<'link' | 'builder' | 'dev' | 'react'>('builder');

  // Multi-widget state
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [creatingWidget, setCreatingWidget] = useState(false);
  const [deletingWidgetId, setDeletingWidgetId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [totalWidgetCount, setTotalWidgetCount] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Collapsible section state (multi-open allowed)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['layout']));
  const toggleSection = useCallback((section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  // Embed modal state
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  const [settings, setSettings] = useState<WidgetSettings>({
    name: 'My Widget',
    layout: 'grid',
    theme: {
      primaryColor: '#6366F1',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      cardStyle: 'shadow',
      fontFamily: 'inherit',
      fontUrl: null,
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

  // ── Default settings ─────────────────────────────────────────────────────
  const DEFAULT_SETTINGS: WidgetSettings = useMemo(() => ({
    name: 'My Widget',
    layout: 'grid' as WidgetLayout,
    theme: {
      primaryColor: '#6366F1',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      cardStyle: 'shadow' as const,
      fontFamily: 'inherit',
      fontUrl: null,
      showRating: true,
      showAvatar: true,
      showDate: true,
    },
    filterMode: 'all' as FilterMode,
    minRating: 4,
    maxItems: 12,
    hideBranding: false,
    pinnedIds: [],
  }), []);

  // ── Load widget settings into the builder ──────────────────────────────────
  const loadWidgetIntoSettings = useCallback((widget: Widget, fetchedTestimonials: Testimonial[]) => {
    const loadedPinnedIds: string[] = Array.isArray(widget.pinned_ids)
      ? (widget.pinned_ids as string[])
      : [];

    if (loadedPinnedIds.length > 0) {
      const orderMap = new Map(loadedPinnedIds.map((id, idx) => [id, idx]));
      setOrderedTestimonials([...fetchedTestimonials].sort((a, b) =>
        (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity)
      ));
    } else {
      setOrderedTestimonials(fetchedTestimonials);
    }

    const loadedTheme = widget.theme as WidgetTheme;
    setSettings({
      name: widget.name,
      layout: widget.layout,
      theme: {
        primaryColor: loadedTheme.primaryColor ?? '#6366F1',
        backgroundColor: loadedTheme.backgroundColor ?? '#ffffff',
        textColor: loadedTheme.textColor ?? '#0f172a',
        cardStyle: loadedTheme.cardStyle ?? 'shadow',
        fontFamily: loadedTheme.fontFamily ?? 'inherit',
        fontUrl: loadedTheme.fontUrl ?? null,
        showRating: loadedTheme.showRating ?? true,
        showAvatar: loadedTheme.showAvatar ?? true,
        showDate: loadedTheme.showDate ?? true,
      },
      filterMode: widget.filter_mode,
      minRating: widget.min_rating,
      maxItems: widget.max_items,
      hideBranding: widget.hide_branding,
      pinnedIds: loadedPinnedIds,
    });
  }, []);

  // ── Fetch approved testimonials and all widgets for project ─────────────
  const fetchData = useCallback(async () => {
    if (!selectedProjectId && !showAllProjects) {
      setLoadingTestimonials(false);
      return;
    }
    setLoadingTestimonials(true);
    // Reset widget state when project changes
    setActiveWidgetId(null);
    setWidgets([]);
    setSettings(DEFAULT_SETTINGS);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const scopeByProject = !showAllProjects && selectedProjectId;

      let testimonialsQuery = supabase
        .from('testimonials')
        .select('id, author_name, author_role, author_company, author_avatar_url, rating, content, featured, created_at')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (scopeByProject) {
        testimonialsQuery = testimonialsQuery.eq('project_id', selectedProjectId);
      }

      const testimonialsRes = await testimonialsQuery;

      const fetchedTestimonials = (testimonialsRes.data as Testimonial[]) ?? [];
      setTestimonials(fetchedTestimonials);
      setOrderedTestimonials(fetchedTestimonials);

      // Load widgets scoped by project or all
      let widgetsQuery = supabase
        .from('widgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (scopeByProject) {
        widgetsQuery = widgetsQuery.eq('project_id', selectedProjectId);
      }

      const { data: widgetsData } = await widgetsQuery;

      const loadedWidgets = (widgetsData as Widget[]) ?? [];
      setWidgets(loadedWidgets);

      // Count total widgets across all projects for free plan gate
      const { count } = await supabase
        .from('widgets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setTotalWidgetCount(count ?? 0);

      // Auto-select first widget
      if (loadedWidgets.length > 0) {
        setActiveWidgetId(loadedWidgets[0].id);
        loadWidgetIntoSettings(loadedWidgets[0], fetchedTestimonials);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTestimonials(false);
    }
  }, [supabase, selectedProjectId, showAllProjects, DEFAULT_SETTINGS, loadWidgetIntoSettings]);

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
  const updateTheme = useCallback((key: keyof WidgetTheme, value: string | boolean | null) => {
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

  // ── Switch widget ────────────────────────────────────────────────────────
  const handleSwitchWidget = useCallback((widgetId: string) => {
    const widget = widgets.find((w) => w.id === widgetId);
    if (!widget) return;
    setActiveWidgetId(widgetId);
    loadWidgetIntoSettings(widget, testimonials);
  }, [widgets, testimonials, loadWidgetIntoSettings]);

  // ── Create widget ──────────────────────────────────────────────────────────
  const handleCreateWidget = useCallback(async () => {
    if (!selectedProjectId) {
      toast.error('No project found. Create a project in Settings first.');
      return;
    }
    // Free plan gate: max 1 widget total across all projects
    if (userPlan === 'free' && totalWidgetCount >= 1) {
      setShowUpgradePrompt(true);
      return;
    }

    setCreatingWidget(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const widgetNumber = widgets.length + 1;
      const payload = {
        user_id: user.id,
        project_id: selectedProjectId,
        name: `Widget ${widgetNumber}`,
        layout: 'grid' as WidgetLayout,
        theme: DEFAULT_SETTINGS.theme,
        filter_mode: DEFAULT_SETTINGS.filterMode,
        min_rating: DEFAULT_SETTINGS.minRating,
        max_items: DEFAULT_SETTINGS.maxItems,
        hide_branding: DEFAULT_SETTINGS.hideBranding,
        pinned_ids: DEFAULT_SETTINGS.pinnedIds,
      };

      const { data, error } = await supabase.from('widgets').insert(payload).select('*').single();
      if (error) throw error;

      const newWidget = data as Widget;
      setWidgets((prev) => [...prev, newWidget]);
      setTotalWidgetCount((prev) => prev + 1);
      setActiveWidgetId(newWidget.id);
      setSettings({ ...DEFAULT_SETTINGS, name: newWidget.name });
      setOrderedTestimonials(testimonials);
      toast.success('Widget created');
    } catch (err) {
      toast.error('Failed to create widget');
      console.error(err);
    } finally {
      setCreatingWidget(false);
    }
  }, [supabase, selectedProjectId, userPlan, totalWidgetCount, widgets.length, testimonials, DEFAULT_SETTINGS]);

  // ── Delete widget ──────────────────────────────────────────────────────────
  const handleDeleteWidget = useCallback(async (widgetId: string) => {
    setDeletingWidgetId(widgetId);
    try {
      const { error } = await supabase.from('widgets').delete().eq('id', widgetId);
      if (error) throw error;

      setWidgets((prev) => {
        const remaining = prev.filter((w) => w.id !== widgetId);
        // If we deleted the active widget, switch to the next one or clear
        if (activeWidgetId === widgetId) {
          if (remaining.length > 0) {
            setActiveWidgetId(remaining[0].id);
            loadWidgetIntoSettings(remaining[0], testimonials);
          } else {
            setActiveWidgetId(null);
            setSettings(DEFAULT_SETTINGS);
            setOrderedTestimonials(testimonials);
          }
        }
        return remaining;
      });
      setTotalWidgetCount((prev) => Math.max(0, prev - 1));
      setConfirmDeleteId(null);
      toast.success('Widget deleted');
    } catch (err) {
      toast.error('Failed to delete widget');
      console.error(err);
    } finally {
      setDeletingWidgetId(null);
    }
  }, [supabase, activeWidgetId, testimonials, DEFAULT_SETTINGS, loadWidgetIntoSettings]);

  // ── Save widget ───────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!selectedProjectId) {
      toast.error('No project found. Create a project in Settings first.');
      return;
    }
    if (!activeWidgetId) {
      toast.error('No widget selected. Create a widget first.');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        user_id: user.id,
        project_id: selectedProjectId,
        name: settings.name,
        layout: settings.layout,
        theme: settings.theme,
        filter_mode: settings.filterMode,
        min_rating: settings.minRating,
        max_items: settings.maxItems,
        hide_branding: settings.hideBranding,
        pinned_ids: settings.pinnedIds,
      };

      const { error } = await supabase.from('widgets').update(payload).eq('id', activeWidgetId);
      if (error) throw error;

      // Update local widgets state with new settings
      setWidgets((prev) =>
        prev.map((w) =>
          w.id === activeWidgetId
            ? { ...w, name: settings.name, layout: settings.layout, theme: settings.theme as WidgetTheme, filter_mode: settings.filterMode, min_rating: settings.minRating, max_items: settings.maxItems, hide_branding: settings.hideBranding, pinned_ids: settings.pinnedIds }
            : w
        )
      );
      toast.success('Widget saved successfully');
    } catch (err) {
      toast.error('Failed to save widget');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [supabase, selectedProjectId, settings, activeWidgetId]);

  // ── Embed snippets ────────────────────────────────────────────────────────
  const iframeSnippet = activeWidgetId
    ? `<iframe\n  src="${SITE_URL}/embed/${activeWidgetId}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  loading="lazy"\n></iframe>`
    : '';

  // Shadow DOM embed: renders testimonials directly in the page DOM (SEO-friendly).
  // Attribute name 'data-vouch' must match public/embed.js exactly. Do not rename either.
  const scriptSnippet = activeWidgetId
    ? `<div data-vouch="${activeWidgetId}"></div>\n<script src="${SITE_URL}/embed.js" defer></script>`
    : '';

  const reactSnippet = activeWidgetId
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
    fetch('${SITE_URL}/api/testimonials/widget/${activeWidgetId}')
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
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Widget Builder</h1>
          {activeWidgetId ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                value={settings.name}
                onChange={(e) => update('name', e.target.value)}
                className="text-sm text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-indigo-400 focus:outline-none transition-colors py-0.5 min-w-0 max-w-[240px]"
                placeholder="Widget name"
              />
            </div>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Customize your testimonial widget and embed it on your website.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {activeWidgetId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmbedModal(true)}
                className="gap-1.5 rounded-xl"
              >
                <Code2 className="size-3.5" />
                <span className="hidden sm:inline">Get Code</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {!selectedProjectId && !loadingTestimonials && (
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

      {/* ── Widget Selector Bar ── */}
      {selectedProjectId && !loadingTestimonials && (
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {widgets.map((widget) => {
              const isActive = widget.id === activeWidgetId;
              const layoutIcon = LAYOUT_OPTIONS.find((l) => l.value === widget.layout)?.icon;
              return (
                <div key={widget.id} className="relative group shrink-0">
                  <button
                    onClick={() => handleSwitchWidget(widget.id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-2 transition-all',
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/60 text-indigo-700'
                        : 'border-border text-muted-foreground hover:border-indigo-200 hover:bg-muted/30'
                    )}
                  >
                    <span className="size-4 shrink-0">{layoutIcon}</span>
                    <div className="text-left min-w-0">
                      <span className="block text-sm font-medium truncate max-w-[180px]">{widget.name}</span>
                      <span className={cn(
                        'block text-[10px] leading-tight',
                        isActive ? 'text-indigo-500/70' : 'text-muted-foreground/60'
                      )}>
                        {showAllProjects && projects.length > 1
                          ? `${projects.find((p) => p.id === widget.project_id)?.name ?? 'Unknown'} · ${LAYOUT_OPTIONS.find((l) => l.value === widget.layout)?.label}`
                          : LAYOUT_OPTIONS.find((l) => l.value === widget.layout)?.label}
                      </span>
                    </div>
                  </button>
                  {/* Delete button on hover */}
                  {widgets.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirmDeleteId === widget.id) {
                          handleDeleteWidget(widget.id);
                        } else {
                          setConfirmDeleteId(widget.id);
                        }
                      }}
                      disabled={deletingWidgetId === widget.id}
                      className={cn(
                        'absolute -top-1.5 -right-1.5 size-5 rounded-full flex items-center justify-center transition-all',
                        confirmDeleteId === widget.id
                          ? 'bg-red-500 text-white'
                          : 'bg-muted border border-border text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 hover:border-red-200',
                        deletingWidgetId === widget.id && 'opacity-50'
                      )}
                      title={confirmDeleteId === widget.id ? 'Click again to confirm' : 'Delete widget'}
                    >
                      {deletingWidgetId === widget.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : confirmDeleteId === widget.id ? (
                        <Check className="size-3" />
                      ) : (
                        <X className="size-3" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
            {/* Create new widget button */}
            <button
              onClick={handleCreateWidget}
              disabled={creatingWidget}
              className={cn(
                'flex items-center gap-1.5 rounded-xl border-2 border-dashed px-3 py-2 text-sm font-medium transition-all shrink-0',
                'border-border text-muted-foreground hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30',
                creatingWidget && 'opacity-50 cursor-not-allowed'
              )}
            >
              {creatingWidget ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              New Widget
            </button>
          </div>
          {/* Clear delete confirmation when clicking elsewhere */}
          {confirmDeleteId && (
            <button
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setConfirmDeleteId(null)}
              aria-label="Cancel delete"
            />
          )}
        </div>
      )}

      {/* ── Empty State: No widgets yet ── */}
      {selectedProjectId && !loadingTestimonials && widgets.length === 0 && !activeWidgetId && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-2xl bg-indigo-50 p-4 mb-4">
            <LayoutGrid className="size-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Create your first widget</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Widgets let you embed testimonials on your website. Choose a layout, customize the design, and copy the embed code.
          </p>
          <Button
            onClick={handleCreateWidget}
            disabled={creatingWidget}
            className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
          >
            {creatingWidget ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Create Widget
          </Button>
        </div>
      )}

      {/* ── Builder (only shown when a widget is selected) ── */}
      {activeWidgetId && <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        {/* ── Left Panel: Settings ── */}
        <div className="order-2 xl:order-1">
          <div className="bg-white rounded-2xl border border-border overflow-hidden">

          {/* Layout (always visible, not collapsible) */}
          <div className="px-5 pt-5 pb-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Layout</h3>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
              {LAYOUT_OPTIONS.map((opt) => {
                const isProLayout = opt.value !== 'grid';
                const isLocked = isProLayout && userPlan === 'free';
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (isLocked) {
                        setShowUpgradePrompt(true);
                        return;
                      }
                      update('layout', opt.value);
                    }}
                    className={cn(
                      'relative flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all shrink-0',
                      isLocked
                        ? 'border-border text-muted-foreground/50 cursor-not-allowed bg-muted/20'
                        : settings.layout === opt.value
                        ? 'border-indigo-500 bg-indigo-50/60 text-indigo-700'
                        : 'border-border text-muted-foreground hover:border-indigo-200 hover:bg-muted/30'
                    )}
                  >
                    <span className="size-4">{opt.icon}</span>
                    {opt.label}
                    {isLocked && <Lock className="size-2.5 text-muted-foreground/50" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Appearance (collapsible) */}
          <CollapsibleSection
            id="appearance"
            title="Appearance"
            icon={<Palette className="size-4" />}
            summary={`${settings.theme.cardStyle} · ${settings.theme.primaryColor}`}
            isOpen={openSections.has('appearance')}
            onToggle={toggleSection}
          >

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
                  <button
                    type="button"
                    className="size-7 rounded-full border-2 border-border shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: settings.theme.primaryColor }}
                    title="Click to edit hex color"
                    onClick={(e) => { const input = (e.currentTarget.nextElementSibling as HTMLInputElement); input?.focus(); input?.select(); }}
                  />
                  <input
                    type="text"
                    value={settings.theme.primaryColor}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (!v.startsWith('#')) v = '#' + v;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateTheme('primaryColor', v);
                    }}
                    onBlur={() => {
                      if (!/^#[0-9A-Fa-f]{6}$/.test(settings.theme.primaryColor)) updateTheme('primaryColor', '#6366F1');
                    }}
                    maxLength={7}
                    aria-label="Primary color hex value"
                    className="w-20 text-xs font-mono px-2 py-1 rounded border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="#6366F1"
                  />
                </div>
              </div>
              <details className="mt-2 group">
                <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none list-none flex items-center gap-1">
                  <span className="group-open:hidden">▸</span>
                  <span className="hidden group-open:inline">▾</span>
                  How do I find my brand color?
                </summary>
                <div className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed space-y-1 pl-3 border-l-2 border-border">
                  <p>1. Go to <a href="https://imagecolorpicker.com" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">imagecolorpicker.com</a></p>
                  <p>2. Upload your logo or a screenshot of your website</p>
                  <p>3. Click on the color you want</p>
                  <p>4. Copy the code starting with # and paste it above</p>
                </div>
              </details>
            </div>

            {/* Background Color */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Background Color</Label>
              <div className="flex items-center gap-2 flex-wrap">
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
                  <button
                    type="button"
                    className="size-7 rounded-full border-2 border-border shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: settings.theme.backgroundColor }}
                    title="Click to edit hex color"
                    onClick={(e) => { const input = (e.currentTarget.nextElementSibling as HTMLInputElement); input?.focus(); input?.select(); }}
                  />
                  <input
                    type="text"
                    value={settings.theme.backgroundColor}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (!v.startsWith('#')) v = '#' + v;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateTheme('backgroundColor', v);
                    }}
                    onBlur={() => {
                      if (!/^#[0-9A-Fa-f]{6}$/.test(settings.theme.backgroundColor)) updateTheme('backgroundColor', '#ffffff');
                    }}
                    maxLength={7}
                    aria-label="Background color hex value"
                    className="w-20 text-xs font-mono px-2 py-1 rounded border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Text Color</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {['#0f172a', '#1e293b', '#374151', '#4b5563', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateTheme('textColor', c)}
                    title={c}
                    className={cn(
                      'size-7 rounded-full border-2 transition-all',
                      settings.theme.textColor === c
                        ? 'border-foreground scale-110 shadow-md'
                        : 'border-border hover:scale-105'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="size-7 rounded-full border-2 border-border shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: settings.theme.textColor }}
                    title="Click to edit hex color"
                    onClick={(e) => { const input = (e.currentTarget.nextElementSibling as HTMLInputElement); input?.focus(); input?.select(); }}
                  />
                  <input
                    type="text"
                    value={settings.theme.textColor}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (!v.startsWith('#')) v = '#' + v;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateTheme('textColor', v);
                    }}
                    onBlur={() => {
                      if (!/^#[0-9A-Fa-f]{6}$/.test(settings.theme.textColor)) updateTheme('textColor', '#0f172a');
                    }}
                    maxLength={7}
                    aria-label="Text color hex value"
                    className="w-20 text-xs font-mono px-2 py-1 rounded border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="#0f172a"
                  />
                </div>
              </div>
            </div>

            {/* Card Style */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Card Style</Label>
              <div className="flex gap-2">
                {([
                  { value: 'shadow' as const, label: 'Shadow' },
                  { value: 'border' as const, label: 'Border' },
                  { value: 'flat' as const, label: 'Flat' },
                ]).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateTheme('cardStyle', value)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all border',
                      settings.theme.cardStyle === value
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-border text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Font</Label>
              <Select
                value={settings.theme.fontFamily}
                onValueChange={(val) => {
                  if (val === 'inherit') {
                    updateTheme('fontFamily', 'inherit');
                    updateTheme('fontUrl', null);
                  } else if (val === '__custom__') {
                    updateTheme('fontFamily', 'inherit');
                  } else {
                    updateTheme('fontFamily', val);
                    updateTheme('fontUrl', null);
                  }
                }}
              >
                <SelectTrigger className="rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Inherit from page</SelectItem>
                  {GOOGLE_FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {settings.theme.fontFamily !== 'inherit' && (
                <div className="mt-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Custom CSS URL (optional)</Label>
                  <Input
                    value={settings.theme.fontUrl ?? ''}
                    onChange={(e) => updateTheme('fontUrl', e.target.value || null)}
                    placeholder="https://fonts.adobe.com/..."
                    className="rounded-xl text-sm"
                  />
                </div>
              )}
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

            {/* Branding (merged into Appearance) */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <p className="text-sm text-foreground/80">Remove &quot;Powered by Vouch&quot;</p>
              </div>
              {userPlan !== 'free' ? (
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
          </CollapsibleSection>

          {/* Content & Filter (collapsible) */}
          <CollapsibleSection
            id="content"
            title="Content & Filter"
            icon={<SlidersHorizontal className="size-4" />}
            summary={`${settings.filterMode === 'all' ? 'All' : settings.filterMode} · max ${settings.maxItems}`}
            isOpen={openSections.has('content')}
            onToggle={toggleSection}
          >
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
          </CollapsibleSection>

          {/* Display Order (collapsible) */}
          {testimonials.length > 0 && (
            <CollapsibleSection
              id="order"
              title="Display Order"
              icon={<ArrowUpDown className="size-4" />}
              summary={`${orderedTestimonials.length} items`}
              isOpen={openSections.has('order')}
              onToggle={toggleSection}
            >
              <p className="text-xs text-muted-foreground">
                Drag to set the order. Filter and max items still apply.
              </p>
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
            </CollapsibleSection>
          )}

          </div>
        </div>

        {/* ── Right Panel: Preview ── */}
        <div className="order-1 xl:order-2 space-y-5">
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

            {/* Font loading for preview */}
            {settings.theme.fontFamily !== 'inherit' && resolveFontUrl(settings.theme.fontFamily, settings.theme.fontUrl) && (
              // eslint-disable-next-line @next/next/no-page-custom-font
              <link rel="stylesheet" href={resolveFontUrl(settings.theme.fontFamily, settings.theme.fontUrl)!} />
            )}

            {/* Preview Area */}
            <div
              className="p-5"
              style={{
                backgroundColor: settings.theme.backgroundColor + '80',
                fontFamily: settings.theme.fontFamily !== 'inherit'
                  ? `"${settings.theme.fontFamily}", sans-serif`
                  : undefined,
              }}
            >
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
                    {settings.layout === 'single' && previewTestimonials.length > 0 && (
                      <div className="max-w-lg mx-auto">
                        <TestimonialPreviewCard testimonial={previewTestimonials[0]} theme={settings.theme} />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Vouch branding */}
              {!settings.hideBranding && (
                <div className="mt-4 flex justify-center">
                  <a href="/via" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    Powered by{' '}
                    <span style={{ color: settings.theme.primaryColor }} className="font-semibold">
                      Vouch
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>}

      {/* ── Embed Code Modal ── */}
      <AnimatePresence>
        {showEmbedModal && activeWidgetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowEmbedModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-white rounded-2xl border border-border overflow-hidden w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl"
            >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-foreground">Add to your website</h3>
              </div>
              <button onClick={() => setShowEmbedModal(false)} className="rounded-lg p-1 hover:bg-muted transition-colors">
                <X className="size-4 text-muted-foreground" />
              </button>
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
                  icon: userPlan === 'free'
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
                    {selectedProject?.slug ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                          <Globe className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-mono text-foreground truncate">
                            {SITE_URL}/p/{selectedProject?.slug}
                          </span>
                        </div>
                        <CopyCodeButton code={`${SITE_URL}/p/${selectedProject?.slug}`} />
                        <a
                          href={`/p/${selectedProject?.slug}`}
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
                  {activeWidgetId ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-foreground/70">Paste this code:</span>
                          <CopyCodeButton code={scriptSnippet} />
                        </div>
                        <pre className="rounded-xl bg-gray-950 p-3 text-xs text-emerald-400 overflow-x-auto font-mono leading-relaxed">
                          {scriptSnippet}
                        </pre>
                      </div>
                      <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                        This embed is SEO-friendly. Google will index your testimonials as part of your page.
                      </p>
                      <ol className="space-y-2">
                        {[
                          'Open your page in the website builder',
                          'Add an "Embed" or "Custom Code" block',
                          'Paste the code above into the block',
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
                      Click "Save Widget" above to generate your embed code.
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
                  {activeWidgetId ? (
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
                      Click "Save Widget" above to generate your embed code.
                    </p>
                  )}
                </div>
              )}

              {/* ── React tab ── */}
              {embedTab === 'react' && (
                <div className="space-y-4">
                  {userPlan === 'free' ? (
                    /* Pro gate */
                    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 text-center">
                      <div className="inline-flex items-center justify-center size-12 rounded-xl bg-indigo-100 mb-3">
                        <Lock className="size-5 text-indigo-600" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">React component is a paid feature</p>
                      <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                        Get a copy-paste React component that fetches your testimonials directly from
                        the Vouch API. No npm install, no iframe, full control over styling.
                      </p>
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                        onClick={() => setShowUpgradePrompt(true)}
                      >
                        <Zap className="size-3.5" />
                        View plans
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
                      {activeWidgetId ? (
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upgrade Prompt ── */}
      <UpgradeModal open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt} />
    </motion.div>
  );
}

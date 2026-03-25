'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { toast } from 'sonner';
import {
  Palette,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  GripVertical,
  Star,
  Save,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useProject } from '@/context/ProjectContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface PublicPageTheme {
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  cardStyle: 'shadow' | 'border' | 'flat';
  textSize: 'compact' | 'default' | 'large';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  showRating: boolean;
  showAvatar: boolean;
  showDate: boolean;
  showMetric: boolean;
}

interface PublicPageSettings {
  theme: PublicPageTheme;
  filterMode: 'all' | 'featured' | 'rating';
  minRating: number;
  maxItems: number;
  pinnedIds: string[];
}

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_avatar_url: string | null;
  content: string | null;
  rating: number;
  featured: boolean;
  video_url: string | null;
  video_thumbnail_url: string | null;
  created_at: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_THEME: PublicPageTheme = {
  primaryColor: '#6366F1',
  backgroundColor: '#f9fafb',
  cardColor: '#ffffff',
  textColor: '#0f172a',
  cardStyle: 'shadow',
  textSize: 'default',
  borderRadius: 'medium',
  showRating: true,
  showAvatar: true,
  showDate: true,
  showMetric: false,
};

const DEFAULT_SETTINGS: PublicPageSettings = {
  theme: DEFAULT_THEME,
  filterMode: 'all',
  minRating: 4,
  maxItems: 12,
  pinnedIds: [],
};

const COLOR_PRESETS = [
  { value: '#6366F1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#f43f5e', label: 'Rose' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#0ea5e9', label: 'Sky' },
];

const BG_PRESETS = ['#ffffff', '#f8fafc', '#f1f5f9', '#fafafa', '#f9fafb'];
const TEXT_PRESETS = ['#0f172a', '#1e293b', '#374151', '#4b5563'];
const CARD_PRESETS = ['#ffffff', '#f8fafc', '#f1f5f9', '#fafafa'];

const BR_MAP: Record<string, string> = { none: '0px', small: '8px', medium: '14px', large: '20px' };

// ── Helpers ──────────────────────────────────────────────────────────────────

function hexAlpha(color: string, alpha: number): string {
  const m = color.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (m) return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
  return `rgba(0,0,0,${alpha})`;
}

// ── CollapsibleSection ───────────────────────────────────────────────────────

function CollapsibleSection({
  id, title, icon, summary, isOpen, onToggle, children,
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
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="size-4 text-muted-foreground" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Color Picker ─────────────────────────────────────────────────────────────

function ColorPicker({
  label, value, presets, fallback, onChange,
}: {
  label: string;
  value: string;
  presets: string[] | { value: string; label: string }[];
  fallback: string;
  onChange: (v: string) => void;
}) {
  const items = presets.map((p) => typeof p === 'string' ? { value: p, label: p } : p);
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-2 block">{label}</Label>
      <div className="flex items-center gap-2 flex-wrap">
        {items.map((c) => (
          <button
            key={c.value}
            onClick={() => onChange(c.value)}
            title={c.label}
            className={cn(
              'size-7 rounded-full border-2 transition-all',
              value === c.value ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'
            )}
            style={{ backgroundColor: c.value }}
          />
        ))}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="size-7 rounded-full border-2 border-border shrink-0 cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: value }}
            onClick={(e) => { const input = (e.currentTarget.nextElementSibling as HTMLInputElement); input?.focus(); input?.select(); }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              let v = e.target.value;
              if (!v.startsWith('#')) v = '#' + v;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
            }}
            onBlur={() => { if (!/^#[0-9A-Fa-f]{6}$/.test(value)) onChange(fallback); }}
            maxLength={7}
            className="w-20 text-xs font-mono px-2 py-1 rounded border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder={fallback}
          />
        </div>
      </div>
    </div>
  );
}

// ── Segmented Control ────────────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all border',
            value === opt.value
              ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
              : 'border-border text-muted-foreground hover:bg-muted/50'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Preview Card ─────────────────────────────────────────────────────────────

function PreviewCard({ t, theme }: { t: Testimonial; theme: PublicPageTheme }) {
  const br = BR_MAP[theme.borderRadius] || '14px';
  const cs = theme.cardStyle;
  const border = cs === 'border' ? `1px solid ${hexAlpha(theme.textColor, 0.15)}` : 'none';
  const shadow = cs === 'shadow' ? '0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)' : 'none';
  const ts = theme.textSize || 'compact';
  const quoteSize = ts === 'large' ? 17 : ts === 'default' ? 15 : 14;
  const nameSize = ts === 'large' ? 14 : ts === 'default' ? 14 : 13;
  const roleSize = ts === 'large' ? 12 : ts === 'default' ? 12 : 11;
  const pad = ts === 'compact' ? '14px 16px' : '24px';
  const gap = ts === 'compact' ? '10px' : '16px';
  const content = t.content || '';
  const roleCompany = [t.author_role, t.author_company].filter(Boolean).join(', ');
  const initials = t.author_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const vDate = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <article style={{
      background: theme.cardColor,
      border,
      boxShadow: shadow,
      borderRadius: br,
      padding: pad,
      display: 'flex',
      flexDirection: 'column',
      gap,
      width: '100%',
      ...(t.featured ? { borderLeft: `3px solid ${theme.primaryColor}` } : {}),
    }}>
      {theme.showRating && (
        <div style={{ display: 'flex', gap: '2px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="size-3.5"
              fill={s <= t.rating ? theme.primaryColor : 'none'}
              stroke={s <= t.rating ? theme.primaryColor : hexAlpha(theme.textColor, 0.22)}
            />
          ))}
        </div>
      )}
      {content && (
        <p style={{ fontSize: quoteSize, lineHeight: 1.65, margin: 0, color: theme.textColor,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' as any }}>
          &ldquo;{content}&rdquo;
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 'auto' }}>
        {theme.showAvatar && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            {t.author_avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.author_avatar_url} alt={t.author_name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: theme.primaryColor + '20', color: theme.primaryColor,
                fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {initials}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: nameSize, color: theme.textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.author_name}</div>
              {roleCompany && <div style={{ fontSize: roleSize, color: hexAlpha(theme.textColor, 0.55), lineHeight: 1.4 }}>{roleCompany}</div>}
            </div>
          </div>
        )}
        {theme.showDate && (
          <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0, whiteSpace: 'nowrap' }}>&#10003; {vDate}</span>
        )}
      </div>
      {t.video_url && t.video_thumbnail_url && (
        <div style={{ position: 'relative', width: '100%', borderRadius: '8px', marginTop: '8px', overflow: 'hidden', background: '#000' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.video_thumbnail_url} alt="" style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="8,5 20,12 8,19"/></svg>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PublicPageSettingsPage() {
  const supabase = createClient();
  const { selectedProjectId, plan } = useProject();

  const [settings, setSettings] = useState<PublicPageSettings>(DEFAULT_SETTINGS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [orderedTestimonials, setOrderedTestimonials] = useState<Testimonial[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['appearance']));
  const [slug, setSlug] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    if (!savedSnapshot) return false;
    return JSON.stringify(settings) !== savedSnapshot;
  }, [settings, savedSnapshot]);

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const updateTheme = useCallback((key: keyof PublicPageTheme, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, theme: { ...prev.theme, [key]: value } }));
  }, []);

  // Load project settings + testimonials
  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);

    (async () => {
      const { data: project } = await supabase
        .from('projects')
        .select('public_page_settings, slug')
        .eq('id', selectedProjectId)
        .single();

      const pps = project?.public_page_settings as PublicPageSettings | null;
      const loaded = pps ?? DEFAULT_SETTINGS;
      setSettings(loaded);
      setSavedSnapshot(JSON.stringify(loaded));
      setSlug(project?.slug ?? null);

      const { data: tData } = await supabase
        .from('testimonials')
        .select('id, author_name, author_role, author_company, author_avatar_url, content, rating, featured, video_url, video_thumbnail_url, created_at')
        .eq('project_id', selectedProjectId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      const fetched = tData ?? [];
      setTestimonials(fetched);

      if (loaded.pinnedIds.length > 0) {
        const idxMap = new Map(loaded.pinnedIds.map((id: string, i: number) => [id, i]));
        const sorted = [...fetched].sort((a, b) => (idxMap.get(a.id) ?? Infinity) - (idxMap.get(b.id) ?? Infinity));
        setOrderedTestimonials(sorted);
      } else {
        setOrderedTestimonials(fetched);
      }

      setLoading(false);
    })();
  }, [selectedProjectId, supabase]);

  const handleReorder = useCallback((newOrder: Testimonial[]) => {
    setOrderedTestimonials(newOrder);
    setSettings((prev) => ({ ...prev, pinnedIds: newOrder.map((t) => t.id) }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedProjectId) { toast.error('No project selected'); return; }
    setSaving(true);
    try {
      const pinnedIdsToSave = settings.pinnedIds.length > 0
        ? settings.pinnedIds
        : orderedTestimonials.map((t) => t.id);

      const payload: PublicPageSettings = { ...settings, pinnedIds: pinnedIdsToSave };

      const { error } = await supabase
        .from('projects')
        .update({ public_page_settings: payload })
        .eq('id', selectedProjectId);

      if (error) throw error;
      setSettings(payload);
      setSavedSnapshot(JSON.stringify(payload));
      toast.success('Public page settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [supabase, selectedProjectId, settings, orderedTestimonials]);

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Preview testimonials
  const previewItems = useMemo(() => {
    let items = [...orderedTestimonials];
    if (settings.filterMode === 'featured') items = items.filter((t) => t.featured);
    else if (settings.filterMode === 'rating') items = items.filter((t) => t.rating >= settings.minRating);
    items = items.filter((t) => t.content || t.video_url);
    return items.slice(0, Math.min(settings.maxItems, 9));
  }, [orderedTestimonials, settings.filterMode, settings.minRating, settings.maxItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
        <div>
          <h1 className="text-lg font-bold text-foreground">Public Page</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure how your testimonial wall looks at{' '}
            {slug ? (
              <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                /p/{slug} <ExternalLink className="size-3" />
              </a>
            ) : (
              <span className="text-muted-foreground">/p/your-slug</span>
            )}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
            isDirty
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          <Save className="size-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Content: sidebar + preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Settings panel */}
        <div className="w-[340px] shrink-0 border-r border-border overflow-y-auto bg-white">
          <CollapsibleSection
            id="appearance"
            title="Appearance"
            icon={<Palette className="size-4" />}
            summary={`${settings.theme.cardStyle} · ${settings.theme.primaryColor}`}
            isOpen={openSections.has('appearance')}
            onToggle={toggleSection}
          >
            <ColorPicker label="Primary Color" value={settings.theme.primaryColor} presets={COLOR_PRESETS} fallback="#6366F1" onChange={(v) => updateTheme('primaryColor', v)} />
            <ColorPicker label="Background" value={settings.theme.backgroundColor} presets={BG_PRESETS} fallback="#f9fafb" onChange={(v) => updateTheme('backgroundColor', v)} />
            <ColorPicker label="Text Color" value={settings.theme.textColor} presets={TEXT_PRESETS} fallback="#0f172a" onChange={(v) => updateTheme('textColor', v)} />
            <ColorPicker label="Card Color" value={settings.theme.cardColor} presets={CARD_PRESETS} fallback="#ffffff" onChange={(v) => updateTheme('cardColor', v)} />

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Card Style</Label>
              <SegmentedControl
                options={[{ value: 'shadow' as const, label: 'Shadow' }, { value: 'border' as const, label: 'Border' }, { value: 'flat' as const, label: 'Flat' }]}
                value={settings.theme.cardStyle}
                onChange={(v) => updateTheme('cardStyle', v)}
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Corner Radius</Label>
              <SegmentedControl
                options={[{ value: 'none' as const, label: 'None' }, { value: 'small' as const, label: 'Small' }, { value: 'medium' as const, label: 'Medium' }, { value: 'large' as const, label: 'Large' }]}
                value={settings.theme.borderRadius}
                onChange={(v) => updateTheme('borderRadius', v)}
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Text Size</Label>
              <SegmentedControl
                options={[{ value: 'compact' as const, label: 'Compact' }, { value: 'default' as const, label: 'Default' }, { value: 'large' as const, label: 'Large' }]}
                value={settings.theme.textSize}
                onChange={(v) => updateTheme('textSize', v)}
              />
            </div>

            <div className="space-y-2 pt-1">
              {([
                { key: 'showRating' as const, label: 'Show star rating' },
                { key: 'showAvatar' as const, label: 'Show author avatar' },
                { key: 'showDate' as const, label: 'Show date' },
                { key: 'showMetric' as const, label: 'Show metric badge' },
              ]).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground/80">{label}</span>
                  <Switch
                    checked={settings.theme[key] as boolean}
                    onCheckedChange={(v) => updateTheme(key, v)}
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="filters"
            title="Filter & Limits"
            icon={<SlidersHorizontal className="size-4" />}
            summary={`${settings.filterMode === 'all' ? 'All' : settings.filterMode} · max ${settings.maxItems}`}
            isOpen={openSections.has('filters')}
            onToggle={toggleSection}
          >
            <SegmentedControl
              options={[{ value: 'all' as const, label: 'All' }, { value: 'featured' as const, label: 'Featured' }, { value: 'rating' as const, label: 'Min Rating' }]}
              value={settings.filterMode}
              onChange={(v) => setSettings((prev) => ({ ...prev, filterMode: v }))}
            />
            {settings.filterMode === 'rating' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Minimum Rating</Label>
                  <span className="text-xs font-semibold text-foreground">{settings.minRating}+</span>
                </div>
                <Slider min={1} max={5} step={1} value={[settings.minRating]}
                  onValueChange={([v]) => setSettings((prev) => ({ ...prev, minRating: v }))} />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>1 ★</span><span>5 ★</span>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">Max Items</Label>
                <span className="text-xs font-semibold text-foreground">{settings.maxItems}</span>
              </div>
              <Slider min={3} max={50} step={1} value={[settings.maxItems]}
                onValueChange={([v]) => setSettings((prev) => ({ ...prev, maxItems: v }))} />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>3</span><span>50</span>
              </div>
            </div>
          </CollapsibleSection>

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
            {orderedTestimonials.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No approved testimonials yet.</p>
            ) : (
              <Reorder.Group axis="y" values={orderedTestimonials} onReorder={handleReorder} className="space-y-1.5">
                {orderedTestimonials.map((t, idx) => (
                  <Reorder.Item
                    key={t.id}
                    value={t}
                    className="flex items-center gap-2.5 bg-muted/40 rounded-xl border border-border px-3 py-2 cursor-grab active:cursor-grabbing select-none"
                  >
                    <GripVertical className="size-3.5 text-muted-foreground/50 shrink-0" />
                    <span className="text-[10px] font-mono text-muted-foreground/40 w-4 shrink-0 text-right">{idx + 1}</span>
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {t.author_avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.author_avatar_url} alt={t.author_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] font-semibold text-indigo-600">{t.author_name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate flex-1 min-w-0">{t.author_name}</p>
                    {t.video_url && (
                      <span className="text-[9px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded-full px-1.5 py-0.5 shrink-0">
                        Video
                      </span>
                    )}
                    {t.featured && (
                      <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5 shrink-0">
                        Featured
                      </span>
                    )}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="size-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </CollapsibleSection>
        </div>

        {/* Preview panel */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: settings.theme.backgroundColor }}>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              Preview <span className="text-muted-foreground/60">· how it looks on your public page</span>
            </p>
            {previewItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-sm text-muted-foreground">No testimonials match your filters.</p>
              </div>
            ) : (
              <div style={{ columns: '280px', columnGap: '20px', padding: '4px' }}>
                {previewItems.map((t) => (
                  <div key={t.id} style={{ breakInside: 'avoid', marginBottom: '20px' }}>
                    <PreviewCard t={t} theme={settings.theme} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

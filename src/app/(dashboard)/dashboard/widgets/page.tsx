'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  ArrowLeft,
  Newspaper,
  Minus,
  Sparkles,
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
import { PLATFORMS, type WebPlatform } from '@/lib/embed-platforms';

// ─── Types ────────────────────────────────────────────────────────────────────
type WidgetLayout = 'grid' | 'carousel' | 'wall' | 'list' | 'single' | 'editorial' | 'minimal';
type FilterMode = 'all' | 'featured' | 'rating';

interface WidgetTheme {
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  cardStyle: 'shadow' | 'border' | 'flat';
  textSize: 'compact' | 'default' | 'large';
  fontFamily: string;
  fontUrl: string | null;
  showRating: boolean;
  showAvatar: boolean;
  showDate: boolean;
  showMetric: boolean;
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
  golden_sentence: string | null;
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
    author_avatar_url: '/samples/avatar-1.jpg',
    rating: 5,
    content: 'This tool completely transformed how we collect customer feedback. The setup took minutes and the results have been incredible. Highly recommend to any business owner.',
    golden_sentence: 'The setup took minutes and the results have been incredible.',
    featured: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 's2',
    author_name: 'James Wilson',
    author_role: 'Founder',
    author_company: 'Studio W',
    author_avatar_url: '/samples/avatar-2.jpg',
    rating: 5,
    content: 'The widget looks beautiful on our website and we\'ve seen a 30% increase in conversions since adding social proof. Worth every penny.',
    golden_sentence: 'we\'ve seen a 30% increase in conversions since adding social proof.',
    featured: true,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 's3',
    author_name: 'Maria Lopez',
    author_role: 'Product Designer',
    author_company: 'Designco',
    author_avatar_url: '/samples/avatar-3.jpg',
    rating: 4,
    content: 'Clean, simple, and effective. I love the automated Google review nudge. It has doubled our review count in just two months.',
    golden_sentence: 'It has doubled our review count in just two months.',
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

const LAYOUT_OPTIONS: { value: WidgetLayout; label: string; icon: React.ReactNode; desc: string; group: 'multi' | 'spotlight' }[] = [
  { value: 'grid',      label: 'Grid',         icon: <LayoutGrid className="size-4" />, desc: '2-3 columns',      group: 'multi' },
  { value: 'wall',      label: 'Wall of Love',  icon: <Heart className="size-4" />,     desc: 'Masonry layout',    group: 'multi' },
  { value: 'carousel',  label: 'Carousel',      icon: <Rows3 className="size-4" />,     desc: 'Horizontal scroll', group: 'multi' },
  { value: 'list',      label: 'List',          icon: <List className="size-4" />,      desc: 'Single column',     group: 'multi' },
  { value: 'editorial', label: 'Editorial',     icon: <Newspaper className="size-4" />, desc: 'Magazine style',    group: 'spotlight' },
  { value: 'single',    label: 'Single',        icon: <Star className="size-4" />,      desc: 'Featured card',     group: 'spotlight' },
  { value: 'minimal',   label: 'Minimal',       icon: <Minus className="size-4" />,     desc: 'Clean typography',  group: 'spotlight' },
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

  const ts = theme.textSize || 'compact';
  const quoteSize = ts === 'large' ? 17 : ts === 'default' ? 15 : (compact ? 13 : 14);
  const nameSize = ts === 'large' ? 14 : ts === 'default' ? 14 : 13;
  const roleSize = ts === 'large' ? 12 : ts === 'default' ? 12 : 11;

  const cardStyles: React.CSSProperties = {
    backgroundColor: theme.cardColor,
    ...(theme.cardStyle === 'shadow'
      ? { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }
      : theme.cardStyle === 'border'
        ? { boxShadow: 'none' }
        : { boxShadow: 'none', borderColor: 'transparent' }),
    ...(testimonial.featured ? { borderLeft: `3px solid ${theme.primaryColor}` } : {}),
  };

  return (
    <div
      className={cn('rounded-xl p-4', theme.cardStyle !== 'flat' && 'border border-border/60')}
      style={cardStyles}
    >
      {theme.showRating && <StarRating rating={testimonial.rating} color={theme.primaryColor} />}
      <p className="mt-2 leading-relaxed" style={{ fontSize: quoteSize, color: theme.textColor + 'd9' }}>{truncated}</p>
      <div className="mt-3 flex items-center gap-2">
        {theme.showAvatar && (
          <Avatar size="sm">
            {testimonial.author_avatar_url && (
              <AvatarImage src={testimonial.author_avatar_url} alt={testimonial.author_name} />
            )}
            <AvatarFallback
              className="font-semibold"
              style={{ fontSize: roleSize, backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <p className="font-semibold" style={{ fontSize: nameSize, color: theme.textColor }}>{testimonial.author_name}</p>
          {roleCompany && <p style={{ fontSize: roleSize, color: theme.textColor + '80' }}>{roleCompany}</p>}
        </div>
        {theme.showDate && (
          <span className="ml-auto" style={{ fontSize: roleSize, color: theme.textColor + '60' }}>
            {format(new Date(testimonial.created_at), 'MMM yyyy')}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Editorial Preview ───────────────────────────────────────────────────────
function EditorialPreview({
  testimonials,
  theme,
}: {
  testimonials: Testimonial[];
  theme: WidgetTheme;
}) {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  // Reset index if testimonials array shrinks
  useEffect(() => {
    if (current >= total) setCurrent(0);
  }, [total, current]);

  const t = testimonials[current];
  if (!t) return null;

  const roleCompany = [t.author_role, t.author_company].filter(Boolean).join(', ');
  const initials2 = t.author_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Golden sentence rendering
  const content = t.content || '';
  const golden = t.golden_sentence;
  const hasGolden = !!(golden && content.includes(golden));

  // Match embed.js: use rgba for consistent rendering across hex/rgb/hsl text colors
  const tc = theme.textColor || '#0f172a';
  const r = parseInt((tc.match(/^#([0-9a-fA-F]{2})/) || ['', '0f'])[1], 16);
  const rgbMatch = tc.match(/^rgba?\(\s*(\d+)/);
  const red = rgbMatch ? parseInt(rgbMatch[1], 10) : r;
  const isLightText = red > 160;
  const contextColor = isLightText ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.42)';
  const goldenColor = isLightText ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)';

  const goTo = (index: number) => {
    setCurrent(((index % total) + total) % total);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px 24px' }}>
      <div style={{ width: 48, height: 1, background: theme.textColor + '1a', marginBottom: 28 }} />
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 32, alignItems: 'center' }}>
          {/* Media column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              {t.author_avatar_url ? (
                <img
                  src={t.author_avatar_url}
                  alt={t.author_name}
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: theme.primaryColor + '20', color: theme.primaryColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 600,
                  }}
                >
                  {initials2}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: goldenColor, lineHeight: 1.3 }}>{t.author_name}</div>
              {roleCompany && (
                <div style={{ fontSize: 13, color: contextColor, lineHeight: 1.3, marginTop: 2 }}>{roleCompany}</div>
              )}
            </div>
          </div>

          {/* Content column */}
          <div style={{ position: 'relative' }}>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute', top: -12, left: -4,
                fontSize: 48, lineHeight: 1, fontWeight: 300,
                color: theme.textColor + '0f', pointerEvents: 'none',
                fontFamily: 'Georgia, serif',
              }}
            >
              {'\u201C'}
            </span>
            <blockquote style={{ margin: 0, position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 16, lineHeight: 1.55, letterSpacing: '-0.01em', margin: 0 }}>
                {hasGolden ? (
                  <>
                    {content.slice(0, content.indexOf(golden!)) && (
                      <span style={{ color: contextColor, fontWeight: 400 }}>
                        {content.slice(0, content.indexOf(golden!))}
                      </span>
                    )}
                    <span style={{ color: goldenColor, fontWeight: 500 }}>{golden}</span>
                    {content.slice(content.indexOf(golden!) + golden!.length) && (
                      <span style={{ color: contextColor, fontWeight: 400 }}>
                        {content.slice(content.indexOf(golden!) + golden!.length)}
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ color: goldenColor, fontWeight: 400 }}>{content}</span>
                )}
              </p>
            </blockquote>
          </div>
        </div>

        {/* Navigation */}
        {total > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button
              onClick={() => goTo(current - 1)}
              style={{
                width: 32, height: 32, border: 'none', background: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isLightText ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', borderRadius: '50%', padding: 0,
              }}
              aria-label="Previous testimonial"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span style={{ fontSize: 12, fontWeight: 400, letterSpacing: '0.05em', color: isLightText ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', fontVariantNumeric: 'tabular-nums' }}>
              {current + 1} / {total}
            </span>
            <button
              onClick={() => goTo(current + 1)}
              style={{
                width: 32, height: 32, border: 'none', background: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isLightText ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', borderRadius: '50%', padding: 0,
              }}
              aria-label="Next testimonial"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Minimal Preview ──────────────────────────────────────────────────────────
function MinimalPreview({
  testimonials,
  theme,
}: {
  testimonials: Testimonial[];
  theme: WidgetTheme;
}) {
  const count = Math.min(testimonials.length, 3);
  const items = testimonials.slice(0, count);

  const tc = theme.textColor || '#0f172a';
  const r = parseInt((tc.match(/^#([0-9a-fA-F]{2})/) || ['', '0f'])[1], 16);
  const rgbMatch = tc.match(/^rgba?\(\s*(\d+)/);
  const red = rgbMatch ? parseInt(rgbMatch[1], 10) : r;
  const isLightText = red > 160;
  const contextColor = isLightText ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.42)';
  const goldenColor = isLightText ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)';
  const dividerColor = isLightText ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
  const attrMuted = isLightText ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  const renderItem = (t: Testimonial) => {
    const content = t.content || '';
    const golden = t.golden_sentence;
    const hasGolden = !!(golden && content.includes(golden));
    const authorLine = [t.author_role, t.author_company].filter(Boolean).join(', ');

    return (
      <div key={t.id}>
        <blockquote style={{ fontSize: count >= 3 ? 15 : 16, lineHeight: 1.6, letterSpacing: '-0.01em', margin: '0 0 14px' }}>
          <p style={{ margin: 0 }}>
            {hasGolden ? (
              <>
                {content.slice(0, content.indexOf(golden!)) && (
                  <span style={{ color: contextColor, fontWeight: 400 }}>
                    {content.slice(0, content.indexOf(golden!))}
                  </span>
                )}
                <span style={{
                  color: goldenColor,
                  fontWeight: 500,
                  background: theme.primaryColor + '12',
                  borderRadius: 3,
                  padding: '0 3px',
                }}>
                  {golden}
                </span>
                {content.slice(content.indexOf(golden!) + golden!.length) && (
                  <span style={{ color: contextColor, fontWeight: 400 }}>
                    {content.slice(content.indexOf(golden!) + golden!.length)}
                  </span>
                )}
              </>
            ) : (
              <span style={{ color: goldenColor, fontWeight: 400 }}>{content}</span>
            )}
          </p>
        </blockquote>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: goldenColor }}>{t.author_name}</div>
            {authorLine && <div style={{ fontSize: 11, color: attrMuted }}>{authorLine}</div>}
          </div>
        </div>
      </div>
    );
  };

  if (count === 1) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '24px 16px' }}>
        {renderItem(items[0])}
      </div>
    );
  }

  const gridCols = items.map((t, i) => {
    const elements: React.ReactNode[] = [];
    if (i > 0) {
      elements.push(
        <div key={`d-${i}`} style={{ background: dividerColor, alignSelf: 'stretch' }} />
      );
    }
    elements.push(
      <div key={t.id} style={{ padding: '0 24px' }}>
        {renderItem(t)}
      </div>
    );
    return elements;
  }).flat();

  const colTemplate = count === 2 ? '1fr 1px 1fr' : '1fr 1px 1fr 1px 1fr';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: colTemplate,
      maxWidth: 640,
      margin: '0 auto',
      padding: '24px 0',
      alignItems: 'start',
    }}>
      {gridCols}
    </div>
  );
}

// ─── Copy Code Button ─────────────────────────────────────────────────────────
function CopyCodeButton({ code, variant = 'dark' }: { code: string; variant?: 'dark' | 'light' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={cn(
        'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5',
        variant === 'dark'
          ? 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          : 'border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {copied ? <Check className={cn('size-3', variant === 'dark' ? 'text-emerald-400' : 'text-emerald-500')} /> : <Copy className="size-3" />}
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
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
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
            <div className="px-5 pb-4 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  // Guided embed flow state
  type EmbedPath = 'choose' | 'link' | 'website' | 'developer';
  const [embedPath, setEmbedPath] = useState<EmbedPath>('choose');
  const [selectedPlatform, setSelectedPlatform] = useState<WebPlatform | null>(null);
  const slideDirection = useRef<1 | -1>(1);

  const showBackButton = embedPath !== 'choose';

  const handleBack = useCallback(() => {
    slideDirection.current = -1;
    if (embedPath === 'website' && selectedPlatform) {
      setSelectedPlatform(null);
    } else {
      setEmbedPath('choose');
      setSelectedPlatform(null);
    }
  }, [embedPath, selectedPlatform]);

  const handleEmbedNav = useCallback((path: EmbedPath) => {
    slideDirection.current = 1;
    setEmbedPath(path);
  }, []);

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

  // Close embed modal on Escape key
  useEffect(() => {
    if (!showEmbedModal) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEmbedModal(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showEmbedModal]);

  const [settings, setSettings] = useState<WidgetSettings>({
    name: 'My Widget',
    layout: 'grid',
    theme: {
      primaryColor: '#6366F1',
      backgroundColor: '#ffffff',
      cardColor: '#ffffff',
      textColor: '#0f172a',
      cardStyle: 'shadow',
      textSize: 'default',
      fontFamily: 'inherit',
      fontUrl: null,
      showRating: true,
      showAvatar: true,
      showDate: false,
      showMetric: false,
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
      cardColor: '#ffffff',
      textColor: '#0f172a',
      cardStyle: 'shadow' as const,
      textSize: 'default' as const,
      fontFamily: 'inherit',
      fontUrl: null,
      showRating: true,
      showAvatar: true,
      showDate: false,
      showMetric: false,
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
        cardColor: loadedTheme.cardColor ?? '#ffffff',
        textColor: loadedTheme.textColor ?? '#0f172a',
        cardStyle: loadedTheme.cardStyle ?? 'shadow',
        textSize: loadedTheme.textSize ?? 'compact',
        fontFamily: loadedTheme.fontFamily ?? 'inherit',
        fontUrl: loadedTheme.fontUrl ?? null,
        showRating: loadedTheme.showRating ?? true,
        showAvatar: loadedTheme.showAvatar ?? true,
        showDate: loadedTheme.showDate ?? true,
        showMetric: loadedTheme.showMetric ?? true,
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
        .select('id, author_name, author_role, author_company, author_avatar_url, rating, content, golden_sentence, featured, created_at')
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
      setOpenSections(new Set(['layout', 'appearance']));
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
          <p className="mt-0.5 text-sm text-muted-foreground">
            Customize how testimonials look on your site. Changes update automatically.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {activeWidgetId && (
            <>
              <Button
                size="sm"
                onClick={() => {
                  if (userPlan === 'free' && settings.layout !== 'grid') {
                    setShowUpgradePrompt(true);
                    return;
                  }
                  setEmbedPath('choose'); setSelectedPlatform(null); setShowEmbedModal(true);
                }}
                className="gap-1.5 rounded-xl border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300"
              >
                <Globe className="size-3.5" />
                <span className="hidden sm:inline">Add to Website</span>
              </Button>
              <Button
                onClick={() => {
                  if (userPlan === 'free' && settings.layout !== 'grid') {
                    setShowUpgradePrompt(true);
                    return;
                  }
                  handleSave();
                }}
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
                          : 'bg-muted border border-border text-muted-foreground xl:opacity-0 xl:group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 hover:border-red-200',
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
            {(['multi', 'spotlight'] as const).map((group) => (
              <div key={group} className={group === 'spotlight' ? 'mt-3' : ''}>
                <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1.5">
                  {group === 'multi' ? 'Multi' : 'Spotlight'}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {LAYOUT_OPTIONS.filter(opt => opt.group === group).map((opt) => {
                    const isProLayout = opt.value !== 'grid';
                    const isFlagship = opt.value === 'editorial';
                    const isSelected = settings.layout === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('layout', opt.value)}
                        className={cn(
                          'relative flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/60 text-indigo-700'
                            : 'border-border text-muted-foreground hover:border-indigo-200 hover:bg-muted/30'
                        )}
                      >
                        <span className="size-4">{opt.icon}</span>
                        {opt.label}
                        {isProLayout && userPlan === 'free' && (
                          isFlagship
                            ? <span className="ml-auto flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200/60 rounded px-1 py-px leading-tight"><Sparkles className="size-2.5" />PRO</span>
                            : <span className="ml-auto text-[10px] font-semibold text-indigo-500/70 bg-indigo-50 rounded px-1 py-px leading-tight">PRO</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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

            {/* Card Color */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Card Color</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {['#ffffff', '#f8fafc', '#f1f5f9', '#fafafa', '#1e293b', '#0f172a'].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateTheme('cardColor', c)}
                    title={c}
                    className={cn(
                      'size-7 rounded-full border-2 transition-all',
                      settings.theme.cardColor === c
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
                    style={{ backgroundColor: settings.theme.cardColor }}
                    title="Click to edit hex color"
                    onClick={(e) => { const input = (e.currentTarget.nextElementSibling as HTMLInputElement); input?.focus(); input?.select(); }}
                  />
                  <input
                    type="text"
                    value={settings.theme.cardColor}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (!v.startsWith('#')) v = '#' + v;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateTheme('cardColor', v);
                    }}
                    onBlur={() => {
                      if (!/^#[0-9A-Fa-f]{6}$/.test(settings.theme.cardColor)) updateTheme('cardColor', '#ffffff');
                    }}
                    maxLength={7}
                    aria-label="Card color hex value"
                    className="w-20 text-xs font-mono px-2 py-1 rounded border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="#ffffff"
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

            {/* Text Size */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Text Size</Label>
              <div className="flex gap-2">
                {([
                  { value: 'compact' as const, label: 'Compact' },
                  { value: 'default' as const, label: 'Default' },
                  { value: 'large' as const, label: 'Large' },
                ]).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateTheme('textSize', value)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all border',
                      settings.theme.textSize === value
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
                  { key: 'showMetric' as const, label: 'Show metric badge' },
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
            title="Filter & Limits"
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
            </CollapsibleSection>
          )}

          </div>
        </div>

        {/* ── Right Panel: Preview ── */}
        <div className="order-1 xl:order-2 space-y-5 xl:sticky xl:top-6 xl:self-start xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Preview</span>
                <span className="text-[10px] text-muted-foreground/60">how it looks on your site</span>
              </div>
              {usingSampleData && (
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-medium">
                  Sample data. Approve testimonials to see yours.
                </span>
              )}
            </div>

            {/* Pro layout upgrade banner */}
            {userPlan === 'free' && settings.layout !== 'grid' && (
              <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-3">
                <Sparkles className="size-4 text-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-indigo-900">
                    This is a Pro layout. Upgrade to use it on your website.
                  </p>
                </div>
                <button
                  onClick={() => setShowUpgradePrompt(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap transition-colors"
                >
                  Upgrade
                </button>
              </div>
            )}

            {/* Font loading for preview */}
            {settings.theme.fontFamily !== 'inherit' && resolveFontUrl(settings.theme.fontFamily, settings.theme.fontUrl) && (
              // eslint-disable-next-line @next/next/no-page-custom-font
              <link rel="stylesheet" href={resolveFontUrl(settings.theme.fontFamily, settings.theme.fontUrl)!} />
            )}

            {/* Preview Area */}
            <div
              className="p-5"
              style={{
                backgroundColor: settings.theme.backgroundColor,
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
                    {settings.layout === 'editorial' && (
                      <EditorialPreview
                        testimonials={previewTestimonials}
                        theme={settings.theme}
                      />
                    )}
                    {settings.layout === 'minimal' && (
                      <MinimalPreview
                        testimonials={previewTestimonials}
                        theme={settings.theme}
                      />
                    )}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-[backdrop-filter] duration-300"
            onClick={(e) => { if (e.target === e.currentTarget) setShowEmbedModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-white rounded-2xl border border-border overflow-hidden w-full max-w-3xl h-[70vh] sm:h-[65vh] shadow-xl flex flex-col"
            >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-white shrink-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
              <div className="flex items-center gap-2">
                {showBackButton ? (
                  <button onClick={handleBack} className="rounded-lg p-2 hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none" aria-label="Go back">
                    <ArrowLeft className="size-4 text-muted-foreground" />
                  </button>
                ) : (
                  <Globe className="size-4 text-indigo-500" />
                )}
                <h3 className="text-sm font-semibold text-foreground">
                  {embedPath === 'choose' && 'Add to your website'}
                  {embedPath === 'link' && 'Share a link'}
                  {embedPath === 'website' && !selectedPlatform && 'Choose your platform'}
                  {embedPath === 'website' && selectedPlatform && (PLATFORMS.find(p => p.id === selectedPlatform)?.name ?? 'Instructions')}
                  {embedPath === 'developer' && 'Developer & AI Tools'}
                </h3>
              </div>
              <button onClick={() => setShowEmbedModal(false)} className="rounded-lg p-2 hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none" aria-label="Close">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-5 overflow-x-hidden flex-1 overflow-y-auto">
              <AnimatePresence mode="wait" initial={false} custom={slideDirection.current}>
                <motion.div
                  key={`${embedPath}-${selectedPlatform ?? 'none'}`}
                  custom={slideDirection.current}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={{
                    enter: (dir: number) => ({ x: dir * 20, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: { opacity: 0 },
                  }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >

              {/* ── Step 1: Chooser ── */}
              {embedPath === 'choose' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Share a link */}
                    <button
                      onClick={() => handleEmbedNav('link')}
                      className="flex flex-col items-start gap-2 rounded-xl border-2 border-border p-4 text-left hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      <div className="size-9 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Link2 className="size-4 text-indigo-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Share a link</p>
                        <p className="text-xs text-muted-foreground mt-0.5">No website needed. Share on WhatsApp, email, Instagram bio, or social media.</p>
                      </div>
                    </button>
                    {/* On my website */}
                    <button
                      onClick={() => handleEmbedNav('website')}
                      className="flex flex-col items-start gap-2 rounded-xl border-2 border-border p-4 text-left hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      <div className="size-9 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Globe className="size-4 text-indigo-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">On my website</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Wix, Squarespace, Webflow, WordPress, or any website builder.</p>
                      </div>
                    </button>
                    {/* Developer / AI tools */}
                    <button
                      onClick={() => handleEmbedNav('developer')}
                      className="flex flex-col items-start gap-2 rounded-xl border-2 border-border p-4 text-left hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      <div className="size-9 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Code2 className="size-4 text-indigo-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Developer or AI tools</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Using something like Cursor, Claude Code, Bolt, Lovable, or a custom-coded site.</p>
                      </div>
                    </button>
                  </div>
                  <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                    Your testimonials load automatically and update whenever you approve new ones.
                  </p>
                </div>
              )}

              {/* ── Share a link ── */}
              {embedPath === 'link' && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    No website needed. Share this link anywhere and customers can see all your approved testimonials instantly.
                  </p>
                  {selectedProject?.slug ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                        <Globe className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono text-foreground truncate">
                          {SITE_URL}/p/{selectedProject?.slug}
                        </span>
                      </div>
                      <CopyCodeButton code={`${SITE_URL}/p/${selectedProject?.slug}`} variant="light" />
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
                    <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                      <span>Save your project settings first to get your public page URL.</span>
                      <Link
                        href="/dashboard/settings?tab=project"
                        className="shrink-0 text-xs font-medium text-amber-700 underline hover:text-amber-900 transition-colors"
                        onClick={() => setShowEmbedModal(false)}
                      >
                        Go to Settings
                      </Link>
                    </div>
                  )}
                  <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 space-y-2">
                    <p className="text-xs font-semibold text-indigo-700">Great places to share it:</p>
                    <ul className="space-y-1.5 text-xs text-indigo-700">
                      <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Email signature with a &ldquo;See what customers say&rdquo; link</span></li>
                      <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>WhatsApp message or Instagram bio</span></li>
                      <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Google Business profile description</span></li>
                      <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Invoices, receipts, or booking confirmations</span></li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ── On my website: Platform picker ── */}
              {embedPath === 'website' && !selectedPlatform && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Pick your website platform and we&apos;ll show you exactly how to add testimonials.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {PLATFORMS.map((platform) => {
                      const icons: Record<string, React.ReactNode> = {
                        wix: (
                          <svg className="size-5" viewBox="0 0 24 24" fill="#0C6EFC"><path d="m0 7.354 2.113 9.292h.801a1.54 1.54 0 0 0 1.506-1.218l1.351-6.34a.171.171 0 0 1 .167-.137c.08 0 .15.058.167.137l1.352 6.34a1.54 1.54 0 0 0 1.506 1.218h.805l2.113-9.292h-.565c-.62 0-1.159.43-1.296 1.035l-1.26 5.545-1.106-5.176a1.76 1.76 0 0 0-2.19-1.324c-.639.176-1.113.716-1.251 1.365l-1.094 5.127-1.26-5.537A1.33 1.33 0 0 0 .563 7.354H0zm13.992 0a.951.951 0 0 0-.951.95v8.342h.635a.952.952 0 0 0 .951-.95V7.353h-.635zm1.778 0 3.158 4.66-3.14 4.632h1.325c.368 0 .712-.181.918-.486l1.756-2.59a.12.12 0 0 1 .197 0l1.754 2.59c.206.305.55.486.918.486h1.326l-3.14-4.632L24 7.354h-1.326c-.368 0-.712.181-.918.486l-1.772 2.617a.12.12 0 0 1-.197 0L18.014 7.84a1.108 1.108 0 0 0-.918-.486H15.77z"/></svg>
                        ),
                        squarespace: (
                          <svg className="size-5" viewBox="0 0 24 24" fill="#222"><path d="M22.655 8.719c-1.802-1.801-4.726-1.801-6.564 0l-7.351 7.35c-.45.45-.45 1.2 0 1.65.45.449 1.2.449 1.65 0l7.351-7.351c.899-.899 2.362-.899 3.264 0 .9.9.9 2.364 0 3.264l-7.239 7.239c.9.899 2.362.899 3.263 0l5.589-5.589c1.836-1.838 1.836-4.763.037-6.563zm-2.475 2.437c-.451-.45-1.201-.45-1.65 0l-7.354 7.389c-.9.899-2.361.899-3.262 0-.45-.45-1.2-.45-1.65 0s-.45 1.2 0 1.649c1.801 1.801 4.726 1.801 6.564 0l7.351-7.35c.449-.487.449-1.239.001-1.688zm-2.439-7.35c-1.801-1.801-4.726-1.801-6.564 0l-7.351 7.351c-.45.449-.45 1.199 0 1.649s1.2.45 1.65 0l7.395-7.351c.9-.899 2.371-.899 3.27 0 .451.45 1.201.45 1.65 0 .421-.487.421-1.199-.029-1.649h-.021zm-2.475 2.437c-.45-.45-1.2-.45-1.65 0l-7.351 7.389c-.899.9-2.363.9-3.265 0-.9-.899-.9-2.363 0-3.264l7.239-7.239c-.9-.9-2.362-.9-3.263 0L1.35 8.719c-1.8 1.8-1.8 4.725 0 6.563 1.801 1.801 4.725 1.801 6.564 0l7.35-7.351c.451-.488.451-1.238 0-1.688h.002z"/></svg>
                        ),
                        webflow: (
                          <svg className="size-5" viewBox="0 0 24 24" fill="#4353FF"><path d="m24 4.515-7.658 14.97H9.149l3.205-6.204h-.144C9.566 16.713 5.621 18.973 0 19.485v-6.118s3.596-.213 5.71-2.435H0V4.515h6.417v5.278l.144-.001 2.622-5.277h4.854v5.244h.144l2.72-5.244H24Z"/></svg>
                        ),
                        framer: (
                          <svg className="size-5" viewBox="0 0 24 24" fill="#0055FF"><path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z"/></svg>
                        ),
                        wordpress: (
                          <svg className="size-5" viewBox="0 0 24 24" fill="#21759B"><path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0"/></svg>
                        ),
                        other: (
                          <Globe className="size-4 text-muted-foreground" />
                        ),
                      };
                      return (
                        <button
                          key={platform.id}
                          onClick={() => { slideDirection.current = 1; setSelectedPlatform(platform.id); }}
                          className="flex items-center gap-2.5 rounded-xl border-2 border-border px-3.5 py-3 text-left hover:border-indigo-300 hover:bg-indigo-50/30 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                        >
                          <span className="size-5 flex items-center justify-center shrink-0">
                            {icons[platform.id] ?? <Globe className="size-4 text-muted-foreground" />}
                          </span>
                          <span className="text-sm font-medium text-foreground">{platform.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── On my website: Platform-specific instructions ── */}
              {embedPath === 'website' && selectedPlatform && (
                <div className="space-y-4">
                  <ol className="space-y-3">
                    {PLATFORMS.find(p => p.id === selectedPlatform)?.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-foreground/80">
                        <span className="size-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span>{step.text}</span>
                          {step.hasCode && (
                            <div className="mt-2 relative">
                              <span className="absolute top-2 left-3 text-[10px] text-gray-500 font-mono uppercase">HTML</span>
                              <pre className="rounded-xl bg-gray-950 pt-7 pb-3 px-3 pr-16 text-xs text-emerald-400 overflow-x-auto font-mono leading-relaxed">
                                {scriptSnippet}
                              </pre>
                              <div className="absolute top-2 right-2">
                                <CopyCodeButton code={scriptSnippet} />
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* ── Developer & AI Tools ── */}
              {embedPath === 'developer' && (
                <div className="space-y-5">
                  {/* Section 1: Code for custom sites */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Embed code</h4>
                    <p className="text-xs text-muted-foreground">
                      Add to any HTML page. Renders inside Shadow DOM so there are zero style conflicts with your site.
                    </p>
                    <div className="relative">
                      <span className="absolute top-2 left-3 text-[10px] text-gray-500 font-mono uppercase">HTML</span>
                      <pre className="rounded-xl bg-gray-950 pt-7 pb-3 px-3 pr-16 text-xs text-emerald-400 overflow-x-auto font-mono leading-relaxed">
                        {scriptSnippet}
                      </pre>
                      <div className="absolute top-2 right-2">
                        <CopyCodeButton code={scriptSnippet} />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: AI tools prompt */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Using AI tools?</h4>
                    <p className="text-xs text-muted-foreground">
                      Using something like Cursor, Claude Code, Bolt, Lovable, v0, Codex, Anti Gravity, or Replit? Copy this prompt and paste it into your AI tool.
                    </p>
                    <div className="relative">
                      <pre className="rounded-xl bg-gray-950 p-3 pr-16 text-xs text-emerald-400 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
{`Add a testimonials section to my page. Use this embed code exactly as-is, do not modify it:

${scriptSnippet}

Place it where I want customer testimonials to appear. The script handles all styling and layout automatically. Do not modify the code.`}
                      </pre>
                      <div className="absolute top-2 right-2">
                        <CopyCodeButton code={`Add a testimonials section to my page. Use this embed code exactly as-is, do not modify it:\n\n${scriptSnippet}\n\nPlace it where I want customer testimonials to appear. The script handles all styling and layout automatically. Do not modify the code.`} />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: React component */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                      React / Next.js component
                      {userPlan === 'free' && <span className="text-[10px] bg-indigo-100 text-indigo-700 rounded-full px-1.5 py-0.5 font-medium normal-case tracking-normal">Pro</span>}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Want full control over how testimonials look on your site? The React component lets you match your exact design, load faster with server-side rendering, and customize every detail with your own CSS. Great if you or your AI tool is building a custom site.
                    </p>
                    {userPlan === 'free' ? (
                      <button
                        onClick={() => setShowUpgradePrompt(true)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Available on Pro &rarr;
                      </button>
                    ) : (
                      <div className="relative">
                        <span className="absolute top-2 left-3 text-[10px] text-gray-500 font-mono uppercase">JSX</span>
                        <pre className="rounded-xl bg-gray-950 pt-7 pb-3 px-3 pr-16 text-xs text-emerald-400 overflow-x-auto font-mono leading-relaxed max-h-72">
                          {reactSnippet}
                        </pre>
                        <div className="absolute top-2 right-2">
                          <CopyCodeButton code={reactSnippet} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

                </motion.div>
              </AnimatePresence>
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

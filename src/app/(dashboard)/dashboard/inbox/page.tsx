'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Star,
  Search,
  CheckCircle,
  XCircle,
  Inbox,
  ChevronDown,
  ChevronUp,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw,
  Pin,
  Share2,
  Download,
  Copy,
  Check,
  X,
  Zap,
  Upload,
  ExternalLink,
  PlusCircle,
  Video,
  ShieldCheck,
  Play,
} from 'lucide-react';

const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com', 'protonmail.com', 'proton.me',
  'aol.com', 'mail.com', 'yandex.com', 'yandex.ru', 'qq.com',
]);

function getEmailDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.lastIndexOf('@');
  if (at === -1) return null;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return domain && !PERSONAL_DOMAINS.has(domain) ? domain : null;
}
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type TestimonialStatus = 'pending' | 'approved' | 'rejected';

interface Testimonial {
  id: string;
  author_name: string;
  author_email: string | null;
  author_role: string | null;
  author_company: string | null;
  author_avatar_url: string | null;
  rating: number;
  content: string;
  status: TestimonialStatus;
  featured: boolean;
  source_url: string | null;
  golden_sentence: string | null;
  metric_label: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  created_at: string;
  project_id: string;
  project?: { name: string };
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            size === 'sm' ? 'size-3.5' : 'size-4',
            i < rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-gray-300'
          )}
        />
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: TestimonialStatus }) {
  const config: Record<TestimonialStatus, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  };
  const { label, className } = config[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function TestimonialSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-muted" />
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-4/6 rounded bg-muted" />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: string }) {
  const config: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
    all: {
      icon: <Inbox className="size-10 text-muted-foreground/50" />,
      title: 'No testimonials yet',
      description: 'Share your collection form link with customers to start receiving testimonials.',
    },
    pending: {
      icon: <Clock className="size-10 text-amber-400/60" />,
      title: 'No pending testimonials',
      description: 'All testimonials have been reviewed. Check the Approved or Rejected tabs.',
    },
    approved: {
      icon: <ThumbsUp className="size-10 text-emerald-400/60" />,
      title: 'No approved testimonials',
      description: 'Approve testimonials from the Pending tab to see them here.',
    },
    rejected: {
      icon: <ThumbsDown className="size-10 text-red-400/60" />,
      title: 'No rejected testimonials',
      description: "Rejected testimonials will appear here. You can re-approve them if you change your mind.",
    },
  };
  const { icon, title, description } = config[tab] || config.all;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 rounded-full bg-muted/50 p-5">{icon}</div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {tab === 'all' && (
        <Button asChild className="mt-5 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700">
          <Link href="/dashboard/forms">Go to my forms</Link>
        </Button>
      )}
    </motion.div>
  );
}

// ─── Source Badge ─────────────────────────────────────────────────────────────
function SourceBadge({ url }: { url: string }) {
  const label = url.includes('twitter.com') || url.includes('x.com')
    ? 'Verified on X'
    : url.includes('linkedin.com')
      ? 'Verified on LinkedIn'
      : 'Verified source';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <ExternalLink className="size-3" />
      {label}
    </a>
  );
}

// ─── Import Dialog ────────────────────────────────────────────────────────────
function ImportDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (t: Testimonial) => void;
}) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [projectId, setProjectId] = useState('');
  const [userId, setUserId] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [authorCompany, setAuthorCompany] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');

  function isTwitterUrl(url: string) {
    try {
      const h = new URL(url).hostname.replace(/^www\./, '');
      return h === 'twitter.com' || h === 'x.com';
    } catch {
      return false;
    }
  }

  async function handleFetchTweet() {
    if (!sourceUrl.trim() || !isTwitterUrl(sourceUrl)) return;
    setFetching(true);
    try {
      const res = await fetch(`/api/testimonials/fetch-oembed?url=${encodeURIComponent(sourceUrl.trim())}`);
      if (!res.ok) {
        const { error } = await res.json() as { error?: string };
        toast.error(error ?? 'Could not fetch tweet');
        return;
      }
      const data = await res.json() as { author_name: string; text: string; source_url: string };
      if (data.text) setContent(data.text);
      if (data.author_name && !authorName) setAuthorName(data.author_name);
      toast.success('Tweet fetched');
    } catch {
      toast.error('Failed to fetch tweet');
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: projs } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (projs && projs.length > 0) {
        setProjects(projs);
        setProjectId(projs[0].id);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarDataUrl(result);
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!authorName.trim() || content.trim().length < 10 || !projectId) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          project_id: projectId,
          user_id: userId,
          author_name: authorName.trim(),
          author_role: authorRole.trim() || null,
          author_company: authorCompany.trim() || null,
          author_avatar_url: avatarDataUrl || null,
          rating,
          content: content.trim(),
          status: 'approved',
          source: 'import',
          source_url: sourceUrl.trim() || null,
          custom_answers: {},
        })
        .select('*, project:projects(name)')
        .single();
      if (error) throw error;
      toast.success('Testimonial added');
      onSuccess(data as Testimonial);
      onClose();
    } catch (err) {
      toast.error('Failed to save testimonial');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const canSave = authorName.trim().length > 0 && content.trim().length >= 10 && projectId.length > 0;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add past testimonial</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Paste praise from X, LinkedIn, or anywhere. Add a source link for a verified badge on your widget.
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Project select */}
          {projects.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRating(v)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'size-6',
                      v <= rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-gray-300'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Testimonial text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the tweet, LinkedIn comment, email, or message..."
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-muted-foreground">{content.length} chars (min 10)</p>
          </div>

          {/* Author */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Jane Smith"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Role</label>
              <Input
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Designer"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Company</label>
            <Input
              value={authorCompany}
              onChange={(e) => setAuthorCompany(e.target.value)}
              placeholder="Acme Inc."
              className="rounded-xl"
            />
          </div>

          {/* Avatar upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Avatar (optional)</label>
            <div className="flex items-center gap-3">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="size-10 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="size-10 rounded-full bg-muted flex items-center justify-center border border-border">
                  <Upload className="size-4 text-muted-foreground" />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? 'Change photo' : 'Upload photo'}
              </Button>
              {avatarPreview && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { setAvatarPreview(null); setAvatarDataUrl(null); }}
                >
                  Remove
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Source URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Source link (optional)</label>
            <div className="flex gap-2">
              <Input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://x.com/username/status/..."
                className="rounded-xl flex-1"
              />
              {isTwitterUrl(sourceUrl) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl shrink-0 gap-1.5"
                  onClick={handleFetchTweet}
                  disabled={fetching}
                >
                  {fetching ? <Loader2 className="size-3.5 animate-spin" /> : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.629 5.905-5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {fetching ? 'Fetching...' : 'Fetch'}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Adds a &ldquo;Verified on X&rdquo; or &ldquo;Verified on LinkedIn&rdquo; badge on your widget. Paste an X URL and click Fetch to auto-fill the tweet text.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-2 pt-4 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
            disabled={!canSave || saving}
            onClick={handleSave}
          >
            {saving && <Loader2 className="size-4 animate-spin mr-2" />}
            Add testimonial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Card Dialog ──────────────────────────────────────────────────────────────
function CardDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const cardUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/testimonials/card/${id}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(cardUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share testimonial card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/testimonials/card/${id}`}
            alt="Testimonial card"
            className="w-full rounded-xl border border-border"
          />
          <div className="flex gap-3">
            <a
              href={`/api/testimonials/card/${id}`}
              download="vouch-card.png"
              className="flex-1"
            >
              <Button variant="outline" className="w-full gap-2 rounded-xl">
                <Download className="size-4" />
                Download PNG
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex-1 gap-2 rounded-xl"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copy link
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Video Dialog ─────────────────────────────────────────────────────────────
function VideoDialog({ url, poster, onClose }: { url: string; poster?: string | null; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Video testimonial</DialogTitle>
        </DialogHeader>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={url} poster={poster || undefined} controls autoPlay className="w-full rounded-xl" />
      </DialogContent>
    </Dialog>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
interface TestimonialCardProps {
  testimonial: Testimonial;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onToggleFeatured: (id: string, featured: boolean) => Promise<void>;
  onShareCard: (id: string) => void;
  onPlayVideo: (id: string) => void;
  isPro: boolean;
  isUpdating: boolean;
}

function TestimonialCard({ testimonial, onApprove, onReject, onToggleFeatured, onShareCard, onPlayVideo, isPro, isUpdating }: TestimonialCardProps) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [goldenSentence, setGoldenSentence] = useState(testimonial.golden_sentence ?? '');
  const [metricLabel, setMetricLabel] = useState(testimonial.metric_label ?? '');
  const [fieldSaving, setFieldSaving] = useState<'golden' | 'metric' | null>(null);
  const TRUNCATE_AT = 150;
  const shouldTruncate = testimonial.content.length > TRUNCATE_AT;
  const displayContent =
    !shouldTruncate || expanded ? testimonial.content : testimonial.content.slice(0, TRUNCATE_AT) + '…';

  const initials = testimonial.author_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleCompany = [testimonial.author_role, testimonial.author_company].filter(Boolean).join(' · ');
  const emailDomain = getEmailDomain(testimonial.author_email);

  async function saveGoldenSentence() {
    setFieldSaving('golden');
    const { error } = await supabase
      .from('testimonials')
      .update({ golden_sentence: goldenSentence.trim() || null })
      .eq('id', testimonial.id);
    if (!error) toast.success('Golden sentence saved');
    else toast.error('Failed to save');
    setFieldSaving(null);
  }

  async function saveMetricLabel() {
    setFieldSaving('metric');
    const { error } = await supabase
      .from('testimonials')
      .update({ metric_label: metricLabel.trim() || null })
      .eq('id', testimonial.id);
    if (!error) toast.success('Metric saved');
    else toast.error('Failed to save');
    setFieldSaving(null);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl border border-border p-5 transition-shadow hover:shadow-md"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <Avatar size="default">
              {testimonial.author_avatar_url && <AvatarImage src={testimonial.author_avatar_url} alt={testimonial.author_name} />}
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            {testimonial.video_url && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                <Video className="size-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{testimonial.author_name}</p>
            {roleCompany && (
              <p className="text-xs text-muted-foreground truncate">{roleCompany}</p>
            )}
            {emailDomain && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 mt-0.5">
                <ShieldCheck className="size-2.5" />
                {emailDomain}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={testimonial.status} />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(testimonial.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Rating + project */}
      <div className="mt-3 flex items-center gap-3">
        <StarRating rating={testimonial.rating} />
        {testimonial.project?.name && (
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {testimonial.project.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className="text-sm text-foreground/90 leading-relaxed">{displayContent}</p>
        {shouldTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="size-3" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="size-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Verified source badge */}
      {testimonial.source_url && (
        <div className="mt-2">
          <SourceBadge url={testimonial.source_url} />
        </div>
      )}

      {/* Video thumbnail */}
      {testimonial.video_url && (
        <div className="mt-3 max-w-[280px]">
          <button
            type="button"
            onClick={() => onPlayVideo(testimonial.id)}
            className="relative w-full rounded-xl overflow-hidden group block"
            aria-label="Play video testimonial"
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={testimonial.video_url}
              poster={testimonial.video_thumbnail_url || undefined}
              preload="metadata"
              muted
              className="w-full block"
              style={{ maxHeight: 160, objectFit: 'cover', pointerEvents: 'none', background: '#000', borderRadius: 12 }}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors rounded-xl flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                <Play className="size-4 ml-0.5 fill-gray-900 text-gray-900" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Pro: golden sentence + metric editing */}
      {isPro && (
        <div className="mt-3 pt-3 border-t border-dashed border-border/50 space-y-2">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Golden sentence
            </label>
            <Input
              value={goldenSentence}
              onChange={(e) => setGoldenSentence(e.target.value)}
              onBlur={saveGoldenSentence}
              placeholder="Type the sentence to emphasize in your widget..."
              className="mt-1 h-7 rounded-lg text-xs"
              disabled={fieldSaving === 'golden'}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Metric pill
            </label>
            <Input
              value={metricLabel}
              onChange={(e) => setMetricLabel(e.target.value)}
              onBlur={saveMetricLabel}
              placeholder="+40% Conversion"
              className="mt-1 h-7 rounded-lg text-xs"
              disabled={fieldSaving === 'metric'}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onToggleFeatured(testimonial.id, !testimonial.featured)}
          disabled={isUpdating}
          title={testimonial.featured ? 'Remove from featured' : 'Mark as featured'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all',
            testimonial.featured
              ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'border-border text-muted-foreground hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600'
          )}
        >
          <Pin className={cn('size-3', testimonial.featured && 'fill-amber-500 text-amber-500')} />
          {testimonial.featured ? 'Featured' : 'Feature'}
        </button>
        {testimonial.status === 'approved' && (
          <button
            onClick={() => onShareCard(testimonial.id)}
            disabled={isUpdating}
            title="Share as image card"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all',
              'border-border text-muted-foreground hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600'
            )}
          >
            <Share2 className="size-3" />
            Share Card
            {!isPro && <Zap className="size-3 text-amber-500" />}
          </button>
        )}
        {testimonial.status === 'pending' && (
          <>
            <Button
              size="sm"
              disabled={isUpdating}
              onClick={() => onApprove(testimonial.id)}
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={() => onReject(testimonial.id)}
              className="h-8 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
            >
              {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
              Reject
            </Button>
          </>
        )}
        {testimonial.status === 'approved' && (
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating}
            onClick={() => onReject(testimonial.id)}
            className="h-8 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
          >
            <XCircle className="size-3.5" />
            Revoke
          </Button>
        )}
        {testimonial.status === 'rejected' && (
          <Button
            size="sm"
            disabled={isUpdating}
            onClick={() => onApprove(testimonial.id)}
            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <CheckCircle className="size-3.5" />
            Re-approve
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const supabase = createClient();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [isPro, setIsPro] = useState(false);
  const [cardDialogId, setCardDialogId] = useState<string | null>(null);
  const [videoDialog, setVideoDialog] = useState<{ url: string; poster: string | null } | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 100;

  // ── Fetch testimonials ─────────────────────────────────────────────────────
  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [testimonialsRes, subRes] = await Promise.all([
        supabase
          .from('testimonials')
          .select('*, project:projects(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(PAGE_SIZE),
        supabase
          .from('subscriptions')
          .select('plan')
          .eq('user_id', user.id)
          .single(),
      ]);

      if (testimonialsRes.error) throw testimonialsRes.error;
      const rows = (testimonialsRes.data as Testimonial[]) ?? [];
      setTestimonials(rows);
      setHasMore(rows.length === PAGE_SIZE);
      setIsPro(subRes.data?.plan === 'pro' || subRes.data?.plan === 'agency');
    } catch (err) {
      toast.error('Failed to load testimonials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadMore = useCallback(async () => {
    if (loadingMore || testimonials.length === 0) return;
    setLoadingMore(true);
    try {
      const cursor = testimonials[testimonials.length - 1].created_at;
      const { data, error } = await supabase
        .from('testimonials')
        .select('*, project:projects(name)')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
        .order('created_at', { ascending: false })
        .lt('created_at', cursor)
        .limit(PAGE_SIZE);
      if (error) throw error;
      const rows = (data as Testimonial[]) ?? [];
      setTestimonials((prev) => [...prev, ...rows]);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      toast.error('Failed to load more testimonials');
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [supabase, testimonials, loadingMore]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = testimonials;
    if (activeTab !== 'all') {
      list = list.filter((t) => t.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.author_name.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q)
      );
    }
    return list;
  }, [testimonials, activeTab, searchQuery]);

  const pendingCount = useMemo(
    () => testimonials.filter((t) => t.status === 'pending').length,
    [testimonials]
  );

  // ── Approve / Reject ──────────────────────────────────────────────────────
  const updateStatus = useCallback(
    async (id: string, status: TestimonialStatus) => {
      setUpdatingIds((prev) => new Set(prev).add(id));
      // Optimistic update
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
      try {
        const { error } = await supabase
          .from('testimonials')
          .update({ status })
          .eq('id', id);
        if (error) throw error;
        toast.success(status === 'approved' ? 'Testimonial approved' : 'Testimonial rejected');
      } catch (err) {
        // Revert on failure
        setTestimonials((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, status: t.status === status ? 'pending' : t.status }
              : t
          )
        );
        toast.error('Failed to update testimonial');
        console.error(err);
        // Re-fetch to ensure consistency
        fetchTestimonials();
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [supabase, fetchTestimonials]
  );

  const handleApprove = useCallback(
    (id: string) => updateStatus(id, 'approved'),
    [updateStatus]
  );

  const handleReject = useCallback(
    (id: string) => updateStatus(id, 'rejected'),
    [updateStatus]
  );

  const handleToggleFeatured = useCallback(
    async (id: string, featured: boolean) => {
      setUpdatingIds((prev) => new Set(prev).add(id));
      setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, featured } : t)));
      try {
        const { error } = await supabase.from('testimonials').update({ featured }).eq('id', id);
        if (error) throw error;
        toast.success(featured ? 'Marked as featured' : 'Removed from featured');
      } catch (err) {
        setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, featured: !featured } : t)));
        toast.error('Failed to update');
        console.error(err);
      } finally {
        setUpdatingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      }
    },
    [supabase]
  );

  const handleShareCard = useCallback(
    (id: string) => {
      if (isPro) {
        setCardDialogId(id);
      } else {
        setShowUpgradeDialog(true);
      }
    },
    [isPro]
  );

  const handleImportSuccess = useCallback((t: Testimonial) => {
    setTestimonials((prev) => [t, ...prev]);
  }, []);

  const handlePlayVideo = useCallback((id: string) => {
    const t = testimonials.find((item) => item.id === id);
    if (t?.video_url) setVideoDialog({ url: t.video_url, poster: t.video_thumbnail_url });
  }, [testimonials]);

  const handleExportCSV = useCallback(() => {
    const approved = testimonials.filter((t) => t.status === 'approved');
    if (approved.length === 0) {
      toast.error('No approved testimonials to export');
      return;
    }
    const headers = ['Name', 'Role', 'Company', 'Email', 'Rating', 'Content', 'Date'];
    const rows = approved.map((t) => [
      t.author_name,
      t.author_role ?? '',
      t.author_company ?? '',
      t.author_email ?? '',
      String(t.rating),
      t.content.replace(/"/g, '""'),
      format(new Date(t.created_at), 'yyyy-MM-dd'),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vouch-testimonials.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [testimonials]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6"
    >
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inbox</h1>
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              {pendingCount} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPro && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 rounded-xl"
            >
              <Download className="size-3.5" />
              Export CSV
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
            className="gap-1.5 rounded-xl"
          >
            <PlusCircle className="size-3.5" />
            Add past testimonial
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTestimonials}
            disabled={loading}
            className="gap-1.5 rounded-xl"
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by author name or content…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-xl border-border bg-white"
        />
      </div>

      {/* ── Tabs + List ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 h-10 gap-1 rounded-xl bg-muted/60 p-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => {
            const count = tab === 'all'
              ? testimonials.length
              : testimonials.filter((t) => t.status === tab).length;
            return (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-lg px-3 capitalize data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium leading-none data-[state=active]:bg-muted">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <TestimonialSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                    {filtered.map((t) => (
                      <TestimonialCard
                        key={t.id}
                        testimonial={t}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onToggleFeatured={handleToggleFeatured}
                        onShareCard={handleShareCard}
                        onPlayVideo={handlePlayVideo}
                        isPro={isPro}
                        isUpdating={updatingIds.has(t.id)}
                      />
                    ))}
                  </div>
                </AnimatePresence>
                {hasMore && activeTab === tab && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="gap-2 rounded-xl"
                    >
                      {loadingMore && <Loader2 className="size-4 animate-spin" />}
                      {loadingMore ? 'Loading...' : 'Load more'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Import past testimonial dialog */}
      {showImportDialog && (
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {/* Video playback dialog */}
      {videoDialog && (
        <VideoDialog url={videoDialog.url} poster={videoDialog.poster} onClose={() => setVideoDialog(null)} />
      )}

      {/* Card preview dialog */}
      {cardDialogId && (
        <CardDialog id={cardDialogId} onClose={() => setCardDialogId(null)} />
      )}

      {/* Upgrade nudge dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="size-5 text-amber-500" />
              Pro feature
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Shareable image cards are a Pro feature. Upgrade to download and share beautiful testimonial cards on social media.
          </p>
          <div className="flex gap-3 mt-2">
            <Button
              onClick={() => setShowUpgradeDialog(false)}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              <X className="size-4 mr-2" />
              Not now
            </Button>
            <Button
              onClick={() => { window.location.href = '/dashboard/settings?tab=billing'; }}
              className="flex-1 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
              <Zap className="size-4" />
              Upgrade to Pro
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}

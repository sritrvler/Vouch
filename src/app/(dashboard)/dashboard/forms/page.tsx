'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Copy,
  Check,
  Trash2,
  FileText,
  ExternalLink,
  Loader2,
  X,
  Lock,
  Zap,
  QrCode,
  Download,
  MessageCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useProject } from '@/context/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
}

interface CollectionForm {
  id: string;
  title: string;
  description: string | null;
  custom_questions: string[];
  is_active: boolean;
  created_at: string;
  project_id: string;
  project?: { name: string };
  submission_count?: number;
}

interface FormCardProps {
  form: CollectionForm;
  onToggle: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onQR: (id: string, title: string) => void;
  onDuplicate: (id: string) => Promise<void>;
  isDeleting: boolean;
  isDuplicating: boolean;
  isPro: boolean;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// ─── Share Link Copy Button ────────────────────────────────────────────────────
function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <button
      onClick={copy}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground',
        className
      )}
    >
      {copied ? (
        <>
          <Check className="size-3 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Copy
        </>
      )}
    </button>
  );
}

// ─── QR Dialog ────────────────────────────────────────────────────────────────
function QRDialog({
  open,
  onClose,
  formLink,
  formTitle,
}: {
  open: boolean;
  onClose: () => void;
  formLink: string;
  formTitle: string;
}) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouch-qr-${formTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  }, [formTitle]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(formLink);
    setCopied(true);
    toast.success('Link copied');
    setTimeout(() => setCopied(false), 2000);
  }, [formLink]);

  const handleWhatsApp = useCallback(() => {
    const message = encodeURIComponent(
      `Hi! Thanks for visiting us. We would love your feedback, it only takes a minute: ${formLink} Thank you!`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  }, [formLink]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5 text-indigo-500" />
            QR Code
          </DialogTitle>
          <DialogDescription>
            Print and place on your counter. Customers scan it to leave a review.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-2xl border border-border p-4 bg-white">
            <QRCodeCanvas
              ref={canvasRef}
              value={formLink}
              size={220}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Scan to open <span className="font-medium text-foreground">{formTitle}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 gap-2 rounded-xl"
          >
            <Download className="size-4" />
            Download PNG
          </Button>
          <Button
            onClick={handleWhatsApp}
            className="flex-1 gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </Button>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground mb-2">Or copy the link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 rounded-xl bg-muted/40 border border-border px-3 py-1.5">
              <span className="text-xs font-mono text-muted-foreground truncate block">{formLink}</span>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all shrink-0"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function FormCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-3 w-56 rounded bg-muted" />
        </div>
        <div className="h-5 w-10 rounded-full bg-muted" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
    </div>
  );
}

// ─── Form Card ─────────────────────────────────────────────────────────────────
function FormCard({ form, onToggle, onDelete, onQR, onDuplicate, isDeleting, isDuplicating, isPro }: FormCardProps) {
  const [toggling, setToggling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const shareLink = `${SITE_URL}/c/${form.id}`;

  const handleToggle = useCallback(async () => {
    setToggling(true);
    try {
      await onToggle(form.id, !form.is_active);
    } finally {
      setToggling(false);
    }
  }, [form.id, form.is_active, onToggle]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl border border-border p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{form.title}</h3>
            {form.project?.name && (
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5 font-medium">
                {form.project.name}
              </span>
            )}
          </div>
          {form.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{form.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-medium', form.is_active ? 'text-emerald-600' : 'text-muted-foreground')}>
              {form.is_active ? 'Active' : 'Inactive'}
            </span>
            <Switch
              checked={form.is_active}
              onCheckedChange={handleToggle}
              disabled={toggling}
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileText className="size-3.5" />
          {form.submission_count ?? 0} submission{(form.submission_count ?? 0) !== 1 ? 's' : ''}
        </span>
        {form.custom_questions.length > 0 && (
          <span>{form.custom_questions.length} custom question{form.custom_questions.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Share link */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 min-w-0 rounded-xl bg-muted/40 border border-border px-3 py-1.5 flex items-center gap-2">
          <ExternalLink className="size-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground font-mono truncate">{shareLink}</span>
        </div>
        <CopyButton value={shareLink} />
        <button
          onClick={() => onQR(form.id, form.title)}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <QrCode className="size-3" />
          QR
        </button>
        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-3" />
          Open
        </a>
      </div>

      {/* Bottom actions */}
      <div className="mt-3 flex items-center justify-between">
        {isPro && (
          <button
            onClick={() => onDuplicate(form.id)}
            disabled={isDuplicating}
            className="text-xs text-muted-foreground hover:text-indigo-500 transition-colors flex items-center gap-1"
          >
            {isDuplicating ? <Loader2 className="size-3 animate-spin" /> : <Copy className="size-3" />}
            Duplicate
          </button>
        )}
        <div className={cn('flex justify-end', !isPro && 'w-full')}>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 className="size-3" />
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Confirm delete?</span>
              <button
                onClick={() => onDelete(form.id)}
                disabled={isDeleting}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-4 rounded-full bg-indigo-50 p-5">
        <FileText className="size-10 text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-foreground">No collection forms yet</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Create your first form to start collecting testimonials from happy customers.
      </p>
      <Button
        onClick={onCreateClick}
        className="mt-5 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
      >
        <Plus className="size-4" />
        Create your first form
      </Button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FormsPage() {
  const supabase = createClient();
  const { selectedProjectId: activeProjectId } = useProject();
  const router = useRouter();
  const [forms, setForms] = useState<CollectionForm[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'agency'>('free');

  // QR dialog state
  const [qrFormId, setQrFormId] = useState<string | null>(null);
  const [qrFormTitle, setQrFormTitle] = useState('');

  // Create form dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formTitle, setFormTitle] = useState('Share your experience');
  const [formDesc, setFormDesc] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [formsRes, projectsRes, subRes] = await Promise.all([
        supabase
          .from('collection_forms')
          .select('*, project:projects(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('projects')
          .select('id, name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('subscriptions')
          .select('plan')
          .eq('user_id', user.id)
          .single(),
      ]);

      if (formsRes.error) throw formsRes.error;
      if (projectsRes.error) throw projectsRes.error;

      // Fetch submission counts for each form
      const formIds = (formsRes.data ?? []).map((f: CollectionForm) => f.id);
      let submissionCounts: Record<string, number> = {};
      if (formIds.length > 0) {
        const { data: countData } = await supabase
          .from('testimonials')
          .select('form_id')
          .in('form_id', formIds);
        if (countData) {
          submissionCounts = countData.reduce((acc: Record<string, number>, row: { form_id: string | null }) => {
            if (row.form_id) acc[row.form_id] = (acc[row.form_id] ?? 0) + 1;
            return acc;
          }, {});
        }
      }

      const formsWithCount = (formsRes.data ?? []).map((f: CollectionForm) => ({
        ...f,
        submission_count: submissionCounts[f.id] ?? 0,
      }));

      setForms(formsWithCount);
      setProjects(projectsRes.data ?? []);
      if (subRes.data) setUserPlan(subRes.data.plan);
    } catch (err) {
      toast.error('Failed to load forms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Open Create Dialog ──────────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    if (projects.length === 0) {
      toast.error('Create a project first', {
        description: 'Go to Settings > Project to set up your project before creating forms.',
        action: { label: 'Go to Settings', onClick: () => router.push('/dashboard/settings') },
      });
      return;
    }
    if (userPlan === 'free' && forms.length >= 1) {
      setShowUpgradePrompt(true);
      return;
    }
    setFormTitle('Share your experience');
    setFormDesc('');
    setCustomQuestions([]);
    setNewQuestion('');
    setSelectedProjectId(activeProjectId ?? projects[0]?.id ?? '');
    setCreateOpen(true);
  }, [userPlan, forms.length, projects, activeProjectId, router]);

  // ── Create Form ────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    if (!formTitle.trim()) {
      toast.error('Please enter a form title');
      return;
    }
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('collection_forms')
        .insert({
          user_id: user.id,
          project_id: selectedProjectId,
          title: formTitle.trim(),
          description: formDesc.trim() || null,
          custom_questions: customQuestions,
          is_active: true,
        })
        .select('*, project:projects(name)')
        .single();

      if (error) throw error;
      setForms((prev) => [{ ...data, submission_count: 0 }, ...prev]);
      setCreateOpen(false);
      toast.success('Form created successfully');
    } catch (err) {
      toast.error('Failed to create form');
      console.error(err);
    } finally {
      setCreating(false);
    }
  }, [supabase, formTitle, formDesc, selectedProjectId, customQuestions]);

  // ── Toggle active ──────────────────────────────────────────────────────────
  const handleToggle = useCallback(
    async (id: string, active: boolean) => {
      // Optimistic
      setForms((prev) => prev.map((f) => (f.id === id ? { ...f, is_active: active } : f)));
      try {
        const { error } = await supabase
          .from('collection_forms')
          .update({ is_active: active })
          .eq('id', id);
        if (error) throw error;
        toast.success(active ? 'Form activated' : 'Form deactivated');
      } catch (err) {
        setForms((prev) => prev.map((f) => (f.id === id ? { ...f, is_active: !active } : f)));
        toast.error('Failed to update form');
        console.error(err);
      }
    },
    [supabase]
  );

  // ── Delete form ────────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const { error } = await supabase.from('collection_forms').delete().eq('id', id);
        if (error) throw error;
        setForms((prev) => prev.filter((f) => f.id !== id));
        toast.success('Form deleted');
      } catch (err) {
        toast.error('Failed to delete form');
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    },
    [supabase]
  );

  // ── Duplicate form ─────────────────────────────────────────────────────────
  const handleDuplicate = useCallback(
    async (id: string) => {
      setDuplicatingId(id);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const original = forms.find((f) => f.id === id);
        if (!original) throw new Error('Form not found');

        const { data, error } = await supabase
          .from('collection_forms')
          .insert({
            user_id: user.id,
            project_id: original.project_id,
            title: `${original.title} (Copy)`,
            description: original.description,
            custom_questions: original.custom_questions,
            is_active: false,
          })
          .select('*, project:projects(name)')
          .single();

        if (error) throw error;
        setForms((prev) => [{ ...data, submission_count: 0 }, ...prev]);
        toast.success('Form duplicated');
      } catch (err) {
        toast.error('Failed to duplicate form');
        console.error(err);
      } finally {
        setDuplicatingId(null);
      }
    },
    [supabase, forms]
  );

  // ── Custom Questions ──────────────────────────────────────────────────────
  const addQuestion = useCallback(() => {
    const q = newQuestion.trim();
    if (!q) return;
    if (customQuestions.length >= 5) {
      toast.error('Maximum 5 custom questions allowed');
      return;
    }
    setCustomQuestions((prev) => [...prev, q]);
    setNewQuestion('');
  }, [newQuestion, customQuestions]);

  const removeQuestion = useCallback((idx: number) => {
    setCustomQuestions((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Collection Forms</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Share these links to collect testimonials from customers.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="size-4" />
          Create Form
        </Button>
      </div>

      {/* ── No project banner ── */}
      {!loading && projects.length === 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="size-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              You need a project before you can create forms.
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Set up your project in Settings to get started.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/settings')}
            className="gap-1.5 rounded-xl border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0"
          >
            <Settings className="size-3.5" />
            Go to Settings
          </Button>
        </div>
      )}

      {/* ── Form list ── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <FormCardSkeleton key={i} />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <EmptyState onCreateClick={openCreate} />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onQR={(id, title) => { setQrFormId(id); setQrFormTitle(title); }}
                onDuplicate={handleDuplicate}
                isDeleting={deletingId === form.id}
                isDuplicating={duplicatingId === form.id}
                isPro={userPlan !== 'free'}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── QR Dialog ── */}
      {qrFormId && (
        <QRDialog
          open={!!qrFormId}
          onClose={() => setQrFormId(null)}
          formLink={`${SITE_URL}/c/${qrFormId}`}
          formTitle={qrFormTitle}
        />
      )}

      {/* ── Upgrade prompt dialog ── */}
      <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="size-5 text-amber-500" />
              Free plan limit reached
            </DialogTitle>
            <DialogDescription>
              The Free plan allows 1 collection form. Upgrade to Pro to create unlimited forms.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <ul className="space-y-2 text-sm text-amber-900">
              {[
                'Unlimited collection forms',
                'Unlimited embed widgets',
                'Google Review nudge after 4-5 stars',
                'Carousel, Wall of Love, and List layouts',
                'Remove Vouch branding',
                'Custom public page address',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="size-3.5 text-amber-600 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradePrompt(false)} className="rounded-xl">
              Maybe later
            </Button>
            <Button
              className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
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
              <Zap className="size-4" />
              Upgrade to Pro, $19/mo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Form Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Collection Form</DialogTitle>
            <DialogDescription>
              Customers will fill this form to submit their testimonials.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Project (only show selector when user has multiple projects) */}
            {projects.length === 0 ? (
            <div className="space-y-1.5">
              <Label htmlFor="form-project">Project</Label>
                <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                  No projects found. Create a project in Settings first.
                </p>
            </div>
            ) : projects.length > 1 ? (
            <div className="space-y-1.5">
              <Label htmlFor="form-project">Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger id="form-project" className="rounded-xl w-full">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            ) : null}

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Share your experience"
                className="rounded-xl"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="form-desc">Description</Label>
              <Textarea
                id="form-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="We'd love to hear what you think about our product…"
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            {/* Custom Questions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Custom Questions</Label>
                <span className="text-xs text-muted-foreground">{customQuestions.length}/5</span>
              </div>

              <AnimatePresence>
                {customQuestions.map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 rounded-xl bg-muted/40 border border-border px-3 py-2 text-sm">
                      {q}
                    </div>
                    <button
                      onClick={() => removeQuestion(i)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {customQuestions.length < 5 && (
                <div className="flex gap-2">
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
                    placeholder="What problem did we solve for you?"
                    className="rounded-xl text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    disabled={!newQuestion.trim()}
                    className="rounded-xl shrink-0"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !formTitle.trim() || !selectedProjectId}
              className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
              {creating && <Loader2 className="size-4 animate-spin" />}
              Create Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

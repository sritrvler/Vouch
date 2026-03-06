'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CheckCircle2,
  ArrowRight,
  FileText,
  Layout,
  ExternalLink,
  Settings,
  Check,
  Inbox,
  TrendingUp,
  Star,
  MessageSquare,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/context/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  total: number;
  pending: number;
  approved: number;
  widgetViews: number;
  hasProject: boolean;
  hasForm: boolean;
  hasWidget: boolean;
}

interface RecentTestimonial {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'size-3.5',
            i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: RecentTestimonial['status'] }) {
  if (status === 'approved') {
    return (
      <Badge className="text-xs bg-green-50 text-green-700 border-green-200 border" variant="outline">
        Approved
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200 border" variant="outline">
        Pending
      </Badge>
    );
  }
  return (
    <Badge className="text-xs bg-red-50 text-red-700 border-red-200 border" variant="outline">
      Rejected
    </Badge>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SHIMMER_STYLE = `@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } @media (prefers-reduced-motion: reduce) { @keyframes shimmer { 0%, 100% { transform: none; } } }`;

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-muted relative overflow-hidden',
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <style>{SHIMMER_STYLE}</style>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-16 rounded-2xl" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Pending Banner ───────────────────────────────────────────────────────────

function PendingBanner({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Link
        href="/dashboard/inbox"
        className="flex items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 hover:bg-indigo-100/80 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Inbox className="size-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">
              {count} {count === 1 ? 'testimonial' : 'testimonials'} waiting for your review
            </p>
            <p className="text-xs text-indigo-700/70 mt-0.5">
              Approve them to make them live on your site
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-700 shrink-0">
          Review now
          <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Key Metric Card ──────────────────────────────────────────────────────────

function MetricCard({
  value,
  label,
  sublabel,
  icon: Icon,
  iconClass,
  delay = 0,
}: {
  value: number;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  iconClass: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-border/60 shadow-sm px-6 py-5 flex items-center gap-4 cursor-default"
    >
      <div className={cn('size-11 rounded-2xl flex items-center justify-center shrink-0', iconClass)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-bold text-foreground tabular-nums leading-none">
          {value.toLocaleString()}
        </p>
        <p className="text-sm font-medium text-foreground mt-1">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
    </motion.div>
  );
}

// ─── Getting Started Checklist ────────────────────────────────────────────────

function GettingStarted({ stats }: { stats: Stats }) {
  const steps = [
    {
      label: 'Set up your project',
      description: 'Add your business name, logo, and accent colour.',
      done: stats.hasProject,
      href: '/dashboard/settings',
      icon: Settings,
    },
    {
      label: 'Create a collection form',
      description: 'Get a shareable link to send to your customers.',
      done: stats.hasForm,
      href: '/dashboard/forms',
      icon: FileText,
    },
    {
      label: 'Receive your first testimonial',
      description: 'Share the link and wait for the first submission.',
      done: stats.total > 0,
      href: '/dashboard/forms',
      icon: MessageSquare,
    },
    {
      label: 'Approve and embed',
      description: 'Approve it in the Inbox, then build your widget.',
      done: stats.approved > 0 && stats.hasWidget,
      href: stats.approved > 0 ? '/dashboard/widgets' : '/dashboard/inbox',
      icon: Layout,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Get started with Vouch</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {completedCount} of {steps.length} steps complete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {steps.map((step) => (
          <Link
            key={step.label}
            href={step.href}
            className={cn(
              'flex items-center gap-4 px-6 py-4 transition-colors',
              step.done ? 'opacity-60' : 'hover:bg-muted/30'
            )}
          >
            <div className={cn(
              'size-8 rounded-full flex items-center justify-center shrink-0 border-2',
              step.done
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-border bg-muted/30 text-muted-foreground'
            )}>
              {step.done ? <Check className="size-4" /> : <step.icon className="size-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', step.done ? 'line-through text-muted-foreground' : 'text-foreground')}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            </div>
            {!step.done && <ArrowRight className="size-4 text-muted-foreground shrink-0" />}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { projects, selectedProjectId, showAllProjects, loading: projectsLoading } = useProject();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, widgetViews: 0, hasProject: false, hasForm: false, hasWidget: false });
  const [recentTestimonials, setRecentTestimonials] = useState<RecentTestimonial[]>([]);

  const effectiveFilter = (showAllProjects && projects.length > 1) ? 'all' : 'project';

  useEffect(() => {
    if (projectsLoading) return;

    async function fetchData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Scope key: filter by project_id when a specific project is selected, otherwise by user_id
        const scopeKey = effectiveFilter === 'project' && selectedProjectId ? 'project_id' : 'user_id';
        const scopeVal = effectiveFilter === 'project' && selectedProjectId ? selectedProjectId : user.id;

        const [totalRes, pendingRes, approvedRes, recentRes, widgetsRes, projectsRes, formsRes] = await Promise.all([
          supabase
            .from('testimonials')
            .select('id', { count: 'exact', head: true })
            .eq(scopeKey, scopeVal),
          supabase
            .from('testimonials')
            .select('id', { count: 'exact', head: true })
            .eq(scopeKey, scopeVal)
            .eq('status', 'pending'),
          supabase
            .from('testimonials')
            .select('id', { count: 'exact', head: true })
            .eq(scopeKey, scopeVal)
            .eq('status', 'approved'),
          supabase
            .from('testimonials')
            .select('id, author_name, rating, content, status, created_at')
            .eq(scopeKey, scopeVal)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('widgets').select('id').eq(scopeKey, scopeVal),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('collection_forms').select('id', { count: 'exact', head: true }).eq(scopeKey, scopeVal),
        ]);

        // Widget views: get widget ids from scoped query, then count views
        let widgetViews = 0;
        if (widgetsRes.data && widgetsRes.data.length > 0) {
          const widgetIds = widgetsRes.data.map((w) => w.id);
          const { count } = await supabase
            .from('widget_views')
            .select('id', { count: 'exact', head: true })
            .in('widget_id', widgetIds);
          widgetViews = count ?? 0;
        }

        setStats({
          total: totalRes.count ?? 0,
          pending: pendingRes.count ?? 0,
          approved: approvedRes.count ?? 0,
          widgetViews,
          hasProject: (projectsRes.count ?? 0) > 0,
          hasForm: (formsRes.count ?? 0) > 0,
          hasWidget: (widgetsRes.data?.length ?? 0) > 0,
        });

        setRecentTestimonials((recentRes.data as RecentTestimonial[]) ?? []);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchData();
  }, [selectedProjectId, effectiveFilter, projectsLoading]);

  if (loading) return <DashboardSkeleton />;

  const hasTestimonials = stats.total > 0;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Page title + filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {hasTestimonials ? "Here\u0027s what\u0027s happening with your testimonials." : "Let\u0027s get your first testimonial."}
          </p>
        </div>
      </motion.div>

      {/* Pending banner, only shown when there are testimonials to review */}
      <PendingBanner count={stats.pending} />

      {/* Key metrics */}
      <div className="grid sm:grid-cols-2 gap-4">
        <MetricCard
          value={stats.approved}
          label="Approved testimonials"
          sublabel={stats.total > 0 ? `${stats.total} received in total` : 'None approved yet'}
          icon={CheckCircle2}
          iconClass="bg-emerald-100 text-emerald-600"
          delay={0}
        />
        <MetricCard
          value={stats.widgetViews}
          label="Widget views"
          sublabel={stats.widgetViews > 0 ? 'People have seen your testimonials' : 'Embed a widget to start tracking'}
          icon={TrendingUp}
          iconClass="bg-violet-100 text-violet-600"
          delay={0.06}
        />
      </div>

      {/* Getting started checklist, show until all steps are complete */}
      {(!stats.hasProject || !stats.hasForm || stats.total === 0 || stats.approved === 0 || !stats.hasWidget) && (
        <GettingStarted stats={stats} />
      )}

      {hasTestimonials && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Recent testimonials</h2>
            <Button variant="ghost" size="sm" asChild className="text-primary gap-1">
              <Link href="/dashboard/inbox">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl border border-border/60 px-5 py-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">
                    {testimonial.author_name[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">
                      {testimonial.author_name}
                    </span>
                    <StarRating rating={testimonial.rating} />
                    <StatusBadge status={testimonial.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {testimonial.content}
                  </p>
                </div>

                {/* View link */}
                <Link
                  href={`/dashboard/inbox?id=${testimonial.id}`}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                  aria-label="View testimonial"
                >
                  <ExternalLink className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Quick actions */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: hasTestimonials ? 0.15 : 0.1, ease: 'easeOut' }}
      >
        <h2 className="text-base font-semibold text-foreground mb-4">Quick actions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/60 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <Link href="/dashboard/forms" className="flex items-start gap-4 p-5 h-full">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                <FileText className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">Share collection form</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Send a unique link to collect testimonials from customers
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground shrink-0 self-center" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <Link href="/dashboard/widgets" className="flex items-start gap-4 p-5 h-full">
              <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600 shrink-0 mt-0.5">
                <Layout className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">Embed widget</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add a beautiful testimonials widget to your website
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground shrink-0 self-center" />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

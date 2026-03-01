'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Layout,
  Settings,
  LogOut,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inbox', href: '/dashboard/inbox', icon: Inbox },
  { label: 'Forms', href: '/dashboard/forms', icon: FileText },
  { label: 'Widgets', href: '/dashboard/widgets', icon: Layout },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function NavLink({
  item,
  pendingCount,
  isActive,
  mobile,
}: {
  item: NavItem;
  pendingCount?: number;
  isActive: boolean;
  mobile?: boolean;
}) {
  const Icon = item.icon;

  if (mobile) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors text-xs font-medium min-w-0',
          isActive
            ? 'text-primary bg-accent'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        <div className="relative">
          <Icon className="size-5" />
          {item.label === 'Inbox' && pendingCount && pendingCount > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1 leading-none">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          ) : null}
        </div>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full',
        isActive
          ? 'bg-accent text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.label === 'Inbox' && pendingCount && pendingCount > 0 ? (
        <span className="min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center px-1.5 leading-none">
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      ) : null}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [projectName, setProjectName] = useState<string>('My Project');
  const [pendingCount, setPendingCount] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Load subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single();

      if (sub) setPlan(sub.plan as 'free' | 'pro');

      // Load first project name
      const { data: projects } = await supabase
        .from('projects')
        .select('name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (projects && projects.length > 0) {
        setProjectName(projects[0].name);
      }

      // Load pending testimonials count
      const { count } = await supabase
        .from('testimonials')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      setPendingCount(count ?? 0);
    }

    loadData();
  }, [router]);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('Failed to sign out. Please try again.');
      setIsSigningOut(false);
      return;
    }

    router.push('/login');
  }

  const isExact = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col h-full bg-white border-r border-border">
        {/* Top: Logo + Project */}
        <div className="px-4 pt-5 pb-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold tracking-tight text-primary">Vouch</span>
          </Link>

          {/* Project selector (display only) */}
          <button
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-sm font-medium text-foreground transition-colors"
            type="button"
            aria-label="Select project"
          >
            <span className="truncate">{projectName}</span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pendingCount={pendingCount}
              isActive={isExact(item.href)}
            />
          ))}
        </nav>

        {/* Bottom: User + Upgrade + Sign out */}
        <div className="px-3 py-4 border-t border-border space-y-2">
          {plan === 'free' && (
            <Link
              href="/dashboard/settings?tab=billing"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-accent text-primary text-sm font-medium hover:from-primary/15 hover:to-accent transition-all"
            >
              <Sparkles className="size-4 shrink-0" />
              Upgrade to Pro
            </Link>
          )}

          {/* User info */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl">
            <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary">
                {user?.email ? user.email[0].toUpperCase() : '?'}
              </span>
            </div>
            <span className="flex-1 text-xs text-muted-foreground truncate min-w-0">
              {user?.email ?? ''}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="size-4 shrink-0" />
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pendingCount={pendingCount}
              isActive={isExact(item.href)}
              mobile
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

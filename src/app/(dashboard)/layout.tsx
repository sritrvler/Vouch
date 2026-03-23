'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, MotionConfig } from 'framer-motion';
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
  Zap,
  Check,
  Plus,
  Search,
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/upgrade-modal';
import { ProjectProvider, useProject } from '@/context/ProjectContext';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
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
        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full',
        isActive
          ? 'bg-accent text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          aria-hidden="true"
        />
      )}
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.label === 'Inbox' && pendingCount && pendingCount > 0 ? (
        <span className="min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center px-1.5 leading-none">
          {pendingCount > 99 ? '99+' : pendingCount}
          <span className="sr-only"> pending</span>
        </span>
      ) : null}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ProjectProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </ProjectProvider>
    </MotionConfig>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { projects, selectedProjectId, selectedProject, plan, switchProject, showAllProjects, setShowAllProjects } = useProject();
  const [user, setUser] = useState<User | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);
  const [mobileProjectPopoverOpen, setMobileProjectPopoverOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  // Sort projects alphabetically, show search when > 5
  const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name));
  const showProjectSearch = sortedProjects.length > 5;
  const filteredProjects = projectSearch
    ? sortedProjects.filter((p) => p.name.toLowerCase().includes(projectSearch.toLowerCase()))
    : sortedProjects;

  useEffect(() => { setMounted(true); }, []);

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
    const { error } = await supabase.auth.signOut({ scope: 'local' });

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
          <Link href="/dashboard" className="flex items-center gap-2 mb-3 group">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-sm group-hover:bg-primary/90 transition-colors">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Vouch</span>
          </Link>

          {/* Project selector */}
          {!mounted ? (
            <button
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted/60 text-sm font-medium text-foreground"
              type="button"
              aria-label="Select project"
            >
              <span className="truncate">{selectedProject?.name ?? 'No projects'}</span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          ) : (
          <Popover open={projectPopoverOpen} onOpenChange={(open) => { setProjectPopoverOpen(open); if (!open) setProjectSearch(''); }}>
            <PopoverTrigger asChild>
              <button
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                type="button"
                aria-label="Select project"
              >
                <span className="truncate">{showAllProjects ? 'All projects' : (selectedProject?.name ?? 'No projects')}</span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-60 p-1.5">
              {showProjectSearch && (
                <div className="relative mb-1.5">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg text-sm bg-muted/40 border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                </div>
              )}
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {projects.length > 1 && !projectSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllProjects(true);
                      setProjectPopoverOpen(false);
                      setProjectSearch('');
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors text-left',
                      showAllProjects
                        ? 'bg-accent text-primary font-medium'
                        : 'text-foreground hover:bg-muted/60'
                    )}
                  >
                    <span className="flex-1 truncate">All projects</span>
                    {showAllProjects && <Check className="size-3.5 shrink-0 text-primary" />}
                  </button>
                )}
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setShowAllProjects(false);
                      switchProject(p.id);
                      setProjectPopoverOpen(false);
                      setProjectSearch('');
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors text-left',
                      !showAllProjects && p.id === selectedProjectId
                        ? 'bg-accent text-primary font-medium'
                        : 'text-foreground hover:bg-muted/60'
                    )}
                  >
                    <span className="flex-1 truncate">{p.name}</span>
                    {!showAllProjects && p.id === selectedProjectId && <Check className="size-3.5 shrink-0 text-primary" />}
                  </button>
                ))}
                {filteredProjects.length === 0 && projectSearch && (
                  <p className="px-2.5 py-2 text-xs text-muted-foreground">No projects match "{projectSearch}"</p>
                )}
                {projects.length === 0 && (
                  <p className="px-2.5 py-2 text-xs text-muted-foreground">No projects yet</p>
                )}
              </div>
              <div className="border-t border-border mt-1.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setProjectPopoverOpen(false);
                    if (plan === 'free' && projects.length >= 1) {
                      setUpgradeModalOpen(true);
                      return;
                    }
                    router.push('/dashboard/settings?tab=project&new=true');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                >
                  <Plus className="size-3.5" />
                  New Project
                </button>
              </div>
            </PopoverContent>
          </Popover>
          )}
        </div>

        {/* Nav items */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
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
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 text-primary text-sm font-semibold hover:from-indigo-100 hover:to-violet-100 transition-all w-full shadow-sm"
            >
              <Sparkles className="size-4 shrink-0 text-violet-500" />
              Upgrade
            </button>
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
        {/* Mobile Header */}
        <div className="md:hidden border-b border-border bg-white shrink-0">
          {/* Top bar: project selector left, avatar right */}
          <div className="flex items-center gap-3 px-4 py-2.5">
            {/* Project selector (takes available space) */}
            {!mounted ? (
              <button className="flex items-center gap-2 min-w-0 flex-1" type="button" aria-label="Select project">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <span className="text-sm font-semibold text-foreground truncate">{selectedProject?.name ?? 'No projects'}</span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            ) : (
            <Popover open={mobileProjectPopoverOpen} onOpenChange={(open) => { setMobileProjectPopoverOpen(open); if (!open) setProjectSearch(''); }}>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-2 min-w-0 flex-1"
                  type="button"
                  aria-label="Select project"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                  <span className="text-sm font-semibold text-foreground truncate">{showAllProjects ? 'All projects' : (selectedProject?.name ?? 'No projects')}</span>
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" sideOffset={4} collisionPadding={16} className="w-[calc(100vw-2rem)] max-w-sm p-1.5">
                {showProjectSearch && (
                  <div className="relative mb-1.5">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg text-sm bg-muted/40 border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto space-y-0.5">
                  {projects.length > 1 && !projectSearch && (
                    <button
                      type="button"
                      onClick={() => { setShowAllProjects(true); setMobileProjectPopoverOpen(false); setProjectSearch(''); }}
                      className={cn(
                        'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors',
                        showAllProjects ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                      )}
                    >
                      <Check className={cn('size-3.5 shrink-0', showAllProjects ? 'opacity-100' : 'opacity-0')} />
                      <span className="truncate">All projects</span>
                    </button>
                  )}
                  {filteredProjects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setShowAllProjects(false); switchProject(p.id); setMobileProjectPopoverOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors',
                        !showAllProjects && selectedProjectId === p.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                      )}
                    >
                      <Check className={cn('size-3.5 shrink-0', !showAllProjects && selectedProjectId === p.id ? 'opacity-100' : 'opacity-0')} />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
                {plan !== 'free' && (
                  <button
                    type="button"
                    onClick={() => { setMobileProjectPopoverOpen(false); router.push('/dashboard/settings?tab=project&new=true'); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-t border-border pt-2"
                  >
                    <Plus className="size-3.5" />
                    New project
                  </button>
                )}
                {plan === 'free' && projects.length >= 1 && (
                  <button
                    type="button"
                    onClick={() => { setMobileProjectPopoverOpen(false); setUpgradeModalOpen(true); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors border-t border-border pt-2"
                  >
                    <Sparkles className="size-3.5" />
                    Upgrade for more projects
                  </button>
                )}
              </PopoverContent>
            </Popover>
            )}

            {/* Avatar menu */}
            {!mounted ? (
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0" aria-label="Account menu">
                <span className="text-xs font-semibold text-primary">
                  {user?.email ? user.email[0].toUpperCase() : '?'}
                </span>
              </div>
            ) : (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors"
                  aria-label="Account menu"
                >
                  <span className="text-xs font-semibold text-primary">
                    {user?.email ? user.email[0].toUpperCase() : '?'}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" sideOffset={4} className="w-56 p-1.5">
                <div className="px-2.5 py-2 mb-1 border-b border-border">
                  <p className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
                </div>
                {plan === 'free' && (
                  <button
                    type="button"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Sparkles className="size-3.5" />
                    Upgrade to Pro
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="size-3.5" />
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </button>
              </PopoverContent>
            </Popover>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="min-h-full pb-24 md:pb-0"
          >
            {children}
          </motion.div>
        </div>
      </main>

      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      <Toaster richColors position="bottom-right" />

      {/* Mobile Bottom Nav */}
      <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-area-inset-bottom">
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

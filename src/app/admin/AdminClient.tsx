'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Search, Loader2, User, Check, ShieldOff, Shield, LogIn, Copy, CopyCheck } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  plan: string;
  status: string;
  is_banned: boolean;
  current_period_end: string | null;
  stripe_subscription_id: string | null;
  project: { name: string; slug: string | null; google_review_url: string | null; linkedin_url: string | null } | null;
  formCount: number;
  testimonialCount: number;
  approvedCount: number;
  widgetCount: number;
  widgetViews: number;
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  pro: 'bg-indigo-100 text-indigo-700',
  studio: 'bg-slate-800 text-white',
};

export default function AdminClient() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);
  const [isBanning, setIsBanning] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [impersonateLink, setImpersonateLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setUserData(null);
    setNotFound(false);
    setImpersonateLink(null);
    try {
      const res = await fetch(`/api/admin/lookup?email=${encodeURIComponent(email.trim())}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error('Lookup failed');
      const data = await res.json();
      setUserData(data);
      setSelectedPlan(data.plan);
    } catch {
      toast.error('Lookup failed. Check the API route or service role key.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPlan() {
    if (!userData || selectedPlan === userData.plan) return;
    setSavingPlan(true);
    try {
      const res = await fetch('/api/admin/set-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, plan: selectedPlan }),
      });
      if (!res.ok) throw new Error('Failed to set plan');
      toast.success(`Plan updated to ${selectedPlan}`);
      setUserData((prev) => prev ? { ...prev, plan: selectedPlan } : prev);
    } catch {
      toast.error('Failed to update plan');
    } finally {
      setSavingPlan(false);
    }
  }

  async function handleToggleBan() {
    if (!userData) return;
    const newBanned = !userData.is_banned;
    setIsBanning(true);
    try {
      const res = await fetch('/api/admin/toggle-ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, banned: newBanned }),
      });
      if (!res.ok) throw new Error('Failed to toggle ban');
      toast.success(newBanned ? 'User suspended' : 'User unsuspended');
      setUserData((prev) => prev ? { ...prev, is_banned: newBanned } : prev);
    } catch {
      toast.error('Failed to update ban status');
    } finally {
      setIsBanning(false);
    }
  }

  async function handleImpersonate() {
    if (!userData) return;
    setImpersonating(true);
    setImpersonateLink(null);
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email }),
      });
      if (!res.ok) throw new Error('Failed to generate link');
      const data = await res.json();
      setImpersonateLink(data.link ?? null);
    } catch {
      toast.error('Failed to generate login link');
    } finally {
      setImpersonating(false);
    }
  }

  async function copyLink() {
    if (!impersonateLink) return;
    await navigator.clipboard.writeText(impersonateLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">User Lookup</h2>
      <p className="text-sm text-gray-500 mb-5">
        Search any user by email to see their full account state and override their plan.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Look up
        </button>
      </form>

      {notFound && (
        <div className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-200 rounded-xl">
          No user found with that email address.
        </div>
      )}

      {userData && (
        <div className="space-y-5">
          {/* Identity */}
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <User className="size-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{userData.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${PLAN_COLORS[userData.plan] ?? PLAN_COLORS.free}`}>
                  {userData.plan}
                </span>
                <span className="text-xs text-gray-400">status: {userData.status}</span>
                {userData.is_banned && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">
                    <ShieldOff className="size-3" /> suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Signed up {format(new Date(userData.created_at), 'MMM d, yyyy')}
                {userData.last_sign_in_at && (
                  <> · Last login {format(new Date(userData.last_sign_in_at), 'MMM d, yyyy')}</>
                )}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Forms', value: userData.formCount },
              { label: 'Testimonials', value: `${userData.approvedCount} / ${userData.testimonialCount}` },
              { label: 'Widgets', value: userData.widgetCount },
              { label: 'Widget views', value: userData.widgetViews },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Project info */}
          {userData.project && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm space-y-1">
              <p className="font-medium text-gray-700">{userData.project.name}</p>
              <p className="text-xs text-gray-400">
                Slug: {userData.project.slug ?? 'none'} |
                Google: {userData.project.google_review_url ? 'set' : 'not set'} |
                LinkedIn: {userData.project.linkedin_url ? 'set' : 'not set'}
              </p>
            </div>
          )}

          {/* LS subscription ID */}
          {userData.stripe_subscription_id && (
            <p className="text-xs text-gray-400">
              LS subscription ID: <span className="font-mono">{userData.stripe_subscription_id}</span>
              {userData.current_period_end && (
                <> · Renews {format(new Date(userData.current_period_end), 'MMM d, yyyy')}</>
              )}
            </p>
          )}

          {/* Plan override */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Override Plan</p>
            <div className="flex items-center gap-2">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="studio">Studio</option>
              </select>
              <button
                onClick={handleSetPlan}
                disabled={savingPlan || selectedPlan === userData.plan}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {savingPlan ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                {savingPlan ? 'Saving...' : selectedPlan === userData.plan ? 'Current plan' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              This sets the plan in the DB immediately. Does not touch Lemon Squeezy billing.
            </p>
          </div>

          {/* Login as User */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Login as User</p>
            <button
              onClick={handleImpersonate}
              disabled={impersonating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {impersonating ? <Loader2 className="size-3.5 animate-spin" /> : <LogIn className="size-3.5" />}
              {impersonating ? 'Generating...' : 'Generate login link'}
            </button>
            {impersonateLink && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  One-time magic link. Open in an incognito window to log in as this user.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-all text-gray-600">
                    {impersonateLink}
                  </code>
                  <button
                    onClick={copyLink}
                    className="shrink-0 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {copiedLink ? <CopyCheck className="size-4 text-emerald-600" /> : <Copy className="size-4 text-gray-500" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Danger zone: Suspend */}
          <div className="border-t border-red-100 pt-4">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Danger Zone</p>
            <button
              onClick={handleToggleBan}
              disabled={isBanning}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                userData.is_banned
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              }`}
            >
              {isBanning ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : userData.is_banned ? (
                <Shield className="size-3.5" />
              ) : (
                <ShieldOff className="size-3.5" />
              )}
              {isBanning ? 'Saving...' : userData.is_banned ? 'Unsuspend user' : 'Suspend user'}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Suspended users cannot access their collection forms, widgets, or public pages.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

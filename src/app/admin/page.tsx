import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { AlertTriangle, Users, DollarSign, MessageSquare, Monitor, UserPlus } from 'lucide-react';
import AdminClient from './AdminClient';

function pct(num: number, den: number): string {
  if (den === 0) return '0%';
  return `${Math.round((num / den) * 100)}%`;
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  pro: 'bg-indigo-100 text-indigo-700',
  studio: 'bg-slate-800 text-white',
};

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !user || user.email !== adminEmail) return notFound();

  const admin = createAdminClient();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Parallel data fetch
  const [subRes, projectRes, formRes, testimonialRes, widgetRes, widgetViewsRes, authRes] =
    await Promise.all([
      admin.from('subscriptions').select('user_id, plan, status, current_period_end, stripe_subscription_id, is_banned'),
      admin.from('projects').select('user_id, google_review_url, linkedin_url, slug'),
      admin.from('collection_forms').select('user_id, is_active'),
      admin.from('testimonials').select('user_id, created_at, status'),
      admin.from('widgets').select('id, user_id'),
      // Fetch widget_ids (not just count) so we can compute per-user views
      admin.from('widget_views').select('widget_id').gte('created_at', monthAgo),
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  const subs = subRes.data ?? [];
  const projects = projectRes.data ?? [];
  const forms = formRes.data ?? [];
  const testimonials = testimonialRes.data ?? [];
  const widgets = widgetRes.data ?? [];
  const widgetViewRows = widgetViewsRes.data ?? [];
  const authUsers = authRes.data?.users ?? [];

  // User lookup map: id => { email, created_at, last_sign_in_at }
  const userMap: Record<string, { email: string; created_at: string; last_sign_in_at: string | null }> = {};
  authUsers.forEach((u) => {
    userMap[u.id] = { email: u.email ?? '', created_at: u.created_at, last_sign_in_at: u.last_sign_in_at ?? null };
  });

  // Widget id -> user_id map, and per-user widget view count (last 30 days)
  const widgetUserMap: Record<string, string> = {};
  widgets.forEach((w) => { widgetUserMap[w.id] = w.user_id; });

  const widgetViewsByUser: Record<string, number> = {};
  widgetViewRows.forEach((v) => {
    const uid = widgetUserMap[v.widget_id];
    if (uid) widgetViewsByUser[uid] = (widgetViewsByUser[uid] ?? 0) + 1;
  });
  const widgetViewsMonth = widgetViewRows.length;

  // Core metrics
  const totalUsers = subs.length;
  const proSubs = subs.filter((s) => s.plan === 'pro');
  const studioSubs = subs.filter((s) => s.plan === 'studio');
  const paidCount = proSubs.length + studioSubs.length;
  const mrr = proSubs.length * 19;
  const pastDue = subs.filter((s) => s.status === 'past_due');
  const testimonialsThisWeek = testimonials.filter((t) => t.created_at > weekAgo).length;

  // New signups in last 30 days
  const newSignups30d = authUsers.filter((u) => u.created_at >= monthAgo).length;

  // Activation funnel — last 30-day cohort
  const recentUserIds = new Set(
    authUsers.filter((u) => u.created_at >= monthAgo).map((u) => u.id)
  );
  const recentTotal = recentUserIds.size;
  const recentWithProject = new Set(
    projects.filter((p) => recentUserIds.has(p.user_id)).map((p) => p.user_id)
  ).size;
  const recentWithActiveForm = new Set(
    forms.filter((f) => f.is_active && recentUserIds.has(f.user_id)).map((f) => f.user_id)
  ).size;
  const recentWithTestimonial = new Set(
    testimonials.filter((t) => recentUserIds.has(t.user_id)).map((t) => t.user_id)
  ).size;
  const recentWithWidget = new Set(
    widgets.filter((w) => recentUserIds.has(w.user_id)).map((w) => w.user_id)
  ).size;

  // Testimonial count per user
  const tCountByUser: Record<string, number> = {};
  testimonials.forEach((t) => {
    tCountByUser[t.user_id] = (tCountByUser[t.user_id] ?? 0) + 1;
  });

  // Feature adoption among paid users
  const paidUserIds = new Set([...proSubs, ...studioSubs].map((s) => s.user_id));
  const paidProjects = projects.filter((p) => paidUserIds.has(p.user_id));
  const googleSet = paidProjects.filter((p) => p.google_review_url).length;
  const linkedinSet = paidProjects.filter((p) => p.linkedin_url).length;
  const slugSet = paidProjects.filter((p) => p.slug).length;
  const paidCount_ = paidProjects.length || 1;

  // Recent signups (last 15)
  const recentSignups = [...authUsers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15)
    .map((u) => {
      const sub = subs.find((s) => s.user_id === u.id);
      return {
        id: u.id,
        email: u.email ?? '',
        plan: sub?.plan ?? 'free',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        tCount: tCountByUser[u.id] ?? 0,
      };
    });

  // High-intent free users: 5+ testimonials OR >5000 widget views in last 30 days
  const freeUserIds = new Set(subs.filter((s) => s.plan === 'free').map((s) => s.user_id));
  const highIntent = Array.from(freeUserIds)
    .filter((id) => (tCountByUser[id] ?? 0) >= 5 || (widgetViewsByUser[id] ?? 0) >= 5000)
    .map((id) => ({
      id,
      email: userMap[id]?.email ?? id,
      tCount: tCountByUser[id] ?? 0,
      widgetViews30d: widgetViewsByUser[id] ?? 0,
    }))
    .sort((a, b) => b.widgetViews30d - a.widgetViews30d || b.tCount - a.tCount)
    .slice(0, 10);

  // Pro subscribers list
  const proList = proSubs
    .map((s) => ({
      id: s.user_id,
      email: userMap[s.user_id]?.email ?? s.user_id,
      status: s.status,
      current_period_end: s.current_period_end,
      last_sign_in_at: userMap[s.user_id]?.last_sign_in_at ?? null,
      tCount: tCountByUser[s.user_id] ?? 0,
      lsId: s.stripe_subscription_id,
    }))
    .sort((a, b) => (b.current_period_end ?? '').localeCompare(a.current_period_end ?? ''));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Vouch Admin</h1>
            <p className="text-xs text-gray-400">{format(new Date(), 'EEEE, MMM d, yyyy')}</p>
          </div>
          <span className="text-xs text-gray-400">{user.email}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Health banner */}
        {pastDue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="size-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {pastDue.length} past_due subscription{pastDue.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Lemon Squeezy is failing to charge these users. Check the LS dashboard immediately.
                User IDs: {pastDue.map((s) => userMap[s.user_id]?.email ?? s.user_id).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              icon: <Users className="size-5 text-indigo-500" />,
              label: 'Total users',
              value: totalUsers,
              sub: `${paidCount} paid`,
            },
            {
              icon: <DollarSign className="size-5 text-emerald-500" />,
              label: 'MRR (Pro)',
              value: `$${mrr}`,
              sub: `${proSubs.length} Pro · ${studioSubs.length} Studio`,
            },
            {
              icon: <MessageSquare className="size-5 text-amber-500" />,
              label: 'Testimonials (7d)',
              value: testimonialsThisWeek,
              sub: `${testimonials.length} all time`,
            },
            {
              icon: <Monitor className="size-5 text-sky-500" />,
              label: 'Widget views (30d)',
              value: widgetViewsMonth,
              sub: 'across all embeds',
            },
            {
              icon: <UserPlus className="size-5 text-violet-500" />,
              label: 'New signups (30d)',
              value: newSignups30d,
              sub: 'viral loop proxy',
            },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">{card.icon}<span className="text-xs text-gray-500 font-medium">{card.label}</span></div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Activation funnel — last 30 days cohort */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-gray-900">Activation Funnel</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Last 30 days</span>
          </div>
          <p className="text-xs text-gray-400 mb-5">Where users from the last 30 days drop off between signup and getting value.</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Signed up', count: recentTotal, pct: '100%' },
              { label: 'Created project', count: recentWithProject, pct: pct(recentWithProject, recentTotal) },
              { label: 'Active form', count: recentWithActiveForm, pct: pct(recentWithActiveForm, recentTotal) },
              { label: 'Got testimonial', count: recentWithTestimonial, pct: pct(recentWithTestimonial, recentTotal) },
              { label: 'Widget set up', count: recentWithWidget, pct: pct(recentWithWidget, recentTotal) },
            ].map((step, i) => (
              <div key={step.label} className="relative">
                {i > 0 && (
                  <div className="hidden sm:block absolute -left-1.5 top-5 text-gray-300 text-lg">›</div>
                )}
                <div className="bg-gray-50 rounded-xl px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{step.count}</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">{step.pct}</p>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">{step.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature adoption */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Feature Adoption (paid users)</h2>
          <p className="text-xs text-gray-400 mb-5">Which Pro features are actually being used. Low adoption = the feature needs better in-app marketing.</p>
          <div className="space-y-3">
            {[
              { label: 'Google Review URL configured', count: googleSet },
              { label: 'LinkedIn URL configured', count: linkedinSet },
              { label: 'Custom public page address set', count: slugSet },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.count} / {paidProjects.length} ({pct(item.count, paidCount_)})
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: pct(item.count, paidCount_) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column: Recent signups + High-intent free users */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent signups */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Recent Signups</h2>
            <p className="text-xs text-gray-400 mb-4">Last 15 registered users.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400">
                    <th className="text-left py-2 pr-3 font-medium">Email</th>
                    <th className="text-center py-2 px-2 font-medium">Plan</th>
                    <th className="text-center py-2 px-2 font-medium">Signed up</th>
                    <th className="text-center py-2 font-medium">Tests</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSignups.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-3 font-mono text-[11px] text-gray-700 max-w-[160px] truncate">{u.email}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${PLAN_COLORS[u.plan] ?? PLAN_COLORS.free}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-gray-500">
                        {format(new Date(u.created_at), 'MMM d')}
                      </td>
                      <td className="py-2 text-center font-semibold text-gray-700">{u.tCount}</td>
                    </tr>
                  ))}
                  {recentSignups.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-gray-400">No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* High-intent free users */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">High-Intent Free Users</h2>
            <p className="text-xs text-gray-400 mb-4">
              Free users with 5+ testimonials or 5000+ widget views in the last 30 days. Most likely to convert with a nudge or personalised outreach.
            </p>
            {highIntent.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">None yet. Check back once you have active users.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400">
                      <th className="text-left py-2 pr-3 font-medium">Email</th>
                      <th className="text-center py-2 px-2 font-medium">Tests</th>
                      <th className="text-center py-2 font-medium">Views (30d)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highIntent.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 pr-3 font-mono text-[11px] text-gray-700 max-w-[180px] truncate">{u.email}</td>
                        <td className="py-2 px-2 text-center font-semibold text-gray-700">{u.tCount}</td>
                        <td className="py-2 text-center">
                          {u.widgetViews30d >= 5000 ? (
                            <span className="text-sm font-bold text-sky-600">{u.widgetViews30d.toLocaleString()}</span>
                          ) : (
                            <span className="text-sm text-gray-400">{u.widgetViews30d.toLocaleString()}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pro subscribers */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Pro Subscribers ({proList.length})</h2>
          <p className="text-xs text-gray-400 mb-4">
            All active Pro users. Watch for low testimonial counts near renewal — those users might churn.
          </p>
          {proList.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No Pro subscribers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400">
                    <th className="text-left py-2 pr-3 font-medium">Email</th>
                    <th className="text-center py-2 px-2 font-medium">Status</th>
                    <th className="text-center py-2 px-2 font-medium">Renews</th>
                    <th className="text-center py-2 px-2 font-medium">Tests</th>
                    <th className="text-center py-2 font-medium">Last login</th>
                  </tr>
                </thead>
                <tbody>
                  {proList.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-3 font-mono text-[11px] text-gray-700 max-w-[180px] truncate">{u.email}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          u.status === 'past_due' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-gray-500">
                        {u.current_period_end ? format(new Date(u.current_period_end), 'MMM d, yy') : '—'}
                      </td>
                      <td className="py-2 px-2 text-center font-semibold text-gray-700">{u.tCount}</td>
                      <td className="py-2 text-center text-gray-500">
                        {u.last_sign_in_at ? format(new Date(u.last_sign_in_at), 'MMM d') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User lookup (interactive client component) */}
        <AdminClient />

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 pb-4">
          Admin only · {totalUsers} registered users · {paidCount} paid
        </p>
      </div>
    </div>
  );
}

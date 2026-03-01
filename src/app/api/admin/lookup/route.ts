import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !user || user.email !== adminEmail) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const caller = await verifyAdmin();
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: 'email param required' }, { status: 400 });

  const admin = createAdminClient();

  // Fetch all auth users and find by email
  const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });

  const authUser = listData.users.find((u) => u.email?.toLowerCase() === email);
  if (!authUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const userId = authUser.id;

  const [subRes, formRes, testimonialRes, widgetRes, projectRes] = await Promise.all([
    admin.from('subscriptions').select('plan, status, current_period_end, stripe_subscription_id, is_banned').eq('user_id', userId).single(),
    admin.from('collection_forms').select('id').eq('user_id', userId),
    admin.from('testimonials').select('id, status').eq('user_id', userId),
    admin.from('widgets').select('id').eq('user_id', userId),
    admin.from('projects').select('name, slug, google_review_url, linkedin_url').eq('user_id', userId).limit(1).single(),
  ]);

  const widgetIds = (widgetRes.data ?? []).map((w) => w.id);
  let widgetViews = 0;
  if (widgetIds.length > 0) {
    const { count } = await admin
      .from('widget_views')
      .select('id', { count: 'exact', head: true })
      .in('widget_id', widgetIds);
    widgetViews = count ?? 0;
  }

  return NextResponse.json({
    id: authUser.id,
    email: authUser.email,
    created_at: authUser.created_at,
    last_sign_in_at: authUser.last_sign_in_at,
    plan: subRes.data?.plan ?? 'free',
    status: subRes.data?.status ?? 'active',
    is_banned: subRes.data?.is_banned ?? false,
    current_period_end: subRes.data?.current_period_end ?? null,
    stripe_subscription_id: subRes.data?.stripe_subscription_id ?? null,
    project: projectRes.data ?? null,
    formCount: formRes.data?.length ?? 0,
    testimonialCount: testimonialRes.data?.length ?? 0,
    approvedCount: (testimonialRes.data ?? []).filter((t) => t.status === 'approved').length,
    widgetCount: widgetRes.data?.length ?? 0,
    widgetViews,
  });
}

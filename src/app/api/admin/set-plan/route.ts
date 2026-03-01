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

export async function POST(req: NextRequest) {
  const caller = await verifyAdmin();
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { userId, plan } = body as { userId: string; plan: string };

  if (!userId || !['free', 'pro', 'agency'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('subscriptions')
    .update({
      plan,
      status: plan === 'free' ? 'inactive' : 'active',
    })
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

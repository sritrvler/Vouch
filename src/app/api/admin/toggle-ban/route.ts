import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const caller = await verifyAdmin(req);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { userId, banned } = body as { userId: string; banned: boolean };

  if (!userId || typeof banned !== 'boolean') {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('subscriptions')
    .update({ is_banned: banned })
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: 'Failed to update ban status' }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('X-Signature') ?? '';

  // Verify Lemon Squeezy webhook signature
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName: string = payload.meta?.event_name ?? '';
  const userId: string = payload.meta?.custom_data?.user_id ?? '';
  const attributes = payload.data?.attributes ?? {};
  const subscriptionId: string = String(payload.data?.id ?? '');

  if (!userId) {
    return NextResponse.json({ received: true });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const lsStatus: string = attributes.status ?? '';
      let dbStatus: 'active' | 'inactive' | 'past_due' | 'cancelled' = 'inactive';
      if (lsStatus === 'active') dbStatus = 'active';
      else if (lsStatus === 'past_due') dbStatus = 'past_due';
      else if (lsStatus === 'cancelled' || attributes.cancelled) dbStatus = 'cancelled';

      const isPro = dbStatus === 'active' || dbStatus === 'past_due';

      await supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: String(attributes.customer_id ?? ''),
          plan: isPro ? 'pro' : 'free',
          status: dbStatus,
          current_period_end: attributes.renews_at ?? null,
        })
        .eq('user_id', userId);
    }

    if (eventName === 'subscription_expired' || eventName === 'subscription_cancelled') {
      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: eventName === 'subscription_expired' ? 'inactive' : 'cancelled',
        })
        .eq('user_id', userId);
    }
  } catch (err) {
    console.error(`Error handling LS event ${eventName}:`, err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

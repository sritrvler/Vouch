import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Disable body parsing — Stripe needs the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        if (!userId) break;

        // Fetch the subscription from Stripe for full details
        if (typeof session.subscription === 'string') {
          const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
          const subData = stripeSub as unknown as { current_period_end: number };

          await supabase
            .from('subscriptions')
            .update({
              plan: 'pro',
              status: 'active',
              stripe_subscription_id: stripeSub.id,
              stripe_customer_id: typeof session.customer === 'string' ? session.customer : undefined,
              current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
            })
            .eq('user_id', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;

        const subData = sub as unknown as { current_period_end: number };

        const isActive = sub.status === 'active' || sub.status === 'trialing';
        const isPastDue = sub.status === 'past_due';

        let dbStatus: 'active' | 'inactive' | 'past_due' | 'cancelled' = 'inactive';
        if (isActive) dbStatus = 'active';
        else if (isPastDue) dbStatus = 'past_due';
        else if (sub.status === 'canceled') dbStatus = 'cancelled';

        await supabase
          .from('subscriptions')
          .update({
            plan: isActive ? 'pro' : 'free',
            status: dbStatus,
            stripe_subscription_id: sub.id,
            current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
          })
          .eq('user_id', userId);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;

        await supabase
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'cancelled',
            stripe_subscription_id: null,
          })
          .eq('user_id', userId);
        break;
      }

      default:
        // Ignore other event types
        break;
    }
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err);
    // Return 200 to acknowledge receipt — Stripe will retry if we return error
    return NextResponse.json({ received: true, warning: 'Handler error' });
  }

  return NextResponse.json({ received: true });
}

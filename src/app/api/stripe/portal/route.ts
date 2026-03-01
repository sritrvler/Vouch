import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // ── Authenticate ─────────────────────────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Get Stripe customer ID ────────────────────────────────────────────────
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, plan')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (!subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please upgrade to Pro first.' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // ── Create billing portal session ─────────────────────────────────────────
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

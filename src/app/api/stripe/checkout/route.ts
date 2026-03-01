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

    // ── Get or create Stripe customer ─────────────────────────────────────────
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, plan')
      .eq('user_id', user.id)
      .single();

    if (subscription?.plan === 'pro') {
      return NextResponse.json(
        { error: 'You are already on the Pro plan' },
        { status: 400 }
      );
    }

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      // Persist the customer ID
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // ── Create checkout session ───────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard/settings?upgrade=success`,
      cancel_url: `${siteUrl}/dashboard/settings?upgrade=cancelled`,
      metadata: { user_id: user.id },
      subscription_data: {
        metadata: { user_id: user.id },
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

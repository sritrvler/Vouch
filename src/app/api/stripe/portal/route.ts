import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCustomerPortalUrl } from '@/lib/lemonsqueezy';

const PORTAL_URL_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isValidPortalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('.lemonsqueezy.com');
  } catch {
    return false;
  }
}

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, customer_portal_url, customer_portal_url_fetched_at')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Use cached URL if it exists, is valid, and is less than 7 days old
    const fetchedAt = subscription.customer_portal_url_fetched_at
      ? new Date(subscription.customer_portal_url_fetched_at).getTime()
      : 0;
    const isFresh = subscription.customer_portal_url
      && isValidPortalUrl(subscription.customer_portal_url)
      && (Date.now() - fetchedAt < PORTAL_URL_TTL_MS);

    if (isFresh) {
      return NextResponse.json({ url: subscription.customer_portal_url });
    }

    // Fallback: fetch from Lemon Squeezy API
    const url = await getCustomerPortalUrl(subscription.stripe_subscription_id);

    if (!url) {
      return NextResponse.json({ error: 'Failed to get portal URL' }, { status: 500 });
    }

    // Self-healing: cache the result back to DB (RLS allows user to update own row)
    const { error: cacheError } = await supabase
      .from('subscriptions')
      .update({
        customer_portal_url: url,
        customer_portal_url_fetched_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (cacheError) {
      console.warn('Failed to cache portal URL:', cacheError.message);
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error('Portal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

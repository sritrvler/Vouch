import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCustomerPortalUrl } from '@/lib/lemonsqueezy';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const url = await getCustomerPortalUrl(subscription.stripe_subscription_id);

    if (!url) {
      return NextResponse.json({ error: 'Failed to get portal URL' }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error('Portal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

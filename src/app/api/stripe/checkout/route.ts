import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCheckoutUrl } from '@/lib/lemonsqueezy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const billing: 'monthly' | 'yearly' = body.billing === 'yearly' ? 'yearly' : 'monthly';

    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    if (subscription?.plan === 'pro') {
      return NextResponse.json({ error: 'Already on Pro plan' }, { status: 400 });
    }

    const url = await createCheckoutUrl(user.email!, user.id, billing);

    if (!url) {
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

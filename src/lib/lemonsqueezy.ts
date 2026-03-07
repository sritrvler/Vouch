const LS_API_URL = 'https://api.lemonsqueezy.com/v1';

export function lsHeaders() {
  return {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
  };
}

export async function createCheckoutUrl(
  userEmail: string,
  userId: string,
  billing: 'monthly' | 'yearly' = 'monthly',
  plan: 'pro' | 'studio' = 'pro'
): Promise<string | null> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let variantId: string;
  if (plan === 'studio') {
    variantId = billing === 'yearly'
      ? String(process.env.LEMONSQUEEZY_STUDIO_YEARLY_VARIANT_ID)
      : String(process.env.LEMONSQUEEZY_STUDIO_VARIANT_ID);
  } else {
    variantId = billing === 'yearly'
      ? String(process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID)
      : String(process.env.LEMONSQUEEZY_VARIANT_ID);
  }

  const res = await fetch(`${LS_API_URL}/checkouts`, {
    method: 'POST',
    headers: lsHeaders(),
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { user_id: userId },
          },
          product_options: {
            redirect_url: `${siteUrl}/dashboard/settings?upgrade=success`,
          },
        },
        relationships: {
          store: {
            data: { type: 'stores', id: String(process.env.LEMONSQUEEZY_STORE_ID) },
          },
          variant: {
            data: { type: 'variants', id: variantId },
          },
        },
      },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('Lemon Squeezy checkout error:', JSON.stringify(json, null, 2), { variantId, plan, billing });
    throw new Error(`LS API ${res.status}: ${JSON.stringify(json?.errors ?? json)}`);
  }
  return json?.data?.attributes?.url ?? null;
}

export async function getCustomerPortalUrl(subscriptionId: string): Promise<string | null> {
  const res = await fetch(`${LS_API_URL}/subscriptions/${subscriptionId}`, {
    headers: lsHeaders(),
  });
  const json = await res.json();
  return json?.data?.attributes?.urls?.customer_portal ?? null;
}

export const PLANS = {
  free: {
    name: 'Free',
    testimonialLimit: Infinity,
    widgetLimit: 1,
    formLimit: 1,
    projectLimit: 1,
    googleReviewNudge: false,
    shareableCards: false,
    removeBranding: false,
    customSlug: false,
  },
  pro: {
    name: 'Pro',
    testimonialLimit: Infinity,
    widgetLimit: Infinity,
    formLimit: Infinity,
    projectLimit: Infinity,
    googleReviewNudge: true,
    shareableCards: true,
    removeBranding: true,
    customSlug: true,
  },
  studio: {
    name: 'Studio',
    testimonialLimit: Infinity,
    widgetLimit: Infinity,
    formLimit: Infinity,
    projectLimit: Infinity,
    googleReviewNudge: true,
    shareableCards: true,
    removeBranding: true,
    customSlug: true,
    clientReports: true,
    whiteLabelReports: true,
    embedCodesInReports: true,
    reportIntroMessage: true,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const PRO_FEATURES = [
  'Unlimited forms and embed widgets',
  'Unlimited video testimonials',
  'Google Review and LinkedIn nudges',
  'Image cards for social sharing',
  'Carousel, wall of love, and list layouts',
  'React component embed',
  'CSV export of testimonials',
  'Form cloning',
  'Custom public page address',
  'Remove Vouch branding',
];

export const STUDIO_FEATURES = [
  'Everything in Pro',
  'White-label client reports',
  'Embed codes in client reports',
  'Custom report intro message',
  'Email support (1 business day)',
];

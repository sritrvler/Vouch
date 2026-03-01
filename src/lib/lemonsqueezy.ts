const LS_API_URL = 'https://api.lemonsqueezy.com/v1';

export function lsHeaders() {
  return {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
  };
}

export async function createCheckoutUrl(userEmail: string, userId: string): Promise<string | null> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
            data: { type: 'variants', id: String(process.env.LEMONSQUEEZY_VARIANT_ID) },
          },
        },
      },
    }),
  });

  const json = await res.json();
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
    projectLimit: 5,
    googleReviewNudge: true,
    shareableCards: true,
    removeBranding: true,
    customSlug: true,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

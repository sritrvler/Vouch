import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

export const PLANS = {
  free: {
    name: 'Free',
    testimonialLimit: Infinity,   // unlimited — gate on features, not volume
    widgetLimit: 1,
    formLimit: 1,
    projectLimit: 1,
    aiEnhancement: false,
    googleReviewNudge: false,     // core upgrade driver
    shareableCards: false,
    analytics: false,
    removeBranding: false,
    customSlug: false,
  },
  pro: {
    name: 'Pro',
    testimonialLimit: Infinity,
    widgetLimit: Infinity,
    formLimit: Infinity,
    projectLimit: 5,
    aiEnhancement: true,
    googleReviewNudge: true,      // boost Google rating
    shareableCards: true,         // download/share for WhatsApp, Instagram
    analytics: true,
    removeBranding: true,
    customSlug: true,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

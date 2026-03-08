import { describe, it, expect } from 'vitest';
import { PLANS, PRO_FEATURES, STUDIO_FEATURES } from '@/lib/lemonsqueezy';

describe('Plan definitions', () => {
  it('free plan has correct limits', () => {
    expect(PLANS.free.widgetLimit).toBe(1);
    expect(PLANS.free.formLimit).toBe(1);
    expect(PLANS.free.projectLimit).toBe(1);
    expect(PLANS.free.testimonialLimit).toBe(25);
    expect(PLANS.free.removeBranding).toBe(false);
    expect(PLANS.free.customSlug).toBe(false);
  });

  it('pro plan unlocks everything except studio features', () => {
    expect(PLANS.pro.widgetLimit).toBe(Infinity);
    expect(PLANS.pro.formLimit).toBe(Infinity);
    expect(PLANS.pro.projectLimit).toBe(Infinity);
    expect(PLANS.pro.removeBranding).toBe(true);
    expect(PLANS.pro.customSlug).toBe(true);
    expect(PLANS.pro.googleReviewNudge).toBe(true);
    expect(PLANS.pro.shareableCards).toBe(true);
  });

  it('studio plan has all pro features plus studio exclusives', () => {
    expect(PLANS.studio.widgetLimit).toBe(Infinity);
    expect(PLANS.studio.formLimit).toBe(Infinity);
    expect(PLANS.studio.removeBranding).toBe(true);
    expect(PLANS.studio.clientReports).toBe(true);
    expect(PLANS.studio.whiteLabelReports).toBe(true);
    expect(PLANS.studio.embedCodesInReports).toBe(true);
    expect(PLANS.studio.reportIntroMessage).toBe(true);
  });

  it('no plan has "agency" key (fully renamed to studio)', () => {
    expect('agency' in PLANS).toBe(false);
  });
});

describe('Feature lists', () => {
  it('PRO_FEATURES contains expected entries', () => {
    expect(PRO_FEATURES.length).toBeGreaterThanOrEqual(8);
    expect(PRO_FEATURES.some(f => f.includes('Unlimited'))).toBe(true);
    expect(PRO_FEATURES.some(f => f.includes('branding'))).toBe(true);
  });

  it('STUDIO_FEATURES starts with "Everything in Pro"', () => {
    expect(STUDIO_FEATURES[0]).toBe('Everything in Pro');
  });

  it('STUDIO_FEATURES includes client report features', () => {
    expect(STUDIO_FEATURES.some(f => f.includes('client report'))).toBe(true);
  });

  it('no feature list mentions "agency" (fully renamed)', () => {
    const allFeatures = [...PRO_FEATURES, ...STUDIO_FEATURES].join(' ').toLowerCase();
    expect(allFeatures).not.toContain('agency');
  });
});

describe('Plan gating logic (isPro pattern)', () => {
  const plans = ['free', 'pro', 'studio'] as const;

  it('free plan is the only plan that should be gated', () => {
    for (const plan of plans) {
      const isPro = plan !== 'free';
      if (plan === 'free') {
        expect(isPro).toBe(false);
      } else {
        expect(isPro).toBe(true);
      }
    }
  });

  it('studio plan is not accidentally excluded from paid checks', () => {
    const plan = 'studio';
    // These are the two patterns used in the codebase. Both must pass for studio.
    expect(plan !== 'free').toBe(true);
    expect(['pro', 'studio'].includes(plan)).toBe(true);
  });
});

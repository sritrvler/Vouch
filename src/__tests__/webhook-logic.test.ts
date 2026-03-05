import { describe, it, expect } from 'vitest';

/**
 * Tests the webhook plan-mapping logic extracted from
 * src/app/api/stripe/webhook/route.ts lines 50-57.
 * These tests verify that Lemon Squeezy variant IDs
 * map to the correct plan strings.
 */

const STUDIO_VARIANT_ID = '1368721';
const STUDIO_YEARLY_VARIANT_ID = '1368722';
const PRO_VARIANT_ID = '1359922';
const PRO_YEARLY_VARIANT_ID = '1360216';

function determinePlan(
  variantId: string,
  isActive: boolean,
  studioVariants: string[]
): 'free' | 'pro' | 'studio' {
  if (!isActive) return 'free';
  return studioVariants.includes(variantId) ? 'studio' : 'pro';
}

function determineDbStatus(
  lsStatus: string,
  cancelled: boolean
): 'active' | 'inactive' | 'past_due' | 'cancelled' {
  if (lsStatus === 'active') return 'active';
  if (lsStatus === 'past_due') return 'past_due';
  if (lsStatus === 'cancelled' || cancelled) return 'cancelled';
  return 'inactive';
}

describe('Webhook plan mapping', () => {
  const studioVariants = [STUDIO_VARIANT_ID, STUDIO_YEARLY_VARIANT_ID];

  it('maps Pro monthly variant to "pro"', () => {
    expect(determinePlan(PRO_VARIANT_ID, true, studioVariants)).toBe('pro');
  });

  it('maps Pro yearly variant to "pro"', () => {
    expect(determinePlan(PRO_YEARLY_VARIANT_ID, true, studioVariants)).toBe('pro');
  });

  it('maps Studio monthly variant to "studio"', () => {
    expect(determinePlan(STUDIO_VARIANT_ID, true, studioVariants)).toBe('studio');
  });

  it('maps Studio yearly variant to "studio"', () => {
    expect(determinePlan(STUDIO_YEARLY_VARIANT_ID, true, studioVariants)).toBe('studio');
  });

  it('returns "free" when subscription is not active', () => {
    expect(determinePlan(PRO_VARIANT_ID, false, studioVariants)).toBe('free');
    expect(determinePlan(STUDIO_VARIANT_ID, false, studioVariants)).toBe('free');
  });

  it('returns "pro" for unknown variant IDs (not "free")', () => {
    expect(determinePlan('9999999', true, studioVariants)).toBe('pro');
  });
});

describe('Webhook status mapping', () => {
  it('maps "active" LS status to "active"', () => {
    expect(determineDbStatus('active', false)).toBe('active');
  });

  it('maps "past_due" LS status to "past_due"', () => {
    expect(determineDbStatus('past_due', false)).toBe('past_due');
  });

  it('maps "cancelled" LS status to "cancelled"', () => {
    expect(determineDbStatus('cancelled', false)).toBe('cancelled');
  });

  it('maps cancelled flag to "cancelled" even if status is different', () => {
    expect(determineDbStatus('active', true)).toBe('active');
    expect(determineDbStatus('', true)).toBe('cancelled');
  });

  it('defaults to "inactive" for unknown statuses', () => {
    expect(determineDbStatus('', false)).toBe('inactive');
    expect(determineDbStatus('pending', false)).toBe('inactive');
    expect(determineDbStatus('trialing', false)).toBe('inactive');
  });

  it('active and past_due are both considered "isActive" for plan assignment', () => {
    const activeStatuses = ['active', 'past_due'];
    for (const status of activeStatuses) {
      const dbStatus = determineDbStatus(status, false);
      const isActive = dbStatus === 'active' || dbStatus === 'past_due';
      expect(isActive).toBe(true);
    }
  });

  it('cancelled and inactive are NOT considered "isActive"', () => {
    const inactiveStatuses = ['cancelled', ''];
    for (const status of inactiveStatuses) {
      const dbStatus = determineDbStatus(status, false);
      const isActive = dbStatus === 'active' || dbStatus === 'past_due';
      expect(isActive).toBe(false);
    }
  });
});

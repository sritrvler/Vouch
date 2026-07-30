import posthog from 'posthog-js';

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * Capture a named product event without sending anything from server-rendered code.
 * PostHog's autocapture still records the underlying click; these events are the
 * stable, human-readable events to use in funnels and portfolio dashboards.
 */
export function capture(event: string, properties?: AnalyticsProperties) {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

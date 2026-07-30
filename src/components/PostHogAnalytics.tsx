'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

export default function PostHogAnalytics() {
  const pathname = usePathname();
  const initialized = useRef(false);
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!POSTHOG_KEY || initialized.current) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      capture_exceptions: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-ph-mask]',
      },
    });

    initialized.current = true;
  }, []);

  useEffect(() => {
    if (!initialized.current || !pathname || lastTrackedPath.current === pathname) return;

    lastTrackedPath.current = pathname;
    posthog.capture('$pageview', { path: pathname });
  }, [pathname]);

  return null;
}

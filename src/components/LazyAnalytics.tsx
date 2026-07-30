'use client';

import dynamic from 'next/dynamic';
import PostHogAnalytics from '@/components/PostHogAnalytics';

const Analytics = dynamic(
  () => import('@vercel/analytics/next').then(mod => ({ default: mod.Analytics })),
  { ssr: false }
);

export default function LazyAnalytics() {
  return (
    <>
      <Analytics />
      <PostHogAnalytics />
    </>
  );
}

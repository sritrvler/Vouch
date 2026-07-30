'use client';

import Link, { type LinkProps } from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';
import { capture, type AnalyticsProperties } from '@/lib/analytics';

interface TrackedLinkProps extends LinkProps {
  children: ReactNode;
  event: string;
  properties?: AnalyticsProperties;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function TrackedLink({ event, properties, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(eventObject) => {
        capture(event, properties);
        onClick?.(eventObject);
      }}
    />
  );
}

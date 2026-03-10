"use client";

import { useEffect, useRef } from "react";

export default function VouchWidget({ widgetId }: { widgetId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If embed.js already loaded on this page, MutationObserver handles init.
    // Otherwise, load the script.
    if (!document.querySelector('script[src$="/embed.js"]')) {
      const s = document.createElement("script");
      s.src = "/embed.js";
      s.async = true;
      ref.current?.parentElement?.appendChild(s);
    }
  }, []);

  return <div ref={ref} data-vouch={widgetId} />;
}

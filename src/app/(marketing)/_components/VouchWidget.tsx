"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    __vouchInit?: () => void;
  }
}

export default function VouchWidget({ widgetId }: { widgetId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If embed.js already loaded (e.g. another widget on the page), just re-init
    if (window.__vouchInit) {
      window.__vouchInit();
      return;
    }

    const s = document.createElement("script");
    s.src = "/embed.js";
    s.async = true;
    // After script loads, force init in case IntersectionObserver didn't fire
    s.onload = () => {
      if (window.__vouchInit) window.__vouchInit();
    };
    el.parentElement?.appendChild(s);

    return () => {
      s.remove();
    };
  }, []);

  return <div ref={ref} data-vouch={widgetId} style={{ minHeight: 100 }} />;
}

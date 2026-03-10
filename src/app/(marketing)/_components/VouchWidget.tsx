"use client";

import { useEffect, useRef } from "react";

export default function VouchWidget({ widgetId }: { widgetId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const s = document.createElement("script");
    s.src = "/embed.js";
    s.async = true;
    el.parentElement?.appendChild(s);

    return () => {
      s.remove();
    };
  }, []);

  return <div ref={ref} data-vouch={widgetId} />;
}

"use client";

import { useState } from "react";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmbedVisual() {
  const [activeTab, setActiveTab] = useState<"script" | "react">("script");

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  const scriptCode = `<div id="vouch-widget"\n  data-widget-id="abc123">\n</div>\n<script src="${siteUrl}/widget.js"\n  async>\n</script>`;

  const reactCode = `// No install. Paste into your project.\n'use client';\nimport { useEffect, useState } from 'react';\n\nexport function Testimonials() {\n  const [items, setItems] = useState([]);\n  useEffect(() => {\n    fetch('/api/testimonials/widget/abc123')\n      .then(r => r.json())\n      .then(d => setItems(d.testimonials));\n  }, []);\n\n  return (\n    <div className="grid grid-cols-3 gap-4">\n      {items.map(t => (\n        <blockquote key={t.id}\n          className="rounded-xl border p-4">\n          {t.content}\n        </blockquote>\n      ))}\n    </div>\n  );\n}`;

  return (
    <div className="relative max-w-sm mx-auto lg:mx-0 space-y-3">
      {/* Browser mockup */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Browser chrome */}
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-gray-400 border border-gray-100 truncate">
            alexchen.design/about
          </div>
        </div>

        {/* Page preview */}
        <div className="p-5">
          <div className="h-2 w-20 bg-gray-100 rounded-full mb-1.5" />
          <div className="h-2 w-32 bg-gray-100 rounded-full mb-5" />

          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            What clients say
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              {
                avatar: "AL",
                bg: "bg-indigo-500",
                text: "The rebrand changed how prospects see us...",
                name: "Alex L.",
                role: "Freelance Dev",
              },
              {
                avatar: "JK",
                bg: "bg-violet-500",
                text: "Zero back-and-forth, delivered early...",
                name: "Jana K.",
                role: "Framer Designer",
              },
            ].map((c) => (
              <div
                key={c.name}
                className="bg-gray-50 rounded-xl p-3 border border-gray-100"
              >
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-2 h-2 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed mb-2">
                  {c.text}
                </p>
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold",
                      c.bg
                    )}
                  >
                    {c.avatar}
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-gray-800">
                      {c.name}
                    </p>
                    <p className="text-[9px] text-gray-400">{c.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code snippet with tabs */}
      <div className="bg-slate-900 rounded-xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-700">
          {([
            { id: "script" as const, label: "Script tag" },
            { id: "react" as const, label: "React component" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-[11px] font-medium transition-colors",
                activeTab === tab.id
                  ? "text-white border-b-2 border-indigo-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-4 py-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-500 font-mono">
              {activeTab === "script" ? "paste before </body>" : "paste anywhere in your app"}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <Check className="w-3 h-3" /> Copied to clipboard
            </div>
          </div>
          <code className="text-xs text-indigo-300 font-mono leading-relaxed whitespace-pre-wrap">
            {activeTab === "script" ? scriptCode : reactCode}
          </code>
        </div>
      </div>
    </div>
  );
}

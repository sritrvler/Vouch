"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function HeroVisual() {
  const steps = [
    { label: "Create your form", sub: "Brand colors applied automatically", time: "2 min" },
    { label: "Share with clients", sub: "Email, DM, or project handoff", time: "30 sec" },
    { label: "Approve and embed", sub: "One script tag, any platform", time: "2 min" },
  ];

  return (
    <div className="relative w-full max-w-[420px] mx-auto lg:mx-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Getting started
            </p>
            <p className="text-base font-bold text-gray-900">Live in 15 minutes</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            Free to start
          </span>
        </div>

        {/* Steps */}
        <div className="px-6 py-2">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.4 + i * 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3.5 py-3.5 border-b border-gray-50 last:border-0"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.55 + i * 0.18, type: "spring", stiffness: 350, damping: 20 }}
                className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0"
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{step.sub}</p>
              </div>
              <span className="text-[11px] text-gray-500 font-mono shrink-0">{step.time}</span>
            </motion.div>
          ))}
        </div>

        {/* Live bar */}
        <motion.div
          initial={{ y: 6 }}
          animate={{ y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mx-5 mb-5 rounded-xl bg-indigo-600 px-4 py-3 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-white">Widget live on your site</p>
            <p className="text-[11px] text-indigo-300 mt-0.5">Embed anywhere in one line</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            />
            <span className="text-[11px] font-medium text-white">Live</span>
          </div>
        </motion.div>
      </div>

      {/* Benefit pills */}
      <motion.div
        initial={{ y: 8 }}
        animate={{ y: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="mt-3.5 flex flex-wrap gap-2"
      >
        {[
          "Looks native to any design",
          "Zero Lighthouse impact",
          "No login needed to submit",
        ].map((b) => (
          <span
            key={b}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm"
          >
            <Check className="w-3 h-3 text-indigo-500 shrink-0" />
            {b}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

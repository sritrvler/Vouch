"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Zap, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCards } from "../_components/PricingCards";

/* ─────────────────────────────────────────────────
   Feature comparison table data
───────────────────────────────────────────────── */
type FeatureRow =
  | { type: "category"; label: string }
  | { type: "feature"; label: string; free: string | boolean; pro: string | boolean; studio: string | boolean };

const TABLE_ROWS: FeatureRow[] = [
  { type: "category", label: "Collecting Testimonials" },
  { type: "feature", label: "Testimonials collected", free: "25", pro: "Unlimited", studio: "Unlimited" },
  { type: "feature", label: "Testimonials shown in widget", free: "25", pro: "Unlimited", studio: "Unlimited" },
  { type: "feature", label: "Collection forms", free: "1", pro: "Unlimited", studio: "Unlimited" },
  { type: "feature", label: "Projects", free: "1", pro: "Unlimited", studio: "Unlimited" },
  { type: "feature", label: "Video testimonials", free: "3 per project", pro: "Unlimited", studio: "Unlimited" },
  { type: "feature", label: "Star ratings and written reviews", free: true, pro: true, studio: true },
  { type: "feature", label: "Custom questions on form", free: true, pro: true, studio: true },
  { type: "feature", label: "Approval and reject flow", free: true, pro: true, studio: true },
  { type: "feature", label: "Form cloning", free: false, pro: true, studio: true },
  { type: "feature", label: "CSV export of testimonials", free: false, pro: true, studio: true },

  { type: "category", label: "Review Nudges" },
  { type: "feature", label: "Google Review nudge after 4-5 stars", free: false, pro: true, studio: true },
  { type: "feature", label: "LinkedIn nudge after 4-5 stars", free: false, pro: true, studio: true },

  { type: "category", label: "Public Page" },
  { type: "feature", label: "Public testimonial page (/p/you)", free: true, pro: true, studio: true },
  { type: "feature", label: "Custom public page address", free: false, pro: true, studio: true },

  { type: "category", label: "Display and Embed" },
  { type: "feature", label: "Embed widgets", free: "1", pro: "Unlimited", studio: "Unlimited" },
  { type: "feature", label: "Grid layout", free: true, pro: true, studio: true },
  { type: "feature", label: "Carousel, Wall of Love, and List layouts", free: false, pro: true, studio: true },
  { type: "feature", label: "Image cards for social sharing", free: false, pro: true, studio: true },
  { type: "feature", label: "React component embed", free: false, pro: true, studio: true },
  { type: "feature", label: "Custom widget colors", free: true, pro: true, studio: true },
  { type: "feature", label: "Remove Vouch branding", free: false, pro: true, studio: true },

  { type: "category", label: "Studio Tools" },
  { type: "feature", label: "Client report links", free: false, pro: false, studio: true },
  { type: "feature", label: "White-label client reports", free: false, pro: false, studio: true },
  { type: "feature", label: "Embed codes in client reports", free: false, pro: false, studio: true },
  { type: "feature", label: "Custom report intro message", free: false, pro: false, studio: true },

  { type: "category", label: "Support" },
  { type: "feature", label: "Email support", free: true, pro: true, studio: "1 business day" },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center">
          <Check className="w-3 h-3 text-indigo-600" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <X className="w-4 h-4 text-gray-200" />
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span className="text-sm text-gray-600 font-medium">{value}</span>
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-4 pr-4 text-sm font-semibold text-gray-500 w-[45%]">
              Feature
            </th>
            <th className="text-center py-4 px-3 text-sm font-semibold text-gray-500 w-[18%]">
              Free
            </th>
            <th className="text-center py-4 px-3 text-sm font-semibold text-indigo-600 w-[18%]">
              Pro
            </th>
            <th className="text-center py-4 px-3 text-sm font-semibold text-slate-700 w-[19%]">
              Studio
            </th>
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row, i) => {
            if (row.type === "category") {
              return (
                <tr key={i} className="border-b border-gray-50">
                  <td
                    colSpan={4}
                    className="py-4 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-widest bg-gray-50/50 pl-1"
                  >
                    {row.label}
                  </td>
                </tr>
              );
            }
            return (
              <tr
                key={i}
                className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors"
              >
                <td className="py-3.5 pr-4 text-sm text-gray-700">{row.label}</td>
                <td className="py-3.5 px-3 text-center">
                  <FeatureValue value={row.free} />
                </td>
                <td className="py-3.5 px-3 text-center">
                  <FeatureValue value={row.pro} />
                </td>
                <td className="py-3.5 px-3 text-center">
                  <FeatureValue value={row.studio} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   FAQ (pricing-specific)
───────────────────────────────────────────────── */
const PRICING_FAQS = [
  {
    q: "Is the free plan actually free forever?",
    a: "Yes. No credit card needed, no expiry. The Free plan is our way of letting you prove to yourself that Vouch works before spending a penny.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your testimonials are yours. If you downgrade, your data stays and you keep access to everything within free plan limits.",
  },
  {
    q: "Do you offer discounts for non-profits or early-stage startups?",
    a: "Yes, reach out via email with proof of status and we will sort something out. We want Vouch to be accessible.",
  },
  {
    q: "Can I pay yearly and switch to monthly later?",
    a: "Yes. If you switch from yearly to monthly, we'll prorate the difference and apply it as credit to your account.",
  },
];

function PricingFAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="max-w-2xl mx-auto mt-14">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Pricing FAQ</h3>
      <div className="space-y-2">
        {PRICING_FAQS.map((faq, i) => (
          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {faq.q}
              <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </motion.div>
            </button>
            <motion.div
              initial={false}
              animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function VouchEmbed() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "/embed.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { s.remove(); };
  }, []);
  return null;
}

/* ─────────────────────────────────────────────────
   Page
───────────────────────────────────────────────── */
export default function PricingPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="py-16 sm:py-20 text-center px-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-5">
            <Zap className="w-3.5 h-3.5" />
            No contracts. Cancel anytime.
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <PricingCards />

      </section>

      {/* Social proof carousel */}
      <div className="below-fold">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Trusted by teams who care about design
          </h2>
          <div data-vouch="7b693bf1-613a-424b-96b3-bf0de049fe58"></div>
          <VouchEmbed />
        </section>
      </div>

      {/* Full comparison table */}
      <div className="below-fold">
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Full feature comparison
          </h2>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm px-6 py-2">
            <ComparisonTable />
          </div>
        </section>
      </div>

      {/* Pricing FAQ */}
      <div className="below-fold">
        <section className="max-w-3xl mx-auto px-4 sm:px-6">
          <PricingFAQ />
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="below-fold">
        <section className="max-w-2xl mx-auto px-4 text-center mt-16">
          <div className="bg-indigo-600 rounded-2xl px-8 py-12 text-white shadow-xl shadow-indigo-200">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Start collecting testimonials today
          </h2>
          <p className="text-indigo-100 mb-7">
            Free forever. Your first testimonial could arrive in the next hour.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl px-7 font-semibold"
            >
              <Link href="/signup">
                Start for free <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-white border border-indigo-400 hover:bg-indigo-700 rounded-xl px-7"
            >
              <Link href="/signup?plan=pro">Upgrade to Pro</Link>
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 mt-5">
            <p className="text-xs text-indigo-100">
              No credit card required to start
            </p>
            <p className="text-xs text-indigo-200 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Secure checkout via Lemon Squeezy
            </p>
          </div>
          </div>
        </section>
      </div>
    </div>
  );
}

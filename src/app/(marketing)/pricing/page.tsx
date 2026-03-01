"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCards } from "../page";

/* ─────────────────────────────────────────────────
   Feature comparison table data
───────────────────────────────────────────────── */
type FeatureRow =
  | { type: "category"; label: string }
  | { type: "feature"; label: string; free: string | boolean; pro: string | boolean };

const TABLE_ROWS: FeatureRow[] = [
  { type: "category", label: "Collecting Testimonials" },
  { type: "feature", label: "Testimonials collected", free: "Unlimited", pro: "Unlimited" },
  { type: "feature", label: "Collection forms", free: "1", pro: "Unlimited" },
  { type: "feature", label: "Projects", free: "1", pro: "5" },
  { type: "feature", label: "Text testimonials", free: true, pro: true },
  { type: "feature", label: "Star ratings", free: true, pro: true },
  { type: "feature", label: "Custom questions on form", free: true, pro: true },
  { type: "feature", label: "Approval / reject flow", free: true, pro: true },

  { type: "category", label: "Google Reviews" },
  { type: "feature", label: "Google Review nudge after 4-5 stars", free: false, pro: true },
  { type: "feature", label: "Custom Google Review link", free: false, pro: true },

  { type: "category", label: "Public Page" },
  { type: "feature", label: "Public testimonial page (vouch.so/p/you)", free: true, pro: true },
  { type: "feature", label: "Custom slug", free: false, pro: true },

  { type: "category", label: "Display & Embed" },
  { type: "feature", label: "Embed widgets", free: "1", pro: "Unlimited" },
  { type: "feature", label: "Grid layout", free: true, pro: true },
  { type: "feature", label: "Carousel, Wall of Love layouts", free: false, pro: true },
  { type: "feature", label: "Remove Vouch branding", free: false, pro: true },
  { type: "feature", label: "Custom widget colours", free: true, pro: true },

  { type: "category", label: "Support" },
  { type: "feature", label: "Email support", free: true, pro: true },
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
  return <span className="text-sm text-gray-600 font-medium">{value}</span>;
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-4 pr-4 text-sm font-semibold text-gray-500 w-1/2">
              Feature
            </th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500 w-1/4">
              Free
            </th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-indigo-600 w-1/4">
              Pro
            </th>
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row, i) => {
            if (row.type === "category") {
              return (
                <tr key={i} className="border-b border-gray-50">
                  <td
                    colSpan={3}
                    className="py-4 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-widest bg-gray-50/50 pl-1"
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
                <td className="py-3.5 px-4 text-center">
                  <FeatureValue value={row.free} />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <FeatureValue value={row.pro} />
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
    a: "Your testimonials are yours. If you downgrade, your data stays. If you close your account entirely, we give you a 30-day window to export everything.",
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

/* ─────────────────────────────────────────────────
   Page
───────────────────────────────────────────────── */
export default function PricingPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="py-16 sm:py-20 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <PricingCards />
        </motion.div>

      </section>

      {/* Full comparison table */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Full feature comparison
          </h2>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm px-6 py-2">
            <ComparisonTable />
          </div>
        </motion.div>
      </section>

      {/* Pricing FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <PricingFAQ />
      </section>

      {/* Bottom CTA */}
      <section className="max-w-2xl mx-auto px-4 text-center mt-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-indigo-600 rounded-2xl px-8 py-12 text-white shadow-xl shadow-indigo-200"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Start collecting testimonials today
          </h2>
          <p className="text-indigo-200 mb-7">
            Free forever. Your first testimonial could arrive in the next hour.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl px-7 font-semibold"
            >
              <Link href="/signup">
                Create free account <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-white border border-indigo-400 hover:bg-indigo-700 rounded-xl px-7"
            >
              <Link href="/signup?plan=pro">Start Pro trial</Link>
            </Button>
          </div>
          <p className="text-xs text-indigo-300 mt-5">
            Pro trial is 14 days free · No credit card required to start
          </p>
        </motion.div>
      </section>
    </div>
  );
}

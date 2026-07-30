"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { capture } from "@/lib/analytics";
import { PRO_FEATURES as PRO_FEATURES_SOURCE, STUDIO_FEATURES as STUDIO_FEATURES_SOURCE, PRICING } from "@/lib/lemonsqueezy";

export type FeatureItem = { text: string; limitation?: true };

export const FREE_FEATURES: FeatureItem[] = [
  { text: "25 testimonials displayed" },
  { text: "1 collection form" },
  { text: "1 embed widget" },
  { text: "Grid layout" },
  { text: "Custom questions on your form" },
  { text: "Public reviews page (/p/you)" },
  { text: "Custom widget colors" },
  { text: "Contains Vouch branding", limitation: true },
];

export const PRO_FEATURES: string[] = ["Everything in Free", ...PRO_FEATURES_SOURCE];

export const STUDIO_FEATURES = STUDIO_FEATURES_SOURCE;

export function PricingCards() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="max-w-5xl mx-auto">
      {/* Billing toggle */}
      <div className="flex justify-center mb-8">
        <div className="relative flex items-center bg-gray-100 rounded-full p-1" role="radiogroup" aria-label="Billing frequency">
          <button
            role="radio"
            aria-checked={billing === 'monthly'}
            onClick={() => {
              setBilling('monthly');
              capture('billing_frequency_selected', { billing: 'monthly', location: 'pricing_cards' });
            }}
            className={cn(
              'relative z-10 px-5 py-1.5 rounded-full text-sm font-medium transition-colors',
              billing === 'monthly'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            )}
          >
            {billing === 'monthly' && (
              <motion.div
                layoutId="billing-pill"
                className="absolute inset-0 bg-white rounded-full shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">Monthly</span>
          </button>
          <button
            role="radio"
            aria-checked={billing === 'yearly'}
            onClick={() => {
              setBilling('yearly');
              capture('billing_frequency_selected', { billing: 'yearly', location: 'pricing_cards' });
            }}
            className={cn(
              'relative z-10 px-5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2',
              billing === 'yearly'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            )}
          >
            {billing === 'yearly' && (
              <motion.div
                layoutId="billing-pill"
                className="absolute inset-0 bg-white rounded-full shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">Yearly</span>
            <span className="relative z-10 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {PRICING.yearlyBadgeText}
            </span>
          </button>
        </div>
      </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Free */}
      <div>
        <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-2xl h-full">
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-500 mb-1">Free</p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500 mb-1">/month</span>
            </div>
            <p className="text-sm text-gray-500">
              Forever free. No credit card needed.
            </p>
          </div>
          <ul className="space-y-3 flex-1 mb-7">
            {FREE_FEATURES.map((f) => (
              <li
                key={f.text}
                className="flex items-start gap-2.5 text-sm"
              >
                {f.limitation ? (
                  <Minus className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                ) : (
                  <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                )}
                <span className={f.limitation ? "text-gray-500" : "text-gray-600"}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-xl border-gray-200 text-gray-700 hover:border-gray-300"
          >
            <Link
              href="/signup"
              onClick={() => capture("plan_selected", { plan: "free", billing, location: "pricing_cards" })}
            >
              Start for free
            </Link>
          </Button>
        </div>
      </div>

      {/* Pro */}
      <div>
        <div className="relative flex flex-col p-6 bg-white border-2 border-indigo-500 rounded-2xl shadow-xl shadow-indigo-100 h-full">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <div className="px-4 py-1 bg-indigo-600 rounded-full text-white text-xs font-semibold shadow-md">
              Most Popular
            </div>
          </div>
          <div className="mb-6 mt-2">
            <p className="text-sm font-semibold text-indigo-600 mb-1">Pro</p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-4xl font-bold text-gray-900">
                {billing === 'yearly' ? `$${PRICING.pro.yearly}` : `$${PRICING.pro.monthly}`}
              </span>
              <span className="text-gray-500 mb-1">
                {billing === 'yearly' ? '/year' : '/month'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {billing === 'yearly' ? `$${PRICING.pro.monthlyEffective}/mo, billed annually.` : 'Billed monthly.'}
            </p>
          </div>
          <ul className="space-y-3 flex-1 mb-7">
            {PRO_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2.5 text-sm text-gray-700"
              >
                <Check className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
          >
            <Link
              href={`/signup?plan=pro${billing === 'yearly' ? '&billing=yearly' : ''}`}
              onClick={() => capture("plan_selected", { plan: "pro", billing, location: "pricing_cards" })}
            >
              Get started with Pro
            </Link>
          </Button>
          <p className="text-xs text-gray-500 mt-3">
            Cancel anytime.
          </p>
        </div>
      </div>

      {/* Studio */}
      <div>
        <div className="flex flex-col p-6 bg-slate-950 border border-slate-800 rounded-2xl h-full">
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-400 mb-1">Studio</p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-4xl font-bold text-white">
                {billing === 'yearly' ? `$${PRICING.studio.yearly}` : `$${PRICING.studio.monthly}`}
              </span>
              <span className="text-slate-400 mb-1">
                {billing === 'yearly' ? '/year' : '/month'}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {billing === 'yearly' ? `$${PRICING.studio.monthlyEffective}/mo, billed annually.` : 'For teams managing multiple client accounts.'}
            </p>
          </div>
          <ul className="space-y-3 flex-1 mb-7">
            {STUDIO_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2.5 text-sm text-slate-300"
              >
                <Check className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
          >
            <Link
              href={`/signup?plan=studio${billing === 'yearly' ? '&billing=yearly' : ''}`}
              onClick={() => capture("plan_selected", { plan: "studio", billing, location: "pricing_cards" })}
            >
              Get started with Studio
            </Link>
          </Button>
          <p className="text-xs text-slate-400 mt-3">
            Cancel anytime.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}

export default PricingCards;

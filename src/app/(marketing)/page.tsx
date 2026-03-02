"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Star, ArrowRight, Check, Minus, Zap, MessageSquare, Code2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   Animation helpers
───────────────────────────────────────────────────────── */

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Hero: staggered testimonial cards
───────────────────────────────────────────────────────── */

const HERO_CARDS = [
  {
    avatar: "AL",
    bg: "bg-indigo-500",
    name: "Alex L.",
    role: "Freelance Dev, Next.js",
    rating: 5,
    time: "3 days ago",
    text: "Dropped it into my portfolio in 15 minutes. My clients actually fill it in because the form doesn't look like a random survey tool.",
  },
  {
    avatar: "JK",
    bg: "bg-violet-500",
    name: "Jana K.",
    role: "Designer and SaaS Founder",
    rating: 5,
    time: "2 weeks ago",
    text: "Other tools clashed with my product's design. Vouch matched my accent color out of the box. Users say the testimonial section feels like part of the product.",
  },
  {
    avatar: "SC",
    bg: "bg-sky-500",
    name: "Sarah C.",
    role: "Webflow Agency, 30+ client sites",
    rating: 5,
    time: "1 month ago",
    text: "One account for every client site. Each form is branded to that client. They just see their own logo and colors. They fill it in without thinking twice.",
  },
];

function TestimonialCard({
  avatar,
  bg,
  name,
  role,
  rating,
  time,
  text,
}: (typeof HERO_CARDS)[number]) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-md p-4 w-full">
      {/* Author row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ring-2 ring-white shadow-sm",
              bg
            )}
          >
            {avatar}
          </div>
          <div>
            <p className="text-[12px] font-semibold text-gray-900">{name}</p>
            <p className="text-[10px] text-gray-400">{role}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
          <Check className="w-2.5 h-2.5" /> Verified
        </span>
      </div>

      {/* Stars + timestamp */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={cn(
                "w-3 h-3",
                s <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-100 text-gray-200"
              )}
            />
          ))}
        </div>
        <span className="text-[10px] text-gray-400">{time}</span>
      </div>

      {/* Quote */}
      <p className="text-[12px] text-gray-600 leading-relaxed">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative w-full max-w-[460px] hidden lg:block">
      {/* Soft gradient background panel */}
      <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/60" />
      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* 2-column staggered grid */}
      <div className="relative grid grid-cols-2 gap-4 py-6 px-2">

        {/* Left column */}
        <div className="flex flex-col gap-4">
          {HERO_CARDS.slice(0, 2).map((card, i) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 4.2 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 1.3 }}
              >
                <TestimonialCard {...card} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Right column, shifted down to create stagger */}
        <div className="flex flex-col gap-4 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            >
              <TestimonialCard {...HERO_CARDS[2]} />
            </motion.div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Hero section
───────────────────────────────────────────────────────── */

function HeroSection() {
  const avatarColors = [
    "bg-indigo-500",
    "bg-sky-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
  ];
  const avatarInitials = ["AL", "JK", "MT", "SR", "DM"];

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 right-0 w-[700px] h-[600px] bg-indigo-100 rounded-full blur-3xl opacity-40 translate-x-1/4" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-amber-50 rounded-full blur-3xl opacity-60 -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-5"
            >
              <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
              For Freelancers, Agencies, and SaaS Founders
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[2.6rem] sm:text-[3.2rem] lg:text-[3.6rem] font-black text-gray-900 leading-[1.07] tracking-tight mb-6"
            >
              Social proof that{" "}
              <span className="text-indigo-600">
                looks like you built it.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-9 max-w-lg"
            >
              Collect written and video testimonials, then embed them anywhere without slowing your
              site. Works for your portfolio, your clients&apos; sites, or your SaaS. One account, zero Lighthouse impact.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Button
                asChild
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-7 py-6 text-base font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
              >
                <Link href="/signup">
                  Start for free <ArrowRight className="ml-1.5 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-xl px-7 py-6 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200"
              >
                <a href="#how-it-works">See how it works</a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2.5">
                {avatarColors.map((bg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold",
                      bg
                    )}
                  >
                    {avatarInitials[i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Freelancers, agencies, and founders
                <br className="hidden sm:block" />
                shipping proof that matches their work
              </p>
            </motion.div>
          </div>

          {/* Staggered testimonial cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Trust bar
───────────────────────────────────────────────────────── */

const TRUST_LABELS = [
  "Framer",
  "Webflow",
  "WordPress",
  "Next.js",
  "Squarespace",
  "Wix",
  "Shopify",
  "Ghost",
  "Notion Sites",
  "Carrd",
];

function TrustBar() {
  return (
    <FadeIn>
      <div className="border-y border-gray-100 bg-gray-50/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Works on every platform. Looks native to every design.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
            {TRUST_LABELS.map((label) => (
              <div
                key={label}
                className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-medium text-gray-400 shadow-xs"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

/* ─────────────────────────────────────────────────────────
   Problem section
───────────────────────────────────────────────────────── */

const PAIN_POINTS = [
  {
    number: "01",
    title: "Your testimonial widget looks like it came from somewhere else",
    body: "You spend hours getting a site pixel-perfect, whether it is your own portfolio or a client's site. Then you paste a testimonial embed and it immediately screams third-party tool. Wrong fonts, wrong colors, wrong vibe. Your work deserves better than that.",
  },
  {
    number: "02",
    title: "Your testimonial widget tanks your Lighthouse score",
    body: "Third-party testimonial tools load heavy JavaScript, external fonts, and analytics trackers. Every point you lose on Lighthouse is lost conversion. Vouch renders testimonials as native HTML with no external requests and no cookie banners. Your Core Web Vitals stay clean.",
  },
  {
    number: "03",
    title: "The moment to ask passes fast. Most tools are not ready when it does.",
    body: "Right after a great delivery, a launch, or a five-star user interaction is when your clients and users are most willing to say something. Most tools make you set up a form, configure the embed, and fight the CMS before you can send a single link. Vouch is ready in 15 minutes and stays ready forever.",
  },
];

function ProblemSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              You ship polished sites.
              <br className="hidden sm:block" /> Your social proof should match.
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Three friction points that are making great work look generic.
            </p>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-10">
          {PAIN_POINTS.map((pt, i) => (
            <FadeUp key={pt.number} delay={i * 0.1}>
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 text-5xl font-black text-gray-100 leading-none select-none">
                  {pt.number}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 mt-1">
                  {pt.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{pt.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Feature visuals
───────────────────────────────────────────────────────── */

function CollectVisual() {
  return (
    <div className="relative max-w-sm mx-auto lg:mx-0">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Branded header */}
        <div className="bg-indigo-600 px-7 pt-7 pb-8">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <p className="text-indigo-300 text-xs font-medium mb-0.5">Acme Studio</p>
          <h3 className="text-lg font-bold text-white">
            How was your experience?
          </h3>
        </div>

        {/* Form body */}
        <div className="px-7 py-6">
          {/* Stars */}
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.div
                key={s}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.4 + s * 0.1,
                  type: "spring",
                  stiffness: 350,
                }}
              >
                <Star className="w-9 h-9 fill-amber-400 text-amber-400" />
              </motion.div>
            ))}
          </div>

          {/* Text area mockup */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 mb-4 min-h-[80px]">
            <p className="text-sm text-gray-400 mb-1 text-[11px]">
              Your experience
            </p>
            <p className="text-sm text-gray-700">
              Working with them transformed our onboarding flow completely.
              Drop-off went from 67% to
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                {" "}
                38%
              </motion.span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 1.8 }}
                className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 align-middle"
              />
            </p>
          </div>

          {/* Name/role fields */}
          <div className="flex gap-2 mb-5">
            <div className="flex-1 h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 flex items-center">
              <span className="text-[11px] text-gray-400">Your name</span>
            </div>
            <div className="flex-1 h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 flex items-center">
              <span className="text-[11px] text-gray-400">Role</span>
            </div>
          </div>

          <div className="w-full bg-indigo-600 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
            Submit testimonial <Check className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-200"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Takes 2 min
      </motion.div>
    </div>
  );
}

function EmbedVisual() {
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

/* ─────────────────────────────────────────────────────────
   Features section
───────────────────────────────────────────────────────── */

function FeaturesSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Built for the way you actually build.
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Drop it in. It fits. No style overrides, no design fights, no clashing third-party look.
            </p>
          </div>
        </FadeUp>

        <div className="space-y-24 lg:space-y-32">
          {/* Feature 1: Collect */}
          <FadeUp>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                    Step 1
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
                  Send a link.
                  <br />
                  Get a testimonial. Keep moving.
                </h3>
                <p className="text-base text-gray-500 leading-relaxed mb-7">
                  A mobile-first form that guides your client through rating, writing, and submitting
                  in two minutes. No login, no app, no friction. The form picks up your brand colors
                  and logo automatically.
                </p>
                <ul className="space-y-3">
                  {[
                    "Your accent color and logo on every form",
                    "Separate forms per project, client, or product",
                    "Custom questions to get specific, useful answers",
                  ].map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 text-sm text-gray-600"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-indigo-600" />
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center lg:justify-end">
                <CollectVisual />
              </div>
            </div>
          </FadeUp>

          {/* Feature 2: Embed */}
          <FadeUp>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center lg:[&>*:first-child]:order-2">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                    Step 2 and 3
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
                  Approve in one click.
                  <br />
                  Embed or paste a React component.
                </h3>
                <p className="text-base text-gray-500 leading-relaxed mb-7">
                  Testimonials arrive in your dashboard. Approve what works. Embed with a script tag
                  on any platform, or drop the React component into your Next.js app or SaaS product.
                  The widget reads your accent color and looks native on day one.
                </p>
                <ul className="space-y-3">
                  {[
                    "Script tag works on Framer, Webflow, WordPress, or any other platform",
                    "React component for Next.js apps and SaaS landing pages",
                    "Each widget scoped to one project (portfolio, client site, or product)",
                  ].map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 text-sm text-gray-600"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-indigo-600" />
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center lg:justify-start">
                <EmbedVisual />
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   How it works (dark section)
───────────────────────────────────────────────────────── */

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create your form",
      body: "Add your logo and accent color. Write one optional custom question. The form looks like your brand. Ready in under five minutes.",
    },
    {
      number: "02",
      title: "Share with clients",
      body: "Paste the link in an email, a DM, or your client onboarding template. They click, fill in two minutes, done. No login, no friction.",
    },
    {
      number: "03",
      title: "Approve and display",
      body: "Submissions hit your dashboard. Approve what you love. Paste one line or drop in the React component. Your testimonial wall is live.",
    },
  ];

  return (
    <section className="bg-slate-950 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Live on your site in 15 minutes.
              <br className="hidden sm:block" /> Looks like you built it yourself.
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
              The whole product is share, approve, embed. No complex setup. No integrations to configure.
            </p>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <FadeUp key={step.number} delay={i * 0.12}>
              <div>
                <div className="text-[64px] font-black text-slate-800 leading-none mb-5 select-none">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Pricing cards (exported, used in /pricing page too)
───────────────────────────────────────────────────────── */

type FeatureItem = { text: string; limitation?: true };

const FREE_FEATURES: FeatureItem[] = [
  { text: "Unlimited testimonials" },
  { text: "1 collection form" },
  { text: "1 embed widget" },
  { text: "Grid layout" },
  { text: "Custom questions on your form" },
  { text: "Public reviews page (/p/you)" },
  { text: "Custom widget colors" },
  { text: "3 video testimonials per project" },
  { text: "Contains Vouch branding", limitation: true },
];

const PRO_FEATURES: string[] = [
  "Everything in Free",
  "Unlimited forms and embed widgets",
  "Unlimited video testimonials (in-browser recording)",
  "Automated LinkedIn and Google Review nudges",
  "Shareable image cards for social media",
  "Carousel, wall of love, and list layouts",
  "Remove Vouch branding",
  "Custom public page address",
];

const AGENCY_FEATURES: string[] = [
  "Everything in Pro",
  "Unlimited projects",
  "Priority email support",
  "Custom onboarding call",
];

export function PricingCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {/* Free */}
      <FadeUp delay={0.05}>
        <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-2xl h-full">
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-500 mb-1">Free</p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-400 mb-1">/month</span>
            </div>
            <p className="text-sm text-gray-400">
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
                <span className={f.limitation ? "text-gray-400" : "text-gray-600"}>
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
            <Link href="/signup">Start for free</Link>
          </Button>
        </div>
      </FadeUp>

      {/* Pro */}
      <FadeUp delay={0.12}>
        <div className="relative flex flex-col p-6 bg-white border-2 border-indigo-500 rounded-2xl shadow-xl shadow-indigo-100 h-full">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <div className="px-4 py-1 bg-indigo-600 rounded-full text-white text-xs font-semibold shadow-md">
              Most Popular
            </div>
          </div>
          <div className="mb-6 mt-2">
            <p className="text-sm font-semibold text-indigo-600 mb-1">Pro</p>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-4xl font-bold text-gray-900">$19</span>
              <span className="text-gray-400 mb-1">/month</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">$190/year</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                2 months free
              </span>
            </div>
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
            <Link href="/signup?plan=pro">Start Pro trial</Link>
          </Button>
          <p className="text-center text-xs text-gray-400 mt-3">
            14-day free trial. Cancel anytime.
          </p>
        </div>
      </FadeUp>

      {/* Agency */}
      <FadeUp delay={0.19}>
        <div className="flex flex-col p-6 bg-slate-950 border border-slate-800 rounded-2xl h-full">
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-400 mb-1">Agency</p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-4xl font-bold text-white">$49</span>
              <span className="text-slate-400 mb-1">/month</span>
            </div>
            <p className="text-sm text-slate-500">
              For teams managing multiple client accounts.
            </p>
          </div>
          <ul className="space-y-3 flex-1 mb-7">
            {AGENCY_FEATURES.map((f) => (
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
            variant="outline"
            className="w-full rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent"
          >
            {/* Update this mailto to your preferred contact address */}
            <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'hello@example.com'}?subject=Agency%20Plan`}>
              <Mail className="w-4 h-4 mr-2" />
              Get in touch
            </a>
          </Button>
          <p className="text-center text-xs text-slate-600 mt-3">
            Custom pricing available for larger teams.
          </p>
        </div>
      </FadeUp>
    </div>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              One account. Every project you build.
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Start free. Upgrade when your work grows. One account, no per-project fees.
            </p>
          </div>
        </FadeUp>
        <PricingCards />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FAQ
───────────────────────────────────────────────────────── */

const FAQS = [
  {
    q: "Can one account cover multiple projects or clients?",
    a: "Yes. One account gives you unlimited projects. Create a separate form and widget for each client site, each product, or each service you offer. Each one can have its own branding, questions, and embed. There are no per-domain or per-project fees on Pro.",
  },
  {
    q: "Does this work for SaaS products and apps?",
    a: "Yes. SaaS founders use Vouch to collect testimonials from users and display them on their landing page to improve conversion. The React component drops directly into any Next.js app. The script tag works on any marketing page. Your widget reads your accent color and looks native to your product from day one.",
  },
  {
    q: "How is this different from Testimonial.to or EmbedSocial?",
    a: "Those tools charge per domain or per seat, inject third-party scripts that hurt your Lighthouse score, and lock testimonials inside their own hosted page. Vouch renders as native HTML with zero external requests. The widget matches your design instead of theirs, one account covers every project you run, and in-browser video recording is built in with no third-party SDK.",
  },
  {
    q: "Does the testimonial widget slow down my site?",
    a: "No. Vouch renders testimonials as static HTML inside an iframe. There are no external JavaScript libraries, no third-party trackers, and no cookie banners added to your page. Your Lighthouse score and Core Web Vitals stay exactly where you left them.",
  },
  {
    q: "Can my clients record video testimonials?",
    a: "Yes. The collection form has a built-in video recording step. Clients record directly in their browser with one click. No app to download, no third-party service. Free accounts include 3 video testimonials per project. Pro gets unlimited.",
  },
  {
    q: "Can I remove the 'Powered by Vouch' branding?",
    a: "Yes. Pro removes the branding entirely from both the widget and the collection form. Your clients and their users see only your work.",
  },
  {
    q: "Will the widget match my site's design?",
    a: "Yes. You pick an accent color in your dashboard and the widget uses it everywhere: cards, stars, and avatars. The component renders using your page's existing font stack, so there are no visual mismatches with a site you have spent careful effort designing.",
  },
  {
    q: "Do my clients need to create an account to leave a testimonial?",
    a: "No. They click the link, fill in the form, and they are done. No signup, no login, nothing to install. The form works on any phone or laptop.",
  },
  {
    q: "How is this different from just asking clients via email?",
    a: "Email requests get ignored. Vouch gives clients a guided, 2-minute experience with a branded form. They know exactly what to write because the form walks them through it. The completion rate is meaningfully higher than unstructured email requests.",
  },
  {
    q: "Does it work on Webflow, Framer, WordPress, and Next.js?",
    a: "Yes. Vouch gives you a script tag that works anywhere you can paste HTML, and a React component for Next.js and Remix projects. Both pull from the same data source. Your testimonial section looks native to whatever stack you are using.",
  },
  {
    q: "Do I need a website to use Vouch?",
    a: "No. Every account gets a public page at /p/your-name that you can share directly with prospects via email or a DM. Your testimonials live there even without a website.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard in under a minute. No questions, no lock-in. You keep access until the end of your billing period.",
  },
];

function FAQSection() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50/50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Questions?
            </h2>
            <p className="mt-3 text-gray-500">
              If you are wondering, others are too.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-white border border-gray-100 rounded-xl px-5 data-[state=open]:shadow-sm transition-shadow"
              >
                <AccordionTrigger className="text-sm font-medium text-gray-900 text-left py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-500 leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Bottom CTA
───────────────────────────────────────────────────────── */

function BottomCTA() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <FadeUp>
          <div
            className="relative rounded-3xl px-8 py-16 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #3730a3 0%, #4f46e5 45%, #6366f1 100%)",
            }}
          >
            {/* Orbs */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative">
              {/* Star row */}
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-5 h-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Ship a testimonial section today.
                <br className="hidden sm:block" /> It will look like you built it.
              </h2>
              <p className="text-indigo-200 text-lg mb-9 max-w-lg mx-auto">
                Free to start. Set up in 15 minutes. Upgrade when your work grows
                and it covers everything you build.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl px-8 py-6 text-base font-semibold shadow-lg"
                >
                  <Link href="/signup">
                    Start for free <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="text-white border border-white/25 hover:bg-white/10 rounded-xl px-8 py-6 text-base"
                >
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>

              <p className="text-indigo-300/70 text-xs mt-6">
                Free forever · No credit card required to start
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <BottomCTA />
    </>
  );
}

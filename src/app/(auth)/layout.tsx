import React from 'react';
import { Star, Check } from 'lucide-react';

const PANEL_TESTIMONIALS = [
  {
    initials: 'SL',
    bg: 'bg-violet-400',
    name: 'Sophie L.',
    role: 'Marketing Lead',
    rating: 5,
    text: 'We were getting 1-2 testimonials a year. Now I have 14 in the last month.',
  },
  {
    initials: 'JT',
    bg: 'bg-sky-400',
    name: 'James T.',
    role: 'Co-founder, Bloom Studio',
    rating: 5,
    text: 'Closed 3 clients last month who mentioned they saw reviews on my portfolio.',
  },
  {
    initials: 'AR',
    bg: 'bg-rose-400',
    name: 'Ana R.',
    role: 'Product Manager',
    rating: 4,
    text: 'Setup took 8 minutes. The embed looks great on our site.',
  },
];

function PanelTestimonialCard({
  initials,
  bg,
  name,
  role,
  rating,
  text,
}: (typeof PANEL_TESTIMONIALS)[number]) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{name}</p>
          <p className="text-xs text-indigo-200 truncate">{role}</p>
        </div>
        <span className="ml-auto flex items-center gap-1 bg-white/15 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
          <Check className="w-2.5 h-2.5" /> Verified
        </span>
      </div>
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3 h-3 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-white/20 text-white/20'}`}
          />
        ))}
      </div>
      <p className="text-sm text-indigo-100 leading-relaxed">&ldquo;{text}&rdquo;</p>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left: brand panel (desktop only) */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 px-12 py-14"
        style={{
          background: 'linear-gradient(160deg, #3730a3 0%, #4f46e5 55%, #6366f1 100%)',
        }}
      >
        {/* Logo */}
        <div>
          <span className="text-2xl font-bold tracking-tight text-white">Vouch</span>
        </div>

        {/* Central message */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Your clients love your work.
              <br />
              <span className="text-indigo-300">Make sure everyone sees it.</span>
            </h2>
            <p className="mt-4 text-base text-indigo-200 leading-relaxed">
              One link. Your client fills it in. A beautiful testimonial section appears on your site.
            </p>
          </div>

          <div className="space-y-3">
            {PANEL_TESTIMONIALS.map((t) => (
              <PanelTestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>

        {/* Bottom trust signal */}
        <p className="text-xs text-indigo-300/60">
          Free to start. No credit card required.
        </p>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
        {children}
      </div>
    </div>
  );
}

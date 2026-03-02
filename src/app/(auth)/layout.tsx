import React from 'react';
import { Palette, Gauge, Zap } from 'lucide-react';

const BENEFITS = [
  {
    icon: Palette,
    title: 'Looks native to any design',
    desc: 'Matches your brand colors automatically. Works on Webflow, Framer, or custom HTML.',
  },
  {
    icon: Gauge,
    title: 'Zero Lighthouse impact',
    desc: 'Async loading. Your page speed score stays untouched.',
  },
  {
    icon: Zap,
    title: 'Clients submit in under 2 minutes',
    desc: 'No account needed. They get a link, they fill it in. Done.',
  },
];

function BenefitRow({
  icon: Icon,
  title,
  desc,
}: (typeof BENEFITS)[number]) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-indigo-200" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-indigo-300 mt-0.5 leading-relaxed">{desc}</p>
      </div>
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
              One link. Your client fills it in. A branded testimonial section appears on your site.
            </p>
          </div>

          <div className="space-y-5">
            {BENEFITS.map((b) => (
              <BenefitRow key={b.title} {...b} />
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

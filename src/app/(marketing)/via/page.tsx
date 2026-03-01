import Link from 'next/link';
import type { Metadata } from 'next';
import { Zap, Globe, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Collect testimonials for free — Vouch',
  description: 'You just saw Vouch in action. Build your own testimonial wall in minutes, free.',
};

export default function ViaPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
          You just saw Vouch in action.
        </h1>

        {/* Subheading */}
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Collect real customer testimonials, display them anywhere, and turn social proof into new revenue.
        </p>

        {/* Value props */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {([
            { Icon: Zap, title: 'Set up in 2 minutes', body: 'Create a form, share the link, collect testimonials.' },
            { Icon: Globe, title: 'Embed anywhere', body: 'Drop a widget onto any website with one line of code.' },
            { Icon: Lock, title: 'Free forever', body: 'Unlimited testimonials. No credit card required.' },
          ] as const).map((item) => (
            <div
              key={item.title}
              className="bg-white border border-border rounded-2xl p-4"
            >
              <item.Icon className="w-5 h-5 text-indigo-500 mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-14 px-10 rounded-2xl bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 gap-2"
          >
            Build yours free
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            No credit card. No setup fees. Start collecting in minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

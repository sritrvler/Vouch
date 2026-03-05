'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Zap, Loader2, Mail, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PRO_FEATURES = [
  'Unlimited forms and embed widgets',
  'Unlimited video testimonials',
  'Google Review and LinkedIn nudges',
  'Image cards for social sharing',
  'Carousel, wall of love, and list layouts',
  'React component embed',
  'Custom public page address',
  'Remove Vouch branding',
];

const AGENCY_FEATURES = [
  'Everything in Pro',
  'Client report links for clients',
  'Priority email support',
  'Custom onboarding call',
];

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing }),
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast.error('Could not start checkout. Please try again.');
      setLoading(false);
    }
  }

  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'hello@example.com';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        {/* Billing toggle */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground mb-3">Choose your plan</h2>
          <div className="flex items-center gap-1 bg-muted/60 rounded-full p-1 w-fit">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-sm font-medium transition-all',
                billing === 'monthly'
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                billing === 'yearly'
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                2 months free
              </span>
            </button>
          </div>
        </div>

        {/* Plans side by side */}
        <div className="grid sm:grid-cols-2 gap-0 sm:divide-x divide-border">
          {/* Pro */}
          <div className="px-6 py-5 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="size-4 text-indigo-600" />
              <h3 className="text-base font-bold text-foreground">Pro</h3>
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-bold text-foreground leading-none">
                {billing === 'yearly' ? '$190' : '$19'}
              </span>
              <span className="text-sm text-muted-foreground mb-0.5">
                /{billing === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
            {billing === 'yearly' && (
              <p className="text-xs text-muted-foreground mb-3">$15.83/mo, billed annually</p>
            )}
            {billing === 'monthly' && (
              <p className="text-xs text-muted-foreground mb-3">For freelancers and solo founders</p>
            )}

            <div className="space-y-2.5 flex-1 mb-5">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <div className="size-4.5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3 text-indigo-600" />
                  </div>
                  <span className="text-sm text-foreground/80">{f}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full h-10 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Starting checkout...
                </>
              ) : (
                <>
                  <Zap className="size-4" />
                  Get Pro
                </>
              )}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              No contracts. Cancel anytime.
            </p>
          </div>

          {/* Agency */}
          <div className="px-6 py-5 flex flex-col border-t sm:border-t-0 border-border">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="size-4 text-amber-500" />
              <h3 className="text-base font-bold text-foreground">Agency</h3>
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-bold text-foreground leading-none">$49</span>
              <span className="text-sm text-muted-foreground mb-0.5">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">For teams managing client accounts</p>

            <div className="space-y-2.5 flex-1 mb-5">
              {AGENCY_FEATURES.map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <div className="size-4.5 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3 text-amber-600" />
                  </div>
                  <span className="text-sm text-foreground/80">{f}</span>
                </div>
              ))}
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full h-10 gap-2 rounded-xl"
            >
              <a href={`mailto:${supportEmail}?subject=Agency%20Plan`}>
                <Mail className="size-4" />
                Get in touch
              </a>
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Custom pricing for larger teams.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

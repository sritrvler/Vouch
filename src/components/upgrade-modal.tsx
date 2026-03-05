'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Zap, Loader2, Mail, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PRO_FEATURES, AGENCY_FEATURES } from '@/lib/lemonsqueezy';

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
      <DialogContent className="max-w-2xl p-0 gap-0 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header with billing toggle */}
        <div className="px-6 pt-5 pb-3 border-b border-border shrink-0">
          <h2 className="text-lg font-bold text-foreground mb-2">Choose your plan</h2>
          <div className="flex items-center gap-1 bg-muted/60 rounded-full p-0.5 w-fit">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-all',
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
                'px-3 py-1 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                billing === 'yearly'
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable plans area */}
        <div className="overflow-y-auto flex-1">
          <div className="grid sm:grid-cols-2 gap-0 sm:divide-x divide-border">
            {/* Pro */}
            <div className="px-5 py-4 flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <Zap className="size-4 text-indigo-600" />
                <h3 className="text-base font-bold text-foreground">Pro</h3>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-foreground leading-none">
                  {billing === 'yearly' ? '$190' : '$19'}
                </span>
                <span className="text-sm text-muted-foreground mb-0.5">
                  /{billing === 'yearly' ? 'year' : 'mo'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                {billing === 'yearly' ? '$15.83/mo, billed annually' : 'For freelancers and solo founders'}
              </p>

              <div className="space-y-2 flex-1 mb-4">
                {PRO_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="size-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-foreground/80 leading-snug">{f}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full h-9 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Starting checkout...
                  </>
                ) : (
                  <>
                    <Zap className="size-3.5" />
                    Get Pro
                  </>
                )}
              </Button>
              <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
                No contracts. Cancel anytime.
              </p>
            </div>

            {/* Agency */}
            <div className="px-5 py-4 flex flex-col border-t sm:border-t-0 border-border">
              <div className="flex items-center gap-2 mb-0.5">
                <Crown className="size-4 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">Agency</h3>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-foreground leading-none">$49</span>
                <span className="text-sm text-muted-foreground mb-0.5">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">For teams managing client accounts</p>

              <div className="space-y-2 flex-1 mb-4">
                {AGENCY_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-foreground/80 leading-snug">{f}</span>
                  </div>
                ))}
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full h-9 gap-2 rounded-xl text-sm"
              >
                <a href={`mailto:${supportEmail}?subject=Agency%20Plan`}>
                  <Mail className="size-3.5" />
                  Get in touch
                </a>
              </Button>
              <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
                Includes a setup call. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FEATURES = [
  'Unlimited forms and embed widgets',
  'Unlimited video testimonials',
  'Google Review and LinkedIn nudges',
  'Shareable image cards for social proof',
  'Custom public page address',
  'Remove Vouch branding',
];

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast.error('Could not start checkout. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden gap-0">
        {/* Price block */}
        <div className="px-6 pt-6 pb-5 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="size-4 text-indigo-600" />
                <h2 className="text-lg font-bold text-foreground">Upgrade to Pro</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Unlock everything. Cancel anytime.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-bold text-foreground leading-none">$19</div>
              <div className="text-xs text-muted-foreground mt-0.5">/month</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 py-5 space-y-3">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="size-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <Check className="size-3 text-indigo-600" />
              </div>
              <span className="text-sm text-foreground/80">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full h-11 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Starting checkout...
              </>
            ) : (
              <>
                <Zap className="size-4" />
                Upgrade to Pro — $19/mo
              </>
            )}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            No contracts. Cancel anytime. Billed monthly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

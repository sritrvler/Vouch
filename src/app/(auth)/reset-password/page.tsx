'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Lock, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const valid = password.length >= 8 && password === confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;

    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message || 'Failed to update password. Please try again.');
      setIsLoading(false);
      return;
    }

    setDone(true);
    setIsLoading(false);
    toast.success('Password updated successfully');
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  if (done) {
    return (
      <div className="w-full max-w-sm px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-border/50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="size-7 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Password updated</h2>
          <p className="text-sm text-muted-foreground">
            Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-border/50 p-8">
        <div className="mb-8 text-center lg:hidden">
          <span className="text-3xl font-bold tracking-tight text-primary">Vouch</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Set new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a new password for your account.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              New password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="pl-9 h-11"
                autoFocus
              />
            </div>
            {password.length > 0 && password.length < 8 && (
              <p className="text-xs text-destructive mt-1">Must be at least 8 characters</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-sm font-medium">
              Confirm password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                className="pl-9 h-11"
              />
            </div>
            {confirm.length > 0 && password !== confirm && (
              <p className="text-xs text-destructive mt-1">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-medium"
            disabled={!valid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

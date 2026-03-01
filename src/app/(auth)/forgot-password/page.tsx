'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${origin}/api/auth/callback?next=/dashboard/settings`,
    });

    if (error) {
      toast.error(error.message || 'Failed to send reset link. Please try again.');
      setIsLoading(false);
      return;
    }

    setSentTo(values.email);
    setSent(true);
    setIsLoading(false);
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm px-4"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-border/50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="size-7 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a password reset link to <strong>{sentTo}</strong>. Click the link in the email
            to choose a new password.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-sm px-4"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-border/50 p-8">
        <div className="mb-8 text-center lg:hidden">
          <span className="text-3xl font-bold tracking-tight text-primary">Vouch</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="pl-9 h-11"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending…
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline underline-offset-4"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

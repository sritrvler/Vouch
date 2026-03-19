'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isDisposableEmail } from '@/lib/disposable-emails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name is too long'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPro = searchParams.get('plan') === 'pro';
  const billing = searchParams.get('billing') === 'yearly' ? 'yearly' : 'monthly';
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(values: SignupFormValues) {
    if (isDisposableEmail(values.email)) {
      toast.error('Temporary email addresses are not allowed. Please use a real email.');
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${origin}/api/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message || 'Failed to create account. Please try again.');
      setIsLoading(false);
      return;
    }

    // If user is immediately confirmed (e.g. email confirmations disabled in Supabase)
    if (data.session) {
      if (isPro) {
        toast.success('Account created! Taking you to checkout...');
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billing }),
        });
        if (res.ok) {
          const { url } = await res.json();
          if (url) { window.location.href = url; return; }
        }
      }
      toast.success('Account created! Welcome to Vouch.');
      router.push('/dashboard');
      router.refresh();
      return;
    }

    // Email confirmation required
    setEmailSent(true);
    setIsLoading(false);
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;

    // Force account picker so Google doesn't auto-login after Supabase signOut
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/api/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) {
      toast.error('Failed to sign in with Google. Please try again.');
      setIsGoogleLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-sm px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-border/50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
              <Mail className="size-7 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We&apos;ve sent a confirmation link to your email address. Click the link to activate
            your account.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm px-4">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-border/50 p-8">
        {/* Logo, shown only on mobile where the brand panel is hidden */}
        <div className="mb-8 text-center lg:hidden">
          <span className="text-3xl font-bold tracking-tight text-primary">Vouch</span>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPro
              ? 'One step away from Pro. Create your account to continue.'
              : 'Start collecting testimonials for free'}
          </p>
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 gap-2 font-medium"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="fullName"
                type="text"
                placeholder="Jane Smith"
                autoComplete="name"
                className="pl-9 h-11"
                aria-invalid={!!errors.fullName}
                {...register('fullName')}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
            )}
          </div>

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

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="pl-9 pr-10 h-11"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-medium"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>

        {/* Terms */}
        <p className="mt-4 text-center text-xs text-muted-foreground leading-relaxed">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-3 hover:text-foreground">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-3 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isDisposableEmail } from '@/lib/disposable-emails';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/dashboard';

  // Validate redirect target: must be a safe relative path (prevents open redirect)
  const isSafe = rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/\\');
  const next = isSafe ? rawNext : '/dashboard';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Server-side disposable email check (defense-in-depth, client also checks)
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && isDisposableEmail(user.email)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/signup?error=disposable_email`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Verifies the caller is an authenticated admin user.
 * Checks both ADMIN_EMAIL match and ADMIN_SECRET header.
 * Fails closed: returns null if any env var is missing.
 */
export async function verifyAdmin(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminEmail || !user || user.email !== adminEmail) return null;
  if (!adminSecret || req.headers.get('x-admin-secret') !== adminSecret) return null;
  return user;
}

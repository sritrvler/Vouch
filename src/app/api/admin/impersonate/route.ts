import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/admin-auth';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
  const caller = await verifyAdmin(req);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { email } = body as { email: string };
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (error) return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 });

  const link = data.properties?.action_link;
  if (!link) return NextResponse.json({ error: 'No link generated' }, { status: 500 });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return NextResponse.json({ error: 'ADMIN_EMAIL not configured' }, { status: 500 });

  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_xxx') {
    const from = process.env.RESEND_FROM_EMAIL ?? 'notifications@example.com';
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: `Vouch Admin <${from}>`,
      to: adminEmail,
      subject: `Impersonate link for ${email}`,
      html: `<p>One-time magic link to log in as <strong>${esc(email)}</strong>:</p><p><a href="${esc(link)}">${esc(link)}</a></p><p>Open in an incognito window. This link expires after one use.</p>`,
    });
  }

  return NextResponse.json({ sent: true, message: `Impersonate link sent to admin email.` });
}

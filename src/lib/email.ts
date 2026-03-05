import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'notifications@example.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

function stars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendNewTestimonialNotification({
  toEmail,
  authorName,
  rating,
  content,
}: {
  toEmail: string;
  authorName: string;
  rating: number;
  content: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_xxx') {
    // Skip silently in dev/placeholder mode
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const snippet = content.length > 160 ? content.slice(0, 157) + '...' : content;
  const inboxUrl = `${SITE_URL}/dashboard/inbox`;

  const safeAuthorName = htmlEscape(authorName);
  const safeSnippet = htmlEscape(snippet);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New testimonial from ${safeAuthorName}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#4f46e5;padding:24px 32px;">
              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">Vouch</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 4px 0;font-size:13px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">New testimonial</p>
              <h1 style="margin:0 0 20px 0;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">
                ${safeAuthorName} left you a ${rating}-star review
              </h1>
              <p style="margin:0 0 20px 0;font-size:22px;color:#f59e0b;letter-spacing:2px;">${stars(rating)}</p>
              <blockquote style="margin:0 0 28px 0;padding:16px 20px;background:#f8fafc;border-left:4px solid #4f46e5;border-radius:0 8px 8px 0;">
                <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;font-style:italic;">&ldquo;${safeSnippet}&rdquo;</p>
              </blockquote>
              <a href="${inboxUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                Review in inbox &rarr;
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                You received this because you have a Vouch account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await resend.emails.send({
    from: `Vouch <${FROM}>`,
    to: toEmail,
    subject: `${safeAuthorName} left you a ${rating}-star testimonial`,
    html,
  });
}

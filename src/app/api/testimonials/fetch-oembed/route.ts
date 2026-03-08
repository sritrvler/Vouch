import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/ratelimit';

const oembedLimiter = createRateLimiter({ windowMs: 60_000, max: 20, prefix: 'vouch:rl:oembed' });

// Proxy Twitter/X oEmbed to avoid CORS issues in the browser.
// No API key required — https://publish.twitter.com/oembed is a public endpoint.
export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (!(await oembedLimiter.check(ip))) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }
  const url = request.nextUrl.searchParams.get('url');

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  // Only allow Twitter/X URLs
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const host = parsed.hostname.replace(/^www\./, '');
  if (host !== 'twitter.com' && host !== 'x.com') {
    return NextResponse.json({ error: 'Only Twitter/X URLs are supported' }, { status: 400 });
  }

  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=1`;

  let oembedData: { html?: string; author_name?: string; author_url?: string };
  try {
    const res = await fetch(oembedUrl, { next: { revalidate: 0 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Tweet not found or not public' }, { status: 404 });
    }
    oembedData = await res.json() as { html?: string; author_name?: string; author_url?: string };
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tweet' }, { status: 502 });
  }

  // Extract plain text from the oEmbed HTML.
  // The HTML contains a <p> block with the tweet text, then metadata.
  const html = oembedData.html ?? '';
  const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  let text = '';
  if (pMatch) {
    text = pMatch[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  return NextResponse.json({
    author_name: oembedData.author_name ?? '',
    text,
    source_url: url,
  });
}

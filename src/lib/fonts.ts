// ─── Shared font constants and sanitizers ────────────────────────────────────

export interface GoogleFont {
  label: string;
  value: string;
  url: string;
}

export const GOOGLE_FONTS: GoogleFont[] = [
  { label: 'Inter', value: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
  { label: 'Roboto', value: 'Roboto', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
  { label: 'Open Sans', value: 'Open Sans', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap' },
  { label: 'Lato', value: 'Lato', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' },
  { label: 'Poppins', value: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' },
  { label: 'Montserrat', value: 'Montserrat', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap' },
  { label: 'Nunito', value: 'Nunito', url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap' },
  { label: 'Raleway', value: 'Raleway', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap' },
  { label: 'Source Sans 3', value: 'Source Sans 3', url: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap' },
  { label: 'Work Sans', value: 'Work Sans', url: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap' },
  { label: 'DM Sans', value: 'DM Sans', url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap' },
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans', url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap' },
  { label: 'Outfit', value: 'Outfit', url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap' },
  { label: 'Manrope', value: 'Manrope', url: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap' },
  { label: 'Space Grotesk', value: 'Space Grotesk', url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap' },
];

/** Returns the URL for a Google Font value, or null if not found. */
export function getGoogleFontUrl(fontValue: string | null | undefined): string | null {
  if (!fontValue) return null;
  const match = GOOGLE_FONTS.find((f) => f.value === fontValue);
  return match?.url ?? null;
}

/** Validates a font CSS URL is HTTPS only. Returns the URL or null. */
export function sanitizeFontUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) return null;
  // Block javascript: and data: URIs that might be encoded
  if (/javascript:|data:/i.test(trimmed)) return null;
  return trimmed;
}

/** Strips characters that could enable CSS injection. Allows letters, numbers, spaces, hyphens. */
export function sanitizeFontFamily(family: string | null | undefined): string | null {
  if (!family || typeof family !== 'string') return null;
  const cleaned = family.replace(/[^a-zA-Z0-9 -]/g, '').trim();
  return cleaned || null;
}

/** Resolves the font URL to load: checks Google Fonts list first, then falls back to custom URL. */
export function resolveFontUrl(
  fontFamily: string | null | undefined,
  fontUrl: string | null | undefined
): string | null {
  // If it's a known Google Font, use that URL
  const googleUrl = getGoogleFontUrl(fontFamily);
  if (googleUrl) return googleUrl;
  // Otherwise use the custom URL if provided
  return sanitizeFontUrl(fontUrl);
}

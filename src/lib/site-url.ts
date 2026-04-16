/**
 * Canonical site origin for `metadataBase`, sitemap, and robots.
 * Prefer setting `NEXT_PUBLIC_SITE_URL` in production (no trailing slash).
 * On Vercel, preview deployments can rely on `VERCEL_URL` when the public URL is unset.
 *
 * Use from Server Components, Route Handlers, `sitemap.ts`, `robots.ts`, and `layout` metadata only.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  return "https://energiapiloot.com";
}

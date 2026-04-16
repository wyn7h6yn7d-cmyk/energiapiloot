# Deployment (Vercel)

This app targets [Vercel](https://vercel.com) with the Next.js App Router. No Docker or custom server is required.

## Prerequisites

- Git repository connected to Vercel.
- **Supabase** project (URL + anon key) if you use server routes or actions that call `createSupabaseServerClient`.
- Optional: custom domain DNS pointed at Vercel.

## Environment variables

1. In Vercel: **Project → Settings → Environment Variables**.
2. Copy names from [`.env.example`](./.env.example).
3. Assign each variable to **Production**, **Preview**, and/or **Development** as appropriate.

### Required for full functionality

| Variable | Notes |
| -------- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase **Project URL** (public). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon public** key (safe for the browser; still keep abuse limits in Supabase). |

### Strongly recommended

| Variable | Notes |
| -------- | ----- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, **no trailing slash**, e.g. `https://www.energiapiloot.com`. Drives `metadataBase`, sitemap, and absolute links. If omitted on Vercel, the app falls back to `VERCEL_URL` (automatically set). |

### Optional (integrations & checkout)

See `.env.example` for `ENERGIAPILOOT_API_MODE`, Nord Pool, Stripe price IDs, etc. Defaults keep the app on **mock** data where adapters support it.

### Supabase Auth URLs

In Supabase **Authentication → URL configuration**:

- **Site URL**: your production origin (e.g. `https://www.energiapiloot.com`).
- **Redirect URLs**: include production, any staging domain, and preview patterns, e.g.  
  `https://your-domain.com/**` and `https://*.vercel.app/**`

## Domain and metadata

1. Add the domain under Vercel **Project → Settings → Domains**.
2. Set `NEXT_PUBLIC_SITE_URL` on **Production** to the primary URL (match `www` vs apex consistently).
3. Redeploy so Open Graph and sitemap pick up the value.

## Build and CI

Locally:

```bash
npm run verify
```

This runs TypeScript (`tsc --noEmit`) and `next build`. On Vercel the default **Build Command** `npm run build` is enough once env vars are set; `verify` is useful locally or in CI for an extra typecheck. Run `npm run verify:strict` to include ESLint when the codebase passes it.

## Security headers

[`vercel.json`](./vercel.json) sets baseline headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`). Adjust if you embed third-party widgets that need broader permissions.

## Error handling

- [`src/app/error.tsx`](./src/app/error.tsx): segment error boundary (Estonian UI).
- [`src/app/global-error.tsx`](./src/app/global-error.tsx): root fallback if the root layout fails; imports global CSS explicitly.

## Troubleshooting

- **“Missing environment variable: NEXT_PUBLIC_SUPABASE_…”** — Set both Supabase vars for the environment that runs the failing route or action.
- **Wrong canonical / OG URL on previews** — Expected if `NEXT_PUBLIC_SITE_URL` is unset; the app uses `https://${VERCEL_URL}`. Set an explicit preview URL if you need a fixed host.
- **Middleware redirecting `/dashboard`** — Intentional for the public-first product; legacy dashboard paths redirect home (see root [`middleware.ts`](./middleware.ts)).

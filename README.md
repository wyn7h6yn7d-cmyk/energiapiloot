# Energiapiloot

Public-first energy intelligence experience: leping, tarbimine ja investeering ühes visuaalses tootes. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase** scaffolding, and integration adapters (mock / hybrid / live).

## Requirements

- **Node.js** 20+ (align with Vercel defaults)
- **npm** (or pnpm/yarn)

## Quick start

```bash
git clone <repo-url>
cd energiapiloot
cp .env.example .env.local
# Edit .env.local — at minimum set Supabase URL + anon key for API routes that use the DB client.
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

- **Template:** [`.env.example`](./.env.example) — copy to `.env.local` (never commit secrets).
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the Supabase dashboard (**Settings → API**). Required when hitting server code that calls `createSupabaseServerClient()`.
- **Site URL:** `NEXT_PUBLIC_SITE_URL` (no trailing slash), e.g. `http://localhost:3000` locally, `https://your-domain.com` in production. Improves metadata and sitemap accuracy; on Vercel, `VERCEL_URL` is used as a fallback when this is unset.
- **Integrations:** `ENERGIAPILOOT_API_MODE` defaults to `mock`. See `.env.example` for Nord Pool, Estfeed, Stripe unlock placeholders, etc.

Full deployment checklist: **[`DEPLOYMENT.md`](./DEPLOYMENT.md)**.

## Scripts

| Command | Purpose |
| -------- | -------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript without emit |
| `npm run verify` | `typecheck` + `build` (recommended CI / pre-deploy gate) |
| `npm run verify:strict` | Also runs `lint` (use when ESLint is clean) |

## Project layout (high level)

| Area | Path |
| ---- | ---- |
| App Router pages | `src/app/` |
| Marketing & product UI | `src/components/` |
| Supabase (server / browser helpers) | `src/lib/supabase/` |
| External API env & adapters | `src/lib/api/` |
| Unlock / entitlements (scaffold) | `src/lib/unlock/` |
| Canonical site URL helper | `src/lib/site-url.ts` |

Archived SaaS/auth flows live under `src/legacy/`; root middleware redirects legacy auth and dashboard entry URLs to the public home page.

## API integrations

Server-only: adapters in `src/lib/api/adapters/`, validated env in `src/lib/api/env.ts` (`getApiEnv()` — **do not import from client components**). Use `ENERGIAPILOOT_API_MODE=hybrid` to try live providers and fall back to mock on failure.

Details and provider status are documented inline in `.env.example` and the older section of this file’s history; product orchestration lives in `src/lib/server/services/`.

## Deploy on Vercel

1. Import the repo in Vercel (framework preset: **Next.js**).
2. Add environment variables from `.env.example` (at least Supabase; set `NEXT_PUBLIC_SITE_URL` for production).
3. Connect your domain; configure Supabase Auth redirect URLs for production and `*.vercel.app` previews.
4. Deploy.

See **[`DEPLOYMENT.md`](./DEPLOYMENT.md)** for headers, troubleshooting, and CI notes.

## License

Private / all rights reserved unless otherwise stated in the repository.

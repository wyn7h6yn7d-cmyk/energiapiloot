# Energiapiloot

Production-grade startup website + SaaS MVP foundation.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion + GSAP (ScrollTrigger where useful)
- React Three Fiber + Drei
- Supabase (auth + database)
- Stripe-ready billing structure (scaffold)
- Recharts (charts)
- next-intl (i18n readiness)

## Getting started

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Run dev:

```bash
npm run dev
```

## API architecture (integrations)

External providers are accessed **only from the server**: adapters in `src/lib/api/adapters/`, validated env in `src/lib/api/env.ts` (`getApiEnv()` — do **not** import from client components), and TTL caching via `src/lib/api/cache/memory-cache.ts`.

| Integration | Adapter | Live-ready? | Wired into product |
| --- | --- | --- | --- |
| Nord Pool day-ahead | `nord-pool.ts` | **Mock/hybrid yes; live parser TODO** (configure real Data Portal contract) | Dashboard overview, contract hints, reports, recommendation context |
| Estfeed / Datahub | `estfeed.ts` | **Structure + mock/hybrid; OAuth live TODO** | Dashboard consumption series, overview copy, onboarding “data connection” |
| PVGIS | `pvgis.ts` | **Yes** (public API; stays server-side) | Simulations page (solar hint panel), `runSolarSimulationServer` service |
| Open-Meteo | `open-meteo.ts` | **Yes** | Solar / heat-pump oriented services (e.g. `investment-simulation-service`) |
| Address | `address.ts` | Mock yes; **Maa-amet/In-ADS parser TODO** | `/api/integrations/address-search`, onboarding autocomplete |
| Business registry | `business-registry.ts` | Mock yes; **RIK live TODO** | `/api/integrations/business-lookup`, onboarding |

**Switching mock → live:** set `ENERGIAPILOOT_API_MODE=hybrid` (recommended) or `live`, then fill the provider-specific env vars in `.env.example`. Hybrid keeps the UI working if a live call fails.

**Product-facing orchestration** lives in `src/lib/server/services/` (e.g. `dashboard-overview-service`, `contract-analysis-service`, `recommendation-context-service`, `report-context-service`, `solar-hints-service`).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Legacy account-first UI (archived)

This folder holds **reference copies** of the old auth and onboarding surfaces. They are **not mounted** under `src/app`, so they produce no routes.

The live product is public-first (`/`, `/leping`, `/tarbimine`, `/simulatsioonid`, `/pricing`). URLs such as `/login`, `/register`, `/dashboard`, and `/onboarding` are redirected to `/` by `middleware.ts`.

## Restoring auth later

1. Copy `src/legacy/auth/*` into a routable segment, e.g. `src/app/(auth)/login`, and fix any import paths.
2. Copy `src/legacy/onboarding` into `src/app/(app)/onboarding` (or similar).
3. Adjust `middleware.ts` matchers so only protected areas require a session.
4. Point dashboard `redirect("/")` guards back at login/onboarding as needed.

Supabase clients under `src/lib/supabase/` remain available for a future session layer.

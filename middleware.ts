import { NextResponse, type NextRequest } from "next/server";

/**
 * Public-first product: legacy account URLs redirect home (see `src/legacy/` for archived UI).
 * Future: Stripe success may set `ep_unlock` cookie via /api/checkout/complete.
 */
const LEGACY_AUTH = ["/login", "/register", "/forgot-password", "/reset-password"] as const;
const LEGACY_APP = ["/dashboard", "/onboarding"] as const;

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (LEGACY_AUTH.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (LEGACY_APP.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};

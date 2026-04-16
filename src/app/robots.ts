import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  // Legacy account app URLs redirect home; disallow avoids stale index entries.
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/onboarding", "/login", "/register"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}


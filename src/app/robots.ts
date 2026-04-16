import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Legacy account app URLs redirect home; disallow avoids stale index entries.
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/onboarding", "/login", "/register"],
      },
    ],
    sitemap: "/sitemap.xml",
  };
}


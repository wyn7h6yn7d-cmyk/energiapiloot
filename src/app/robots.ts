import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Allow indexing for marketing pages; app area is protected by auth anyway.
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/onboarding"],
      },
    ],
    sitemap: "/sitemap.xml",
  };
}


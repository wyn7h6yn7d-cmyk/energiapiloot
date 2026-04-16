import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl();
  const now = new Date();

  const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> =
    [
      { path: "/", priority: 1, changeFrequency: "weekly" },
      { path: "/borsihind", priority: 0.75, changeFrequency: "daily" },
      { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
      { path: "/leping", priority: 0.85, changeFrequency: "monthly" },
      { path: "/tarbimine", priority: 0.85, changeFrequency: "monthly" },
      { path: "/simulatsioonid", priority: 0.85, changeFrequency: "monthly" },
      { path: "/security", priority: 0.7, changeFrequency: "monthly" },
      { path: "/legal/privacy", priority: 0.5, changeFrequency: "yearly" },
      { path: "/legal/terms", priority: 0.5, changeFrequency: "yearly" },
      { path: "/legal/cookies", priority: 0.5, changeFrequency: "yearly" },
    ];

  return routes.map((r) => ({
    url: `${url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}


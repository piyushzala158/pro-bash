import type { MetadataRoute } from "next";

import { linuxPracticeGroups } from "@/lib/practice-data";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...linuxPracticeGroups.map((group) => ({
      url: absoluteUrl(`/practice/${group.slug}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

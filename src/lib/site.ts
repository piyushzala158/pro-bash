const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "Pro Bash",
  applicationName: "Pro Bash Playground",
  description:
    "Pro Bash is a browser-based Linux command practice simulator with guided Bash lessons, terminal labs, and progress tracking.",
  shortDescription:
    "Practice Linux and Bash commands in a browser-based terminal lab.",
  keywords: [
    "linux command practice",
    "bash practice",
    "linux terminal simulator",
    "browser bash playground",
    "linux command exercises",
    "shell command tutorial",
  ],
  author: "Pro Bash",
  locale: "en_US",
} as const;

function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const envSiteUrl = process.env.SITE_URL?.trim();

  if (envSiteUrl) {
    return normalizeSiteUrl(envSiteUrl);
  }

  // Set SITE_URL in production so canonical URLs, sitemap entries, and share metadata
  // point to the real domain instead of the local development fallback.
  return DEFAULT_SITE_URL;
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

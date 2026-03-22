import type { Metadata } from "next";
import { LinuxGroupSelector } from "@/components/linux-group-selector";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Linux Command Practice Simulator",
  description:
    "Practice Linux and Bash commands with guided terminal lessons for navigation, files, search, permissions, and process basics.",
  keywords: [
    "linux command practice simulator",
    "bash tutorial online",
    "learn linux terminal",
    "interactive shell exercises",
    ...siteConfig.keywords,
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Linux Command Practice Simulator",
    description:
      "Build Linux command confidence with browser-based Bash exercises and focused terminal practice tracks.",
    url: "/",
  },
  twitter: {
    title: "Linux Command Practice Simulator",
    description:
      "Build Linux command confidence with browser-based Bash exercises and focused terminal practice tracks.",
  },
};

export default function Home() {
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalApplication",
    name: siteConfig.applicationName,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web Browser",
    url: absoluteUrl("/"),
    description:
      "A browser-based Linux terminal simulator for practicing Bash navigation, file handling, search, permissions, and process commands.",
    teaches: [
      "Linux navigation commands",
      "File management in Bash",
      "grep and find workflows",
      "chmod and permissions basics",
      "process inspection with ps aux",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <LinuxGroupSelector />
    </>
  );
}

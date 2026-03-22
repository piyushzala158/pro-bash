import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LinuxPracticePage } from "@/components/linux-practice-page";
import {
  getLinuxPracticeGroupBySlug,
  linuxPracticeGroups,
} from "@/lib/practice-data";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const dynamicParams = false;

export async function generateStaticParams() {
  return linuxPracticeGroups.map((group) => ({
    group: group.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group } = await params;
  const practiceGroup = getLinuxPracticeGroupBySlug(group);

  if (!practiceGroup) {
    return {
      title: "Practice Group Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const route = `/practice/${practiceGroup.slug}`;
  const title = `${practiceGroup.label} Linux Command Practice`;
  const description = practiceGroup.seoDescription;

  return {
    title,
    description,
    keywords: [
      ...practiceGroup.seoKeywords,
      "linux practice exercises",
      "bash learning path",
      siteConfig.name,
    ],
    alternates: {
      canonical: route,
    },
    openGraph: {
      title,
      description,
      url: route,
      type: "article",
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function PracticeGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const practiceGroup = getLinuxPracticeGroupBySlug(group);

  if (!practiceGroup) {
    notFound();
  }

  const route = `/practice/${practiceGroup.slug}`;
  const practiceJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Practice",
          item: absoluteUrl(route),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: practiceGroup.label,
          item: absoluteUrl(route),
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: `${practiceGroup.label} Linux Command Practice`,
      description: practiceGroup.seoDescription,
      learningResourceType: "Interactive practice",
      educationalLevel: "Beginner to intermediate",
      teaches: practiceGroup.learningFocus,
      keywords: practiceGroup.seoKeywords.join(", "),
      url: absoluteUrl(route),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(practiceJsonLd) }}
      />
      <LinuxPracticePage groupSlug={practiceGroup.slug} />
    </>
  );
}

import { notFound } from "next/navigation";

import { LinuxPracticePage } from "@/components/linux-practice-page";
import {
  getLinuxPracticeGroupBySlug,
  linuxPracticeGroups,
} from "@/lib/practice-data";

export const dynamicParams = false;

export async function generateStaticParams() {
  return linuxPracticeGroups.map((group) => ({
    group: group.slug,
  }));
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

  return <LinuxPracticePage groupSlug={practiceGroup.slug} />;
}

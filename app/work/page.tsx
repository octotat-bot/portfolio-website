import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shell/placeholder-page";
import { work } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.meta.work.title, description: site.meta.work.description };

// Phase 1 placeholder. Work is built in Phase 3.
export default function WorkPage() {
  return <PlaceholderPage title={work.wallLine} />;
}

import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shell/placeholder-page";
import { lab } from "@/content/lab";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.meta.lab.title, description: site.meta.lab.description };

// Phase 1 placeholder. Lab is built in Phase 5.
export default function LabPage() {
  return <PlaceholderPage title={lab.title} />;
}

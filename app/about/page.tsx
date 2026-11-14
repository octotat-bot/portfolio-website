import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shell/placeholder-page";
import { about } from "@/content/about";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.meta.about.title, description: site.meta.about.description };

// Phase 1 placeholder. About is built in Phase 4.
export default function AboutPage() {
  return <PlaceholderPage title={about.opener} />;
}

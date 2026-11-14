import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shell/placeholder-page";
import { contact } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.meta.contact.title, description: site.meta.contact.description };

// Phase 1 placeholder. Contact is built in Phase 5.
export default function ContactPage() {
  return <PlaceholderPage title={contact.headlineLines.join(" ")} lines={contact.headlineLines} />;
}

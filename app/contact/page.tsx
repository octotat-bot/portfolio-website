import type { Metadata } from "next";
import { Credits } from "@/components/sections/contact/credits";
import { Question } from "@/components/sections/contact/question";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.meta.contact.title, description: site.meta.contact.description };

// Contact: one question, then the credits. The short footer and the absence
// of the floating pill come from the shell.
export default function ContactPage() {
  return (
    <main id="main">
      <Question />
      <Credits />
    </main>
  );
}

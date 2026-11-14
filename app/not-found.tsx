import type { Metadata } from "next";
import { RevealText } from "@/components/motion/reveal-text";
import { Button } from "@/components/ui/button";
import { notFound } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.meta.notFound.title };

// 404: midnight, the two-word headline in poster-1 (M03, M04), one line, and
// the primary button home.
export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col justify-center gap-6 px-4 py-32 md:px-10">
      <RevealText as="h1" text={notFound.headline} shuffle className="poster-1" />
      <p className="body max-w-measure">{notFound.line}</p>
      <div className="pt-3">
        <Button href={notFound.button.href}>{notFound.button.label}</Button>
      </div>
    </main>
  );
}

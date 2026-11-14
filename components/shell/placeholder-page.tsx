import { RevealText } from "@/components/motion/reveal-text";

// Phase 1: every route exists with its real headline so navigation, the wipe
// and the menu can be tested. Each page is built in its own phase.
export function PlaceholderPage({ title, lines }: { title: string; lines?: string[] }) {
  return (
    <main id="main" className="flex min-h-dvh flex-col justify-end px-4 pb-16 pt-24 md:px-10">
      <RevealText as="h1" text={title} lines={lines} shuffle className="monument" />
    </main>
  );
}

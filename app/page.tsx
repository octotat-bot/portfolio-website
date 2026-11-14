import { site } from "@/content/site";

// Phase 0 placeholder. Home is built in Phase 2.
export default function HomePage() {
  return (
    <main className="px-4 py-16 md:px-10">
      <h1 className="poster-1">{site.navName}</h1>
    </main>
  );
}

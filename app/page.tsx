import { PlaceholderPage } from "@/components/shell/placeholder-page";
import { home } from "@/content/pages";

// Phase 1 placeholder. Home is built in Phase 2.
export default function HomePage() {
  return <PlaceholderPage title={home.hero.nameLines.join(" ")} lines={home.hero.nameLines} />;
}

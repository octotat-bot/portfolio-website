import { PlaceholderPage } from "@/components/shell/placeholder-page";
import { notFound } from "@/content/pages";

// Phase 1 placeholder. The 404 page is built in Phase 5.
export default function NotFound() {
  return <PlaceholderPage title={notFound.headline} />;
}

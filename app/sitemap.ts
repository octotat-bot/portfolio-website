import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/projects";
import { siteUrl } from "@/lib/site-url";

// Every public page. /styleguide is a development page and is left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths = ["/", "/work", ...caseStudies.map((p) => `/work/${p.slug}`), "/about", "/lab", "/contact"];
  return paths.map((path) => ({ url: new URL(path, base).toString() }));
}

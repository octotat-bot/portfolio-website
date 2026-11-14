import { site } from "@/content/site";

/** The base URL for absolute links: the site's own address, else Vercel's, else local. */
export function siteUrl(): URL {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return new URL(site.url ?? (host ? `https://${host}` : "http://localhost:3000"));
}

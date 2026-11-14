"use client";

// Footer: three columns on desktop, stacked on phones. Left: the name in
// poster-4 and one line. Middle: the four page links, numbered. Right: GitHub,
// LinkedIn, Email, Resume (each hidden while its value is a blank). Then a
// hairline, the copyright, and the ghost marquee.
// Contact has the short footer: the copyright line only.

import { usePathname } from "next/navigation";
import { RollLink } from "@/components/ui/roll-link";
import { footer as copy } from "@/content/pages";
import { site } from "@/content/site";
import { GhostMarquee } from "./ghost-marquee";

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/contact") {
    return (
      <footer className="border-t border-line px-4 py-6 md:px-10">
        <p className="label text-ash">{site.footer.copyright}</p>
      </footer>
    );
  }

  return (
    <footer className="border-t border-line pt-16">
      <div className="grid gap-10 px-4 md:grid-cols-3 md:px-10">
        <div className="flex flex-col gap-3">
          <p className="poster-4">{site.name}</p>
          <p className="body max-w-measure text-ash">{site.footer.line}</p>
        </div>
        <nav aria-label={site.name}>
          <ul className="flex flex-col">
            {copy.pages.map((page) => (
              <li key={page.href}>
                <RollLink href={page.href} before={<span className="label pr-2 text-ash">{page.number}</span>}>
                  {page.label}
                </RollLink>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="flex flex-col">
          {copy.links.map((id) => {
            const link = site.links[id];
            if (!link.value) return null;
            const href = link.kind === "email" ? `mailto:${link.value}` : link.value;
            return (
              <li key={id}>
                <RollLink href={href}>{link.label}</RollLink>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mx-4 mt-16 border-t border-line py-6 md:mx-10">
        <p className="label text-ash">{site.footer.copyright}</p>
      </div>
      <GhostMarquee text={site.footer.ghostMarquee} className="pb-6" />
    </footer>
  );
}

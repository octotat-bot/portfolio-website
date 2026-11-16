"use client";

// Contact 1: the question. 100dvh, midnight. WHERE TO / NEXT? in poster-1 on
// two lines, rising (M03) then shuffling its faces (M04). Under it one lede
// line, the email address as selectable text in poster-4, a primary button
// that opens an email (M07), and three RollLinks (M06).
// The email text and the button are absent while the email is a blank; the
// resume link is absent while its URL is a blank (content/site.ts).
// A poster-shape composition (G1 + G2) fills the empty right side from
// 1025px, and sits below the links on smaller screens (no pointer push there).

import { RevealText } from "@/components/motion/reveal-text";
import { ShapeComposition } from "@/components/motion/shape-composition";
import { Button } from "@/components/ui/button";
import { compositions } from "@/lib/shapes";
import { RollLink } from "@/components/ui/roll-link";
import { contact } from "@/content/pages";
import { site } from "@/content/site";

export function Question() {
  const email = site.links.email.value;
  const links = contact.links.flatMap((id) => {
    const link = site.links[id];
    return link.value ? [{ id, label: link.label, href: link.value }] : [];
  });

  return (
    <section className="shape-split flex min-h-dvh flex-col justify-center gap-10 px-4 py-32 md:px-10">
      <div className="flex min-w-0 flex-col gap-6">
        <RevealText
          as="h1"
          text={contact.headlineLines.join(" ")}
          lines={contact.headlineLines}
          shuffle
          className="poster-1"
        />
        <p className="lede max-w-measure">{contact.line}</p>
        {email ? (
          <>
            {/* On narrow screens the address breaks after the @, never inside the domain. */}
            <p className="poster-4 select-all wrap-anywhere normal-case">
              {email.includes("@") ? (
                <>
                  {email.slice(0, email.indexOf("@") + 1)}
                  <wbr />
                  {email.slice(email.indexOf("@") + 1)}
                </>
              ) : (
                email
              )}
            </p>
            <div className="pt-3">
              <Button href={`mailto:${email}`}>{contact.button}</Button>
            </div>
          </>
        ) : null}
        {links.length ? (
          <ul className="flex flex-wrap gap-x-6">
            {links.map((l) => (
              <li key={l.id}>
                <RollLink href={l.href}>{l.label}</RollLink>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="shape-box shape-box-tall">
        <ShapeComposition comp={compositions.contact} push />
      </div>
    </section>
  );
}

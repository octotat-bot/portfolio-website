"use client";

import type { ReactNode } from "react";
import { CountUp } from "@/components/motion/count-up";
import { DitherField } from "@/components/motion/dither-field";
import { Highlight } from "@/components/motion/highlight";
import { RevealText } from "@/components/motion/reveal-text";
import { Scramble } from "@/components/motion/scramble";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Note } from "@/components/ui/note";
import { ProjectTile } from "@/components/ui/project-tile";
import { RollLink } from "@/components/ui/roll-link";
import { Ticker } from "@/components/ui/ticker";
import { WordList } from "@/components/ui/word-list";
import { about } from "@/content/about";
import { contact, home, menu } from "@/content/pages";
import { site } from "@/content/site";

// Every component and shared effect, in every state, using real copy from
// content/. Development page only.

const WORDS = {
  rest: "rest",
  hover: "hover / focus",
  pressed: "pressed",
  live: "live: hover, focus or scroll",
  primary: "primary",
  ghost: "ghost",
  onBurgundy: "on burgundy",
  large: "large: ivory to claret, 24px and up",
  small: "small: ash to ivory",
  plain: "plain: ivory, the nav name",
  label: "label",
  tag: "tag",
  scrambleView: "scramble on view (M05)",
  scrambleHover: "scramble on hover (M05)",
  noCover: "no cover: dither field and name",
  noteClaret: "claret on midnight",
  noteIvory: "ivory on burgundy",
  scrawl: "scrawl size",
};

type Tile = { slug: string; name: string; kind: string; caption: string; cover: string | null };

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-10 border-t border-line py-16">
      <h2 className="poster-4">
        <span className="label pr-3 text-ash">{id}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function State({ name, children, surface }: { name: string; children: ReactNode; surface?: "burgundy" }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="label text-ash">{name}</p>
      <div
        data-surface={surface}
        className={surface === "burgundy" ? "flex flex-wrap items-center gap-4 bg-burgundy p-6" : "flex flex-wrap items-center gap-4"}
      >
        {children}
      </div>
    </div>
  );
}

export function ComponentsDemo({ tiles }: { tiles: Tile[] }) {
  const [hi, there] = home.hero.buttons;
  return (
    <>
      <Block id="C1" title="Button">
        <div className="grid gap-10 md:grid-cols-3">
          <State name={`${WORDS.primary} / ${WORDS.rest}`}>
            <Button href={hi.href}>{hi.label}</Button>
          </State>
          <State name={`${WORDS.primary} / ${WORDS.hover}`}>
            <Button href={hi.href} force="hover">
              {hi.label}
            </Button>
          </State>
          <State name={`${WORDS.primary} / ${WORDS.pressed}`}>
            <Button href={hi.href} force="pressed">
              {hi.label}
            </Button>
          </State>
          <State name={`${WORDS.ghost} / ${WORDS.rest}`}>
            <Button href={there.href} variant="ghost">
              {there.label}
            </Button>
          </State>
          <State name={`${WORDS.ghost} / ${WORDS.hover}`}>
            <Button href={there.href} variant="ghost" force="hover">
              {there.label}
            </Button>
          </State>
          <State name={`${WORDS.ghost} / ${WORDS.pressed}`}>
            <Button href={there.href} variant="ghost" force="pressed">
              {there.label}
            </Button>
          </State>
          <State name={`${WORDS.onBurgundy} / ${WORDS.rest}`} surface="burgundy">
            <Button href={there.href} variant="on-burgundy">
              {contact.button}
            </Button>
          </State>
          <State name={`${WORDS.onBurgundy} / ${WORDS.hover}`} surface="burgundy">
            <Button href={there.href} variant="on-burgundy" force="hover">
              {contact.button}
            </Button>
          </State>
          <State name={`${WORDS.onBurgundy} / ${WORDS.pressed}`} surface="burgundy">
            <Button href={there.href} variant="on-burgundy" force="pressed">
              {contact.button}
            </Button>
          </State>
        </div>
      </Block>

      <Block id="C2" title="RollLink (M06)">
        <div className="grid gap-10 md:grid-cols-2">
          <State name={`${WORDS.large} / ${WORDS.rest}`}>
            <RollLink href={menu.items[1].href} tone="large" type="poster-3">
              {menu.items[1].label}
            </RollLink>
          </State>
          <State name={`${WORDS.large} / ${WORDS.hover}`}>
            <RollLink href={menu.items[1].href} tone="large" type="poster-3" forceActive>
              {menu.items[1].label}
            </RollLink>
          </State>
          <State name={`${WORDS.small} / ${WORDS.rest}`}>
            <RollLink href={site.links.github.value ?? "/"}>{site.links.github.label}</RollLink>
          </State>
          <State name={`${WORDS.small} / ${WORDS.hover}`}>
            <RollLink href={site.links.github.value ?? "/"} forceActive>
              {site.links.github.label}
            </RollLink>
          </State>
          <State name={`${WORDS.plain} / ${WORDS.rest}`}>
            <RollLink href="/" tone="plain">
              {site.navName}
            </RollLink>
          </State>
          <State name={`${WORDS.plain} / ${WORDS.hover}`}>
            <RollLink href="/" tone="plain" forceActive>
              {site.navName}
            </RollLink>
          </State>
        </div>
      </Block>

      <Block id="C3" title="Label (M05)">
        <div className="grid gap-10 md:grid-cols-2">
          <State name={WORDS.label}>
            <Label>{menu.items[1].number + " " + menu.items[1].label}</Label>
          </State>
          <State name={WORDS.tag}>
            <Label tag>{tiles[0]?.kind ?? site.blank}</Label>
          </State>
          <State name={WORDS.scrambleView}>
            <Label scramble="view">{`${site.status.prefix} ${site.status.lines[0]}`}</Label>
          </State>
          <State name={WORDS.scrambleHover}>
            <Label scramble="hover" tag>
              {about.road[2].place ?? site.blank}
            </Label>
          </State>
        </div>
      </Block>

      <Block id="C4" title="ProjectTile (M14)">
        <p className="label text-ash">{WORDS.noCover}</p>
        <div className="grid grid-cols-1 gap-10 px-4 md:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile, i) => (
            <ProjectTile
              key={tile.slug}
              href={`/work/${tile.slug}`}
              name={tile.name}
              caption={tile.caption}
              cover={tile.cover}
              index={i}
              forceActive={i === 3 ? true : undefined}
            />
          ))}
        </div>
        <p className="label text-ash">
          {WORDS.rest} 1–3 / {WORDS.hover} 4
        </p>
      </Block>

      <Block id="C5" title="WordList (M12)">
        <p className="label text-ash">{WORDS.live}</p>
        <WordList words={home.whatIBuild.words} />
      </Block>

      <Block id="C6" title="Note (M10)">
        <div className="grid gap-10 md:grid-cols-3">
          <State name={WORDS.noteClaret}>
            <Note text={home.statement.note} tilt={-3} />
          </State>
          <State name={WORDS.noteIvory} surface="burgundy">
            <Note text={home.selectedWork.note} tone="ivory" tilt={4} />
          </State>
          <State name={WORDS.scrawl}>
            <Note text={contact.finalNote} size="scrawl" tilt={-2} />
          </State>
        </div>
      </Block>

      <Block id="C7" title="Ticker (M20)">
        <Ticker items={site.ticker} />
      </Block>

      <Block id="M03" title="Line reveal">
        <RevealText as="p" text={home.closing.line.toUpperCase()} className="poster-2" />
      </Block>

      <Block id="M04" title="Font shuffle">
        <RevealText as="p" text={home.hero.nameLines.join(" ")} lines={home.hero.nameLines} shuffle className="monument" />
      </Block>

      <Block id="M07" title="Button fill">
        <p className="label text-ash">{WORDS.live}</p>
        <div className="flex flex-wrap gap-4">
          <Button href={hi.href}>{hi.label}</Button>
          <Button href={there.href} variant="ghost">
            {there.label}
          </Button>
        </div>
      </Block>

      <Block id="M08" title="Dither field">
        <DitherField drift className="flex h-dvh items-end p-6 md:p-10">
          <p className="poster-1 text-ivory">{about.opener}</p>
        </DitherField>
      </Block>

      <Block id="M11" title="Highlight sweep">
        <p className="poster-3">
          {home.closing.line.split(home.closing.highlight)[0]}
          <Highlight>{home.closing.highlight}</Highlight>
          {home.closing.line.split(home.closing.highlight).slice(1).join(home.closing.highlight)}
        </p>
      </Block>

      <Block id="M19" title="Count up">
        <div className="flex flex-wrap gap-10">
          {site.numbers.map((n) => (
            <div key={n.caption} className="flex flex-col gap-3">
              <p className="poster-1">{n.value === null ? site.blank : <CountUp value={n.value} />}</p>
              <p className="label text-ash">{n.caption}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block id="M05" title="Scramble, cycling">
        <Scramble text={`${site.status.prefix} ${site.status.lines[1]}`} trigger="both" className="label" />
      </Block>
    </>
  );
}

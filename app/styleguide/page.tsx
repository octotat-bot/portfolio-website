import type { Metadata } from "next";
import type { ReactNode } from "react";
import { caseStudies } from "@/content/projects";
import { projectMedia } from "@/lib/media";
import { tokens } from "@/lib/tokens";
import { ComponentsDemo } from "./components-demo";
import { Summary, TokenProbe, TypeProbe } from "./probes";

// A hidden development page: not linked from anywhere and not indexed.
// Every value on it is read from docs/tokens.json and checked in the browser
// against what the generated CSS actually produces.

const WORDS = {
  title: "Styleguide",
  hover: "hover or focus to play",
  breakpointOn: "active at this width",
  breakpointOff: "not active at this width",
};

export const metadata: Metadata = {
  title: WORDS.title,
  robots: { index: false, follow: false },
};

const spacingVar = (name: string) => `--spacing-${name.replace(/^space-/, "")}`;
const radiusVar = (name: string) => `--radius-${name.replace(/^radius-/, "")}`;
const firstFace = (family: string) => family.split(",")[0].trim().replace(/^"|"$/g, "");

// Written out in full so Tailwind can see the class names.
const breakpointOn: Record<string, string> = { md: "hidden md:inline", lg: "hidden lg:inline" };
const breakpointOff: Record<string, string> = { md: "md:hidden", lg: "lg:hidden" };

function Section({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-10 border-t border-line py-16">
      <h2 className="poster-4">{name}</h2>
      {children}
    </section>
  );
}

function Row({ name, value, usage, children }: { name: string; value: string; usage: string; children?: ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-line pt-4 md:grid-cols-2 md:gap-10">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="label">
          {name} <span className="text-ash">{value}</span>
        </p>
        <p className="small max-w-measure text-ash">{usage}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main id="main" className="px-4 pb-32 pt-24 md:px-10">
      <header className="flex flex-col gap-3 pb-16">
        <h1 className="poster-3">{WORDS.title}</h1>
        <p className="label text-ash">
          {tokens.name} v{tokens.version}
        </p>
        <Summary />
      </header>

      <Section name="color">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-10">
          {tokens.color.tokens.map((t) => (
            <div key={t.name} className="flex flex-col gap-2">
              <TokenProbe variant="colour" cssVar={`--color-${t.name}`} expected={t.value} />
              <p className="label">
                {t.name} <span className="text-ash">{t.value}</span>
              </p>
              <p className="small text-ash">{t.usage}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section name="type">
        {tokens.type.groups.map((group) => (
          <div key={group.name} className="flex flex-col gap-10">
            <h3 className="label text-ash">
              {group.name} / {group.family}
            </h3>
            {group.styles.map((style) => {
              const family = "family" in style && style.family ? style.family : group.family;
              const stack = tokens.type.families[family as keyof typeof tokens.type.families];
              return (
                <div key={style.name} className="flex flex-col gap-4 border-t border-line pt-4">
                  <div className="flex flex-col gap-2">
                    <p className="label">
                      {style.name}{" "}
                      <span className="text-ash">
                        {"fluid" in style && style.fluid ? style.fluid : style.fontSize} / {style.lineHeight} / {style.fontWeight}
                        {"letterSpacing" in style && style.letterSpacing ? ` / ${style.letterSpacing}` : ""}
                      </span>
                    </p>
                    <p className="small max-w-measure text-ash">{style.usage}</p>
                  </div>
                  <TypeProbe
                    style={{
                      name: style.name,
                      sample: style.sample,
                      fontSize: style.fontSize,
                      fluid: "fluid" in style ? style.fluid : undefined,
                      fluidMd: "fluidMd" in style ? style.fluidMd : undefined,
                      lineHeight: style.lineHeight,
                      fontWeight: style.fontWeight,
                      letterSpacing: "letterSpacing" in style ? style.letterSpacing : undefined,
                      textTransform: "textTransform" in style ? style.textTransform : undefined,
                      face: firstFace(stack),
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </Section>

      <Section name="spacing">
        {tokens.spacing.tokens.map((t) => (
          <Row key={t.name} name={t.name} value={t.value} usage={t.usage}>
            <TokenProbe variant="length" cssVar={spacingVar(t.name)} expected={t.value} />
          </Row>
        ))}
      </Section>

      <Section name="size">
        {tokens.size.tokens.map((t) => (
          <Row key={t.name} name={t.name} value={"valueMd" in t && t.valueMd ? `${t.value} / ${t.valueMd} from md` : t.value} usage={t.usage}>
            <TokenProbe
              variant="length"
              cssVar={spacingVar(t.name)}
              expected={t.value}
              expectedMd={"valueMd" in t ? t.valueMd : undefined}
            />
          </Row>
        ))}
      </Section>

      <Section name="radius">
        {tokens.radius.tokens.map((t) => (
          <Row key={t.name} name={t.name} value={t.value} usage={t.usage}>
            <TokenProbe variant="radius" cssVar={radiusVar(t.name)} expected={t.value} />
          </Row>
        ))}
      </Section>

      <Section name="breakpoint">
        {tokens.breakpoint.tokens.map((t) => (
          <Row key={t.name} name={t.name} value={t.value} usage={t.usage}>
            <p className="label text-ash">
              <span className={breakpointOn[t.name]}>{WORDS.breakpointOn}</span>
              <span className={breakpointOff[t.name]}>{WORDS.breakpointOff}</span>
            </p>
          </Row>
        ))}
      </Section>

      <Section name="easing">
        <p className="label text-ash">{WORDS.hover}</p>
        {tokens.easing.tokens.map((t) => (
          <Row key={t.name} name={t.name} value={t.value} usage={t.usage}>
            <button type="button" className="group block min-h-target w-full border-b border-line pr-4" aria-label={t.name}>
              <span
                className="block w-full transition-transform group-hover:translate-x-full group-focus-visible:translate-x-full motion-reduce:transition-none"
                style={{ transitionTimingFunction: `var(--${t.name})`, transitionDuration: "var(--dur-pop)" }}
              >
                <span className="block size-4 bg-ivory" />
              </span>
            </button>
          </Row>
        ))}
      </Section>

      <Section name="duration">
        <p className="label text-ash">{WORDS.hover}</p>
        {tokens.duration.tokens.map((t) => (
          <Row key={t.name} name={t.name} value={t.value} usage={t.usage}>
            <button type="button" className="group block min-h-target w-full border-b border-line pr-4" aria-label={t.name}>
              <span
                className="block w-full transition-transform group-hover:translate-x-full group-focus-visible:translate-x-full motion-reduce:transition-none"
                style={{ transitionTimingFunction: "var(--ease-out)", transitionDuration: `var(--${t.name})` }}
              >
                <span className="block size-4 bg-ivory" />
              </span>
            </button>
          </Row>
        ))}
      </Section>

      <ComponentsDemo
        tiles={caseStudies.map((p) => ({
          slug: p.slug,
          name: p.name,
          kind: p.kind,
          caption: p.study.caption,
          cover: projectMedia(p.slug).cover,
        }))}
      />
    </main>
  );
}

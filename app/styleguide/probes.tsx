"use client";

import { useEffect, useRef, useState } from "react";

// Each probe renders a token the way the site will use it (through the
// generated CSS), reads back what the browser actually computed, and compares
// that with the value written in docs/tokens.json.

const WORDS = {
  pending: "checking",
  match: "match",
  mismatch: "mismatch",
  info: "not comparable",
  computed: "computed",
  summary: (total: number, bad: number) => `${total} checks, ${bad} mismatches`,
};

type Verdict = "pending" | "match" | "mismatch" | "info";

function Readout({ verdict, computed }: { verdict: Verdict; computed: string }) {
  return (
    <p className="label flex flex-wrap items-center gap-2 text-ash" data-verdict={verdict}>
      <span>
        {WORDS.computed} {computed}
      </span>
      <span className={verdict === "mismatch" ? "bg-burgundy px-2 py-1 text-ivory" : undefined}>{WORDS[verdict]}</span>
    </p>
  );
}

const toHex = (rgb: string) => {
  const parts = rgb.match(/\d+(\.\d+)?/g);
  if (!parts || parts.length < 3) return rgb;
  return "#" + parts.slice(0, 3).map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("");
};

function useOnLayout(run: () => void) {
  useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (!cancelled) run();
    };
    go();
    document.fonts.ready.then(go);
    window.addEventListener("resize", go);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", go);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function TokenProbe({
  variant,
  cssVar,
  expected,
}: {
  variant: "colour" | "length" | "radius";
  cssVar: string;
  expected: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ verdict: Verdict; computed: string }>({ verdict: "pending", computed: "" });

  useOnLayout(() => {
    const el = ref.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const computed =
      variant === "colour" ? toHex(style.backgroundColor) : variant === "length" ? style.width : style.borderTopLeftRadius;
    const comparable = variant === "colour" || expected.endsWith("px");
    const same =
      variant === "colour"
        ? computed.toLowerCase() === expected.toLowerCase()
        : Math.abs(Number.parseFloat(computed) - Number.parseFloat(expected)) < 0.01;
    setState({ verdict: !comparable ? "info" : same ? "match" : "mismatch", computed });
  });

  return (
    <div className="flex flex-col gap-2">
      {variant === "colour" && (
        <div ref={ref} className="h-24 w-full border border-line" style={{ backgroundColor: `var(${cssVar})` }} />
      )}
      {variant === "length" && (
        <div className="max-w-full overflow-hidden">
          <div ref={ref} className="h-4 bg-ivory" style={{ width: `var(${cssVar})` }} />
        </div>
      )}
      {variant === "radius" && <div ref={ref} className="size-24 border border-ivory" style={{ borderRadius: `var(${cssVar})` }} />}
      <Readout verdict={state.verdict} computed={state.computed} />
    </div>
  );
}

export type TypeProbeStyle = {
  name: string;
  sample: string;
  fontSize: string;
  fluid?: string;
  lineHeight: number;
  fontWeight: number;
  letterSpacing?: string;
  textTransform?: string;
  /** The first face in the style's family stack, e.g. "Anton". */
  face: string;
};

// Works out what a `clamp(min, preferred, max)` from tokens.json should be at
// this viewport width. `preferred` is a sum of vw and px terms.
const expectedSize = (style: TypeProbeStyle) => {
  if (!style.fluid) return Number.parseFloat(style.fontSize);
  const inner = style.fluid.slice(style.fluid.indexOf("(") + 1, style.fluid.lastIndexOf(")"));
  const [min, preferred, max] = inner.split(",").map((part) => part.trim());
  const value = preferred
    .split("+")
    .map((term) => term.trim())
    .reduce((sum, term) => sum + (term.endsWith("vw") ? (Number.parseFloat(term) / 100) * window.innerWidth : Number.parseFloat(term)), 0);
  return Math.min(Math.max(value, Number.parseFloat(min)), Number.parseFloat(max));
};

const letters = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

export function TypeProbe({ style }: { style: TypeProbeStyle }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [rows, setRows] = useState<{ verdict: Verdict; computed: string }[]>([]);

  useOnLayout(() => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const size = Number.parseFloat(cs.fontSize);
    const want = expectedSize(style);
    const lineHeight = Number.parseFloat(cs.lineHeight) / size;
    const spacing = cs.letterSpacing === "normal" ? 0 : Number.parseFloat(cs.letterSpacing) / size;
    const wantSpacing = style.letterSpacing ? Number.parseFloat(style.letterSpacing) : 0;
    const family = cs.fontFamily.split(",")[0].trim();
    const loaded = document.fonts.check(`${cs.fontWeight} ${cs.fontSize} ${family}`);
    const verdict = (ok: boolean): Verdict => (ok ? "match" : "mismatch");

    setRows([
      { verdict: verdict(Math.abs(size - want) < 0.5), computed: `font-size ${size.toFixed(1)}px (want ${want.toFixed(1)}px)` },
      { verdict: verdict(Math.abs(lineHeight - style.lineHeight) < 0.01), computed: `line-height ${lineHeight.toFixed(3)}` },
      { verdict: verdict(Number(cs.fontWeight) === style.fontWeight), computed: `font-weight ${cs.fontWeight}` },
      { verdict: verdict(Math.abs(spacing - wantSpacing) < 0.003), computed: `letter-spacing ${spacing.toFixed(3)}em` },
      { verdict: verdict(cs.textTransform === (style.textTransform ?? "none")), computed: `text-transform ${cs.textTransform}` },
      { verdict: verdict(loaded && letters(family).includes(letters(style.face))), computed: `face ${family}${loaded ? "" : " (not loaded)"}` },
    ]);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden">
        <p ref={ref} className={style.name}>
          {style.sample}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        {rows.length === 0 ? (
          <Readout verdict="pending" computed="" />
        ) : (
          rows.map((row) => <Readout key={row.computed.split(" ")[0]} verdict={row.verdict} computed={row.computed} />)
        )}
      </div>
    </div>
  );
}

export function Summary() {
  const [counts, setCounts] = useState<{ total: number; bad: number } | null>(null);

  useEffect(() => {
    const count = () => {
      const all = document.querySelectorAll("[data-verdict]");
      const pending = document.querySelectorAll('[data-verdict="pending"]').length;
      const bad = document.querySelectorAll('[data-verdict="mismatch"]').length;
      setCounts(pending > 0 ? null : { total: all.length, bad });
    };
    const observer = new MutationObserver(count);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-verdict"] });
    count();
    return () => observer.disconnect();
  }, []);

  return (
    <p className="label text-ash" data-summary={counts ? `${counts.total}/${counts.bad}` : "pending"}>
      {counts ? WORDS.summary(counts.total, counts.bad) : WORDS.pending}
    </p>
  );
}

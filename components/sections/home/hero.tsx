"use client";

// Home 2: poster hero. Fills the first screen under the ticker. The dither
// field (M08) drifts toward the pointer. The name in `monument` rises (M03)
// then shuffles its faces (M04). A mono status line top-left cycles every 3s,
// scrambling each time (M05). Lede and two buttons bottom-right from 1025px,
// under the name below that.
// M09 lift-off: while the first screen scrolls, the name scales 1 to 1.35,
// rises 20% and fades out by 80%; the field's bottom edge rises in steps.
// With reduced motion: still field, no lift, the status line holds its first line.

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { DitherField } from "@/components/motion/dither-field";
import { RevealText } from "@/components/motion/reveal-text";
import { Scramble } from "@/components/motion/scramble";
import { Button } from "@/components/ui/button";
import { home } from "@/content/pages";
import { site } from "@/content/site";
import { useReduced } from "@/lib/hooks";
import { heroLift, statusCycle } from "@/lib/motion";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();
  const { hero } = home;
  const [see, hello] = hero.buttons;

  // M09
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, heroLift.scale]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${heroLift.rise}%`]);
  const opacity = useTransform(scrollYProgress, [0, heroLift.fadeBy], [1, 0]);
  const clipPath = useTransform(scrollYProgress, (p) => {
    const stepped = Math.floor(Math.min(1, Math.max(0, p)) * heroLift.clipSteps) / heroLift.clipSteps;
    return `inset(0 0 ${(stepped * 100).toFixed(2)}% 0)`;
  });

  // M05 status line
  const [line, setLine] = useState(0);
  useEffect(() => {
    if (reduced) {
      setLine(0);
      return;
    }
    const id = window.setInterval(() => setLine((l) => (l + 1) % site.status.lines.length), statusCycle * 1000);
    return () => window.clearInterval(id);
  }, [reduced]);
  const status = (text: string) => `${site.status.prefix} ${text}`;

  return (
    <section ref={ref} data-surface="burgundy" className="hero-height relative overflow-hidden">
      <motion.div className="absolute inset-0" style={reduced ? undefined : { clipPath }}>
        <DitherField drift className="h-full" />
      </motion.div>

      {/* On phones the bottom padding keeps the buttons clear of the floating pill. */}
      <div className="relative flex h-full flex-col justify-between px-4 pb-24 pt-24 md:px-10 md:pb-10">
        <Scramble
          as="p"
          text={status(site.status.lines[line])}
          srText={site.status.lines.map(status).join(", ")}
          className="label text-ivory"
        />

        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.div className="lg:shrink-0" style={reduced ? undefined : { scale, y, opacity, transformOrigin: "0% 100%" }}>
            <RevealText as="h1" text={hero.nameLines.join(" ")} lines={hero.nameLines} shuffle className="monument" />
          </motion.div>
          <div className="flex min-w-0 max-w-measure flex-col gap-3 lg:pb-3">
            <p className="lede text-ivory">{hero.lede}</p>
            <p className="body text-ivory">{hero.supporting}</p>
            <div className="flex flex-wrap gap-4 pt-6">
              <Button href={see.href} variant="on-burgundy">
                {see.label}
              </Button>
              <Button href={hello.href} variant="ghost">
                {hello.label}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

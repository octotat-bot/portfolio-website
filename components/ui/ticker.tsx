"use client";

// Ticker: a 40px burgundy band of running mono text, ivory `label` text with
// small ivory squares between items. Home only.
// M20: runs right to left at 60px a second, forever (CSS linear animation; its
// duration is set from the measured width). Still with reduced motion.
// The text is read once; the copies that make the loop are hidden.

import { useEffect, useRef, type CSSProperties } from "react";
import { ticker } from "@/lib/motion";

/** Enough copies of the items to cover very wide screens twice. */
const COPIES = 8;

function Run({ items, hidden }: { items: string[]; hidden?: boolean }) {
  return (
    <span className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="label px-4 text-ivory">{item}</span>
          <span className="size-2 bg-ivory" />
        </span>
      ))}
    </span>
  );
}

export function Ticker({ items, className = "" }: { items: string[]; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      // The track holds two identical halves; it moves by one half per loop.
      const half = track.scrollWidth / 2;
      track.style.setProperty("--ticker-duration", `${half / ticker.speed}s`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => observer.disconnect();
  }, [items]);

  const half = Array.from({ length: COPIES / 2 }, (_, i) => i);
  return (
    <div data-surface="burgundy" className={`flex h-ticker items-center overflow-hidden bg-burgundy ${className}`}>
      <div ref={trackRef} className="ticker-track" style={{ "--ticker-duration": "0s" } as CSSProperties}>
        {half.map((i) => (
          <Run key={`a${i}`} items={items} hidden={i > 0} />
        ))}
        {half.map((i) => (
          <Run key={`b${i}`} items={items} hidden />
        ))}
      </div>
    </div>
  );
}

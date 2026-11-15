"use client";

// M15 dither resolve. A picture rests as a two-colour dither and cross-fades
// to the real image in 500ms when `resolved` turns true (tile hover, or 60% in
// view in a case study). The dither is Paper Shaders ImageDithering layered
// over the real image, loaded lazily and mounted only once the picture is
// within a screen of the viewport (a hidden picture never gets a canvas).
// Without WebGL2 the real image shows.

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { color } from "@/lib/tokens";
import { hasWebGL2 } from "@/lib/shader-slot";

const ImageDitherCanvas = dynamic(() => import("./dither-canvas").then((m) => m.ImageDitherCanvas), { ssr: false });

type Props = {
  src: string;
  alt: string;
  resolved: boolean;
  /** The dark colour of the dither. */
  back?: "midnight" | "burgundy-deep";
  sizes: string;
  className?: string;
};

export function DitherImage({ src, alt, resolved, back = "midnight", sizes, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(false);
  const [near, setNear] = useState(false);
  useEffect(() => setSupported(hasWebGL2()), []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      rootMargin: "25% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`absolute inset-0 ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      {supported && near ? (
        <div
          aria-hidden="true"
          className="dither-resolve absolute inset-0"
          data-resolved={resolved ? "true" : "false"}
        >
          <ImageDitherCanvas src={src} back={back === "midnight" ? color.midnight : color.burgundyDeep} front={color.ivory} />
        </div>
      ) : null}
    </div>
  );
}

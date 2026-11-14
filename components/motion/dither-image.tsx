"use client";

// M15 dither resolve. A picture rests as a two-colour dither and cross-fades
// to the real image in 500ms when `resolved` turns true (tile hover, or 60% in
// view in a case study). The dither is Paper Shaders ImageDithering layered
// over the real image, loaded lazily. Without WebGL2 the real image shows.

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(hasWebGL2()), []);
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      {supported ? (
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

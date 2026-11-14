"use client";

// The Paper Shaders canvases, in their own module so they load lazily.
// API checked against @paper-design/shaders-react 0.0.82 (pinned).

import { Dithering, ImageDithering, type PaperShaderElement } from "@paper-design/shaders-react";
import type { Ref } from "react";
import { dither } from "@/lib/motion";

const fill = { position: "absolute", inset: 0 } as const;

export function DitherCanvas({
  shape,
  speed,
  frame,
  shaderRef,
}: {
  shape: "wave" | "warp";
  speed: number;
  frame: number;
  shaderRef?: Ref<PaperShaderElement>;
}) {
  return (
    <Dithering
      ref={shaderRef}
      colorBack={dither.colorBack}
      colorFront={dither.colorFront}
      shape={shape}
      type={dither.type}
      size={dither.size}
      speed={speed}
      frame={frame}
      offsetY={dither.lift}
      width="100%"
      height="100%"
      style={fill}
    />
  );
}

export function ImageDitherCanvas({ src, back, front }: { src: string; back: string; front: string }) {
  return (
    <ImageDithering
      image={src}
      colorBack={back}
      colorFront={front}
      colorHighlight={front}
      type={dither.type}
      size={dither.size}
      colorSteps={2}
      fit="cover"
      width="100%"
      height="100%"
      style={fill}
    />
  );
}

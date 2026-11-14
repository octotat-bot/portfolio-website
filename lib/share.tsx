// Share images and icons, generated at build time with next/og.
// Share image: 1200 x 630, a burgundy field, the page's headline in Anton,
// ivory (PAGES.md). Icon: "MM" in Anton, ivory on burgundy, square (ASSETS.md).
// Anton is read from assets/fonts as TTF, which next/og needs.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { color } from "@/lib/tokens";

export { siteUrl } from "./site-url";

export const shareSize = { width: 1200, height: 630 };
export const shareType = "image/png";

const anton = () => readFile(join(process.cwd(), "assets/fonts/Anton-Regular.ttf"));

/** Font size so the longest line fits the 1200px card with 80px margins. */
const fit = (lines: string[]) => {
  const longest = Math.max(...lines.map((l) => l.length));
  return Math.min(220, Math.floor(1040 / (longest * 0.48)));
};

export async function shareImage(lines: string[]) {
  const size = fit(lines);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: color.burgundy,
          color: color.ivory,
          fontFamily: "Anton",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: "0.04em" }}>{site.navName}</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: size, lineHeight: 0.92 }}>
          {lines.map((line) => (
            <div key={line} style={{ display: "flex" }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...shareSize, fonts: [{ name: "Anton", data: await anton(), style: "normal", weight: 400 }] },
  );
}

export async function iconImage(px: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: color.burgundy,
          color: color.ivory,
          fontFamily: "Anton",
          fontSize: Math.round(px * 0.62),
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        MM
      </div>
    ),
    { width: px, height: px, fonts: [{ name: "Anton", data: await anton(), style: "normal", weight: 400 }] },
  );
}

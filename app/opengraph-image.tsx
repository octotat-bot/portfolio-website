import { home } from "@/content/pages";
import { shareImage, shareSize, shareType } from "@/lib/share";

// Share image for Home: the hero name.
export const size = shareSize;
export const contentType = shareType;
export const alt = home.hero.nameLines.join(" ");

export default function Image() {
  return shareImage(home.hero.nameLines);
}

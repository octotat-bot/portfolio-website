import { lab } from "@/content/lab";
import { shareImage, shareSize, shareType } from "@/lib/share";

// Share image for Lab: the title.
export const size = shareSize;
export const contentType = shareType;
export const alt = lab.title;

export default function Image() {
  return shareImage([lab.title]);
}

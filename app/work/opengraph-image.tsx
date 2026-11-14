import { work } from "@/content/pages";
import { shareImage, shareSize, shareType } from "@/lib/share";

// Share image for Work: the page's line.
export const size = shareSize;
export const contentType = shareType;
export const alt = work.wallLine;

export default function Image() {
  // One line per sentence.
  return shareImage(work.wallLine.split(/(?<=\.) /));
}

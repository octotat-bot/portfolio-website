import { about } from "@/content/about";
import { shareImage, shareSize, shareType } from "@/lib/share";

// Share image for About: the opener.
export const size = shareSize;
export const contentType = shareType;
export const alt = about.opener;

export default function Image() {
  return shareImage(about.openerLines);
}

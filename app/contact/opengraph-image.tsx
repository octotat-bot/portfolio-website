import { contact } from "@/content/pages";
import { shareImage, shareSize, shareType } from "@/lib/share";

// Share image for Contact: the question.
export const size = shareSize;
export const contentType = shareType;
export const alt = contact.headlineLines.join(" ");

export default function Image() {
  return shareImage(contact.headlineLines);
}

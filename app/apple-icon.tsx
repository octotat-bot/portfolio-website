import { iconImage } from "@/lib/share";

// Home-screen icon: the favicon at 180px.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return iconImage(size.width);
}

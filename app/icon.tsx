import { iconImage } from "@/lib/share";

// Favicon: "MM" in Anton, ivory on burgundy, square.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return iconImage(size.width);
}

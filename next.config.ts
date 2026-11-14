import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A package-lock.json higher up the disk would otherwise be taken as the root.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;

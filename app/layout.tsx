import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { baseFaces } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: site.meta.home.title,
  description: site.meta.home.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={baseFaces}>
      <body className="body bg-midnight text-ivory antialiased">{children}</body>
    </html>
  );
}

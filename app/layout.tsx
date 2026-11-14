import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContactPill } from "@/components/shell/contact-pill";
import { Footer } from "@/components/shell/footer";
import { InlineScript } from "@/components/shell/inline-script";
import { INTRO_SCRIPT, Intro } from "@/components/shell/intro";
import { Menu } from "@/components/shell/menu";
import { MenuButton, Nav } from "@/components/shell/nav";
import { PageFrame } from "@/components/shell/page-frame";
import { Providers } from "@/components/shell/providers";
import { a11y } from "@/content/pages";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import { baseFaces, effectFaces } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: site.meta.home.title,
  description: site.meta.home.description,
  openGraph: { siteName: site.name, type: "website", locale: "en" },
  twitter: { card: "summary_large_image" },
};

// Stacking, bottom to top: page 0, pill 30, nav 40, grain 50, menu 60,
// menu button 70, intro 75, wipe 80.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${baseFaces} ${effectFaces}`} suppressHydrationWarning>
      <head>
        <InlineScript html={INTRO_SCRIPT} />
      </head>
      <body className="body bg-midnight text-ivory antialiased">
        <Providers>
          <a
            href="#main"
            className="label sr-only z-90 bg-ivory px-4 py-3 text-midnight focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            {a11y.skipToContent}
          </a>
          <Nav />
          {/* Straight after the nav name in tab order; fixed, so its place in the markup is not visible. */}
          <MenuButton />
          <PageFrame>
            {children}
            <Footer />
            <ContactPill />
          </PageFrame>
          <div aria-hidden="true" className="grain" />
          <Menu />
          <Intro />
        </Providers>
      </body>
    </html>
  );
}

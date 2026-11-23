import type { ExternalLink, Maybe } from "./types";

export type LinkId = "github" | "linkedin" | "email" | "resume";

/**
 * A number that is fetched live. `lastKnown` is a real count taken on `on`;
 * it is shown whenever the live fetch fails.
 */
export type LiveSource = {
  source: "github-contributions-this-year" | "leetcode-solved";
  user: string;
  lastKnown: { value: number; on: string };
};

export type SiteNumber = { value: Maybe<number>; caption: string; live?: LiveSource };

const links: Record<LinkId, ExternalLink> = {
  github: { label: "GitHub", value: "https://github.com/octotat-bot", kind: "url" },
  linkedin: { label: "LinkedIn", value: "https://www.linkedin.com/in/mukund-mangla/", kind: "url" },
  // The address only, no "mailto:".
  email: { label: "Email", value: "manglamukund123@gmail.com", kind: "email" },
  // The PDF in public/; replace the file (same name) to update it.
  resume: { label: "Resume", value: "/Mukund_Mangla_Resume.pdf", kind: "url" },
};

// Both are fetched live (lib/live-numbers.ts) and refreshed at most once a
// day. Leave `value` as null for a live number; set it to a whole number to
// fix a figure by hand.
const numbers: SiteNumber[] = [
  {
    value: null,
    caption: "contributions on github this year",
    live: { source: "github-contributions-this-year", user: "octotat-bot", lastKnown: { value: 386, on: "2026-11-15" } },
  },
  {
    value: null,
    caption: "leetcode problems solved",
    live: { source: "leetcode-solved", user: "Hakka123", lastKnown: { value: 254, on: "2026-11-15" } },
  },
];

export const site = {
  name: "Mukund Mangla",

  /** Blank: the site's live address, e.g. "https://mukundmangla.com". Used for share links and the sitemap. */
  url: null as Maybe<string>,
  navName: "MUKUND MANGLA",

  /** Shown wherever a figure or fact is still a blank. */
  blank: "—",

  ticker: ["now building repetite", "open to internships"],

  status: {
    prefix: "currently:",
    lines: ["building repetite", "third year, computer science", "open to internships"],
  },

  pill: { label: "say hello", href: "/contact" },

  /**
   * The menu portrait (public/me/menu.png). Each lens gets a claret ring at
   * lensX, lensY: percentages of the image's width and height. Set a lens to
   * null to leave its ring out. Measured from the photo: the two binocular lenses.
   */
  menuPortrait: {
    lenses: [
      { lensX: 39.0, lensY: 32.9 },
      { lensX: 61.2, lensY: 32.7 },
    ] as { lensX: Maybe<number>; lensY: Maybe<number> }[],
  },

  intro: {
    /**
     * The loader (M01). `words` read as one line ("need money for ferrari"),
     * which screen readers hear once; the last is the one that fills the
     * screen. `photos` live in public/intro/ (black and white, built by
     * scripts/make-intro-assets.mjs); `fx`/`fy` (0 to 1) are each picture's
     * focal point, where its cover crop is anchored. The frame order is in
     * lib/motion.ts (intro.frames).
     */
    words: ["NEED", "MONEY", "FOR", "FERRARI."],
    photos: [
      { src: "/intro/1.webp", fx: 0.5, fy: 0.5 },
      { src: "/intro/2.webp", fx: 0.52, fy: 0.62 },
      { src: "/intro/3.webp", fx: 0.5, fy: 0.42 },
      { src: "/intro/4.webp", fx: 0.38, fy: 0.6 },
    ] as { src: string; fx: number; fy: number }[],
    grain: "/intro/grain.webp",
  },

  footer: {
    line: "i build apps, agents and the things between.",
    /** Shown upside down (turned 180 degrees) in the footer. */
    ghostMarquee: "GOOD ENOUGH ISN'T.",
    copyright: "© 2026 Mukund Mangla",
  },

  links,
  numbers,

  meta: {
    home: {
      title: "Mukund Mangla · apps, agents and the things between",
      description:
        "Portfolio of Mukund Mangla, a computer science student who designs and builds web apps, iOS apps and AI tools.",
    },
    work: {
      title: "Work · Mukund Mangla",
      description: "Projects by Mukund Mangla: Repetite, Marginalia, RepoMind, BumpFix and more.",
    },
    /** `%s` is the project name. The description is the project's one-liner. */
    caseStudy: { titleTemplate: "%s · Mukund Mangla" },
    about: {
      title: "About · Mukund Mangla",
      description: "Who Mukund Mangla is, what he has built so far and what he works with.",
    },
    lab: {
      title: "Lab · Mukund Mangla",
      description: "Experiments, old builds and unfinished ideas.",
    },
    contact: {
      title: "Contact · Mukund Mangla",
      description: "Get in touch with Mukund Mangla.",
    },
    notFound: { title: "Not found · Mukund Mangla" },
  },
};

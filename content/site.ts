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
  // Blank: a URL to the resume PDF.
  resume: { label: "Resume", value: null, kind: "url" },
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
    line: "loading",
    /**
     * The loader (M01): each slide is a picture, then a word card. The words
     * read as one line; screen readers hear it once. `accent` sets the word
     * in claret. Pictures live in public/loader/ (grayscale WebP).
     */
    loaderSlides: [
      { image: "/loader/1.webp", word: "NEED MONEY" },
      { image: "/loader/2.webp", word: "FOR" },
      { image: "/loader/3.webp", word: "FERRARI.", accent: true },
    ] as { image: string; word: string; accent?: boolean }[],
  },

  footer: {
    line: "i build apps, agents and the things between.",
    ghostMarquee: "STILL BUILDING",
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
      description: "Projects by Mukund Mangla: Repetite, Marginalia, Trailboard, BumpFix and more.",
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

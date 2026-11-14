import type { ExternalLink, Maybe } from "./types";

export type LinkId = "github" | "linkedin" | "email" | "resume";

export type SiteNumber = { value: Maybe<number>; caption: string };

const links: Record<LinkId, ExternalLink> = {
  github: { label: "GitHub", value: "https://github.com/octotat-bot", kind: "url" },
  linkedin: { label: "LinkedIn", value: "https://linkedin.com/in/mukundmangla", kind: "url" },
  // Blank: the email address, e.g. "you@example.com" (no "mailto:").
  email: { label: "Email", value: null, kind: "email" },
  // Blank: a URL to the resume PDF.
  resume: { label: "Resume", value: null, kind: "url" },
};

const numbers: SiteNumber[] = [
  // Blank: GitHub contributions this year, a whole number.
  { value: null, caption: "contributions on github this year" },
  // Blank: LeetCode problems solved, a whole number.
  { value: null, caption: "leetcode problems solved" },
  { value: 2, caption: "ai internships in 2026" },
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

  intro: { line: "loading" },

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

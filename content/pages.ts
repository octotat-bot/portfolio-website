import type { LinkId } from "./site";
import type { Cta } from "./types";

// Page copy that is not a project, an About block or a Lab item.
// ASSETS.md names four content files and does not place this copy; it lives here.

export type MenuItem = { label: string; href: string; number: string; note: string };

const menuItems: MenuItem[] = [
  { label: "HOME", href: "/", number: "00", note: "start here" },
  { label: "WORK", href: "/work", number: "01", note: "the things i've built" },
  { label: "ABOUT", href: "/about", number: "02", note: "who's behind it" },
  { label: "LAB", href: "/lab", number: "03", note: "the unfinished shelf" },
  { label: "CONTACT", href: "/contact", number: "04", note: "say hello" },
];

const menuLinks: LinkId[] = ["github", "linkedin", "email"];
const footerLinks: LinkId[] = ["github", "linkedin", "email", "resume"];
const contactLinks: LinkId[] = ["github", "linkedin", "resume"];

export const menu = {
  items: menuItems,
  links: menuLinks,
  credit: "designed and built by mukund mangla",
};

/**
 * Text that is never shown but is read out by screen readers. CONTENT.md has
 * no copy for these; they follow its rule that a control says what happens.
 */
export const a11y = {
  openMenu: "open menu",
  closeMenu: "close menu",
  menu: "menu",
  skipToContent: "skip to content",
  home: "home",
};

export const footer = {
  /** The four page links, numbered: every menu item except Home. */
  pages: menuItems.filter((item) => item.href !== "/"),
  links: footerLinks,
};

export const home = {
  hero: {
    nameLines: ["MUKUND", "MANGLA"],
    lede: "i build apps, agents and the things between.",
    supporting:
      "third-year computer science student. i design it, build it, and then check that it actually works.",
    buttons: [
      { label: "See the work", href: "/work" },
      { label: "Say hello", href: "/contact" },
    ] satisfies Cta[],
  },

  statement: {
    sentence: "I BUILD THE THING, THEN I CHECK IF IT'S ACTUALLY RIGHT.",
    note: "most people skip the second part",
  },

  whatIBuild: {
    heading: "WHAT I BUILD",
    paragraph:
      "web, phone, and the ai parts in between. i care about how it looks, but i care more that it does what it says.",
    button: { label: "See the work", href: "/work" } satisfies Cta,
    words: ["INTERFACES", "IOS APPS", "BACKENDS", "AI AGENTS", "SEARCH OVER DOCUMENTS", "REAL-TIME THINGS"],
  },

  selectedWork: {
    headline: "THINGS I'VE BUILT",
    slugs: ["repetite", "marginalia", "trailboard", "bumpfix"],
    /** Sits beside the first tile. */
    note: "my main one",
  },

  closing: {
    headline: "WHERE TO NEXT?",
    line: "i'm looking for an internship where i can ship real things.",
    highlight: "ship",
    button: { label: "Say hello", href: "/contact" } satisfies Cta,
  },
};

export const work = {
  wallWord: "MAKE",
  wallLine: "MAKE IT WORK. THEN MAKE IT GOOD.",
  alsoBuiltLabel: "also built",
};

export const caseStudy = {
  factLabels: {
    kind: "kind",
    role: "role",
    builtWith: "built with",
    when: "when",
    status: "status",
    links: "links",
  },
  /** Joins the items of a "built with" list. */
  stackSeparator: " / ",
  nextLabel: "next",
  mistakeHeading: "what went wrong",
  screensComing: "screens coming",
  /** Text of a project's links. Taken from the placeholder names in CONTENT.md. */
  linkLabels: { repo: "repo", live: "live" },
};

export const contact = {
  headlineLines: ["WHERE TO", "NEXT?"],
  line: "tell me what you're building, or what's broken.",
  button: "Email me",
  links: contactLinks,
  credits: [
    { small: "written, designed and built by", big: "MUKUND MANGLA" },
    { small: "type", big: "ANTON, GEIST, REENIE BEANIE" },
    { small: "movement", big: "MOTION" },
    { small: "effects", big: "PAPER SHADERS, SKIPER UI, REACT BITS" },
    { small: "made in", big: "PALWAL, INDIA" },
  ],
  finalNote: "thanks for scrolling",
};

export const notFound = {
  headline: "NOTHING HERE",
  line: "this page doesn't exist. the rest of them do.",
  button: { label: "Back home", href: "/" } satisfies Cta,
};

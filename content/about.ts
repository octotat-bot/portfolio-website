import type { Maybe } from "./types";

export type YearCard = { year: string; title: string; text: string; place: Maybe<string> };
export type SkillGroup = { label: string; items: string[] };
export type Belief = { number: string; line: string; highlight?: string };

const road: YearCard[] = [
  {
    year: "2020",
    title: "FIRST LINE OF CODE",
    text: "wrote my first line of code.",
    place: null,
  },
  {
    year: "2023",
    title: "PASSED CLASS 12",
    text: "finished school.",
    place: null,
  },
  {
    year: "2024",
    title: "STARTED COLLEGE",
    text: "b.tech at newton school of technology.",
    // Blank: the campus city.
    place: null,
  },
  {
    year: "JUL 2026",
    title: "INTERNSHIP, MINDENIOUS",
    text: "ai/ml intern for a month. built marginalia there.",
    place: "remote",
  },
  {
    year: "AUG 2026",
    title: "INTERNSHIP, SKILLORBIT",
    text: "ai intern. built a resume analyser as the final project.",
    place: "remote",
  },
  {
    year: "NOW",
    title: "BUILDING REPETITE",
    text: "got tired of two apps for one day, so i'm building my own. it's in friends' hands now.",
    place: "palwal, india",
  },
];

const skillGroups: SkillGroup[] = [
  { label: "interfaces", items: ["react", "next.js", "tailwind", "motion"] },
  { label: "ios", items: ["swiftui", "healthkit", "swiftdata"] },
  { label: "backends", items: ["node.js", "express", "mongodb", "docker", "websockets"] },
  { label: "ai", items: ["python", "pytorch", "langchain", "retrieval", "vector databases"] },
];

const beliefs: Belief[] = [
  { number: "001", line: "BUILD IT FOR YOURSELF FIRST" },
  { number: "002", line: "A DEMO IS NOT A PRODUCT", highlight: "PRODUCT" },
  { number: "003", line: "CHECK WHAT THE MODEL SAYS. THEN CHECK AGAIN" },
  { number: "004", line: "TUTORIALS END. PROJECTS DON'T" },
  { number: "005", line: "POLISH IS A FEATURE", highlight: "FEATURE" },
  { number: "006", line: "TELL ME IT'S BAD. I'D RATHER KNOW" },
];

export const about = {
  /** Two lines at every width. */
  opener: "MAKE THE THING.",
  openerLines: ["MAKE THE", "THING."],

  bio: {
    heading: "HI, I'M MUKUND",
    paragraphs: [
      "i'm a third-year computer science and ai student at newton school of technology, graduating in 2028.",
      "i started with websites, moved to full apps, and now spend most of my time on the parts where software has to think. along the way i got picky about how things look and feel.",
      "i'm from palwal, haryana, where i also run a shop. that's where i learned that nothing you build matters until somebody actually uses it.",
    ],
  },

  /** Section heading: the CONTENT.md section name, as the tokens.json poster-3 sample. */
  roadHeading: "THE ROAD SO FAR",
  road,

  skills: {
    heading: "WHAT I WORK WITH",
    /** The words that drop, each once. */
    words: [
      "REACT",
      "NEXT.JS",
      "SWIFTUI",
      "NODE.JS",
      "EXPRESS",
      "MONGODB",
      "DOCKER",
      "PYTHON",
      "PYTORCH",
      "LANGCHAIN",
      "YJS",
      "HEALTHKIT",
    ],
    groups: skillGroups,
    /** Joins the items of a stack line. */
    separator: " / ",
  },

  /** Section heading: the CONTENT.md section name. */
  beliefsHeading: "THINGS I BELIEVE",
  beliefs,
};

import type { Maybe } from "./types";

export type YearCard = { year: string; title: string; text: string; place: Maybe<string> };
export type SkillGroup = { label: string; items: string[] };
/** A belief: its line in Anton, ending on one word in the handwritten note face. */
export type Belief = { number: string; line: string; hand: string };

const road: YearCard[] = [
  {
    year: "2020",
    title: "FIRST LINE OF CODE",
    text: "Wrote my first line of code.",
    place: null,
  },
  {
    year: "2023",
    title: "PASSED CLASS 12",
    text: "Finished school.",
    place: null,
  },
  {
    year: "2024",
    title: "STARTED COLLEGE",
    text: "B.Tech in Computer Science & AI at Newton School of Technology.",
    // Blank: the campus city.
    place: null,
  },
  {
    year: "JUL 2026",
    title: "INTERNSHIP, MINDENIOUS",
    text: "AI/ML intern for a month. Built Marginalia there.",
    place: "remote",
  },
  {
    year: "AUG 2026",
    title: "INTERNSHIP, SKILLORBIT",
    text: "AI intern. Built a resume analyser as the final project.",
    place: "remote",
  },
  {
    year: "NOW",
    title: "BUILDING REPETITE",
    text: "Got tired of using two apps for one day, so I'm building my own. It's in friends' hands now.",
    place: null,
  },
];

const skillGroups: SkillGroup[] = [
  { label: "interfaces", items: ["react", "next.js", "tailwind", "motion"] },
  { label: "ios", items: ["swiftui", "healthkit", "swiftdata"] },
  { label: "backends", items: ["node.js", "express", "mongodb", "docker", "websockets"] },
  { label: "ai", items: ["python", "pytorch", "langchain", "retrieval", "vector databases"] },
];

const beliefs: Belief[] = [
  { number: "001", line: "BUILD IT FOR YOURSELF", hand: "first" },
  { number: "002", line: "A DEMO IS NOT A", hand: "product" },
  { number: "003", line: "POLISH IS A", hand: "feature" },
  { number: "004", line: "TELL ME IT'S BAD. I'D RATHER", hand: "know" },
];

export const about = {
  /** Two lines at every width. */
  opener: "MAKE THE THING.",
  openerLines: ["MAKE THE", "THING."],

  /** The first screen: who, in one line, and three quick facts beside the photo. */
  hero: {
    label: "ABOUT",
    heading: "I'M MUKUND.",
    line: "I build apps, agents and the things between.",
    facts: ["3rd-year CS & AI", "Newton School of Technology", "Open to internships"],
  },

  bio: {
    label: "THE SHORT VERSION",
    paragraphs: [
      "I'm a third-year Computer Science & AI student at Newton School of Technology, class of 2028. I like taking an idea all the way: design it, build it, then check that it actually works.",
      "Most of what I build sits where software has to think. Marginalia answers questions from a PDF and cites the exact page. RepoMind does the same for a whole codebase, down to the file and line. BumpFix repairs a project when a dependency update breaks it.",
      "My main project is Repetite, an iPhone app that tracks training and food in one place. I built it because I was tired of juggling two apps, and it's in friends' hands now.",
      "I've done two AI internships, at Mindenious and SkillOrbit. Next, I want one where I can ship real things with people better than me.",
    ],
    /** Handwritten beside the paragraphs: how every project goes. */
    quote: "design it, build it, check it",
  },

  /** The numbers strip: the two live figures from content/site.ts, then these. */
  numbers: {
    projects: "projects with a case study",
    internships: "internships",
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

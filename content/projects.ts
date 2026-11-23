import type { Maybe } from "./types";

// One entry per project, in the order they appear on the Work page.
// `null` is a blank from CONTENT.md: the UI hides it or shows a dash.
//
// Pictures need no entry here. Drop files into public/projects/<slug>/
// (cover.jpg, shot-01.jpg …, demo.mp4) and they are picked up at build time.
// A screen's caption, if it should have one, goes in `screenCaptions` in the
// same order as the files (shot-01 first).

export type StoryBlock = {
  heading: string;
  body: Maybe<string>;
  /** One word of the body that gets the highlight sweep. Optional. */
  highlight?: string;
};

export type ProjectLinks = {
  repo?: Maybe<string>;
  live?: Maybe<string>;
};

export type CaseStudy = {
  status: Maybe<string>;
  /** Typed onto the project tile. */
  caption: string;
  role: string;
  lede: string;
  story: StoryBlock[];
  number: { value: Maybe<number>; caption: Maybe<string> };
  /** The "what went wrong" paragraph. */
  mistake: Maybe<string>;
  note: string;
  /** Optional captions for shot-01, shot-02 … in order. */
  screenCaptions?: Maybe<string>[];
  /**
   * False while a project has nothing to show yet. The case study then shows
   * only its lede and the story block named in `showWhileBuilding`.
   */
  hasResults: boolean;
  showWhileBuilding?: string;
};

export type Project = {
  slug: string;
  name: string;
  /** The tag. */
  kind: string;
  year: Maybe<string>;
  oneLiner: string;
  /** A `null` item is a part of the stack that is still a blank. */
  builtWith: Maybe<string>[];
  links: ProjectLinks;
  /** Present for projects that have a tile and a case study. */
  study?: CaseStudy;
};

export const projects: Project[] = [
  {
    slug: "repetite",
    name: "Repetite",
    kind: "iOS app",
    year: "2026",
    oneLiner: "an ios app that tracks your training and your food in one place.",
    builtWith: ["swiftui", "healthkit", "swiftdata"],
    links: { repo: "https://github.com/octotat-bot/Repetite" },
    study: {
      status: "in friends' hands, not on the app store yet",
      caption: "training and food, one ios app",
      role: "design and build, solo",
      lede: "i wanted one app for my workouts and my meals instead of two that don't talk to each other. so i built it.",
      story: [
        {
          heading: "WHY IT EXISTS",
          body: "every tracker i tried was either a workout app with food bolted on, or the other way round. repetite treats them as one day.",
        },
        {
          heading: "LOGGING FOOD FAST",
          body: "type what you ate and it works out the macros. it checks a large built-in food database first, including indian food, and only asks a model when the database has no answer. you can adjust the portion before it's saved.",
        },
        {
          heading: "TWO MODELS, TWO JOBS",
          body: "simple entries go to a fast model so logging feels instant. harder ones go to a slower, more careful model. speed where it's safe, accuracy where it matters.",
        },
        {
          heading: "A DAY THAT STARTS WHEN YOU DO",
          body: "the day resets at 5:30 am by default, not midnight, and you can change it. late dinners count for the day you ate them.",
        },
      ],
      number: { value: null, caption: null },
      mistake: null,
      note: "started it for myself",
      hasResults: true,
    },
  },
  {
    slug: "marginalia",
    name: "Marginalia",
    kind: "AI tool",
    year: "2026",
    oneLiner: "ask a question about any pdf and get the answer from the document itself.",
    builtWith: [null],
    links: { repo: "https://github.com/octotat-bot/Marginalia", live: "https://marginalia-main.streamlit.app" },
    study: {
      status: null,
      caption: "ask a pdf a question",
      role: "design and build, during an internship at mindenious",
      lede: "built in a month during my internship at mindenious. you upload a pdf, ask something, and it answers from what the document actually says.",
      story: [
        {
          heading: "THE PROBLEM",
          body: "long documents, short patience. searching for a word doesn't help when you don't know which word to search for.",
        },
        {
          heading: "HOW IT ANSWERS",
          body: "the document is split into passages. your question pulls out the few passages that matter, and the answer is written only from those.",
        },
        { heading: "KEEPING IT HONEST", body: null },
      ],
      number: { value: null, caption: null },
      mistake: null,
      note: "reads so you don't have to",
      hasResults: true,
    },
  },
  {
    slug: "trailboard",
    name: "Trailboard",
    kind: "Web app",
    year: null,
    oneLiner: "a whiteboard several people can draw on at the same time.",
    builtWith: ["yjs", "websockets", null],
    links: { repo: "https://github.com/octotat-bot/TrailBoard", live: null },
    study: {
      status: null,
      caption: "one whiteboard, many hands",
      role: "design and build, solo",
      lede: "a shared whiteboard where everyone's strokes show up for everyone else as they happen, and nobody's work gets overwritten.",
      story: [
        {
          heading: "THE HARD PART",
          body: "two people drawing at once is easy. two people editing the same thing at once is where it breaks.",
        },
        {
          heading: "HOW IT STAYS IN SYNC",
          body: "every change is stored in a way that can be merged in any order and still give the same board. the server only passes changes along; it never has to decide who wins.",
        },
        {
          heading: "RUNNING IT MYSELF",
          body: "the sync server is my own, not a hosted service.",
        },
      ],
      number: { value: null, caption: null },
      mistake: null,
      note: "no one overwrites anyone",
      hasResults: true,
    },
  },
  {
    slug: "bumpfix",
    name: "BumpFix",
    kind: "AI agent",
    year: "2026",
    oneLiner: "an agent that repairs your code after a dependency update breaks it.",
    builtWith: [null],
    links: { repo: "https://github.com/octotat-bot/Bumpfix" },
    study: {
      status: "still building",
      caption: "fixes what the update broke",
      role: "design and build, solo",
      lede: "you update a package, forty things break, and you spend the afternoon reading a changelog. bumpfix is meant to do that afternoon for you.",
      story: [
        {
          heading: "THE IDEA",
          body: "read what changed in the new version, find the places in your code that depend on the old behaviour, rewrite them, run the tests.",
        },
        { heading: "WHERE IT IS NOW", body: null },
        { heading: "HOW I'LL KNOW IT WORKS", body: null },
      ],
      number: { value: null, caption: null },
      mistake: null,
      note: "still building this",
      // Flip to true once there are results; the full case study then shows.
      hasResults: false,
      showWhileBuilding: "WHERE IT IS NOW",
    },
  },
  {
    // From the RepoMind repository's description and its cover image.
    slug: "repomind",
    name: "RepoMind",
    kind: "AI tool",
    year: "2026",
    oneLiner: "ask questions about any github repo and get answers that cite exact files and line ranges.",
    builtWith: ["tree-sitter", "faiss", "ollama"],
    links: {
      repo: "https://github.com/octotat-bot/RepoMind",
      live: "https://repomind-eight-mu.vercel.app",
    },
    study: {
      status: null,
      caption: "ask a repo a question",
      role: "design and build, solo",
      lede: "understand any codebase in minutes, not weeks. import a repository, ask in plain english, and the answer comes from the code itself, with the exact file and lines it came from.",
      story: [
        {
          heading: "HOW IT ANSWERS",
          body: "the code is split along its real boundaries with tree-sitter, so every piece is a whole function or class. a question finds the closest pieces with faiss, and the answer streams back citing the file and line range for each claim.",
        },
        {
          heading: "LOCAL BY DEFAULT",
          body: "it runs on ollama on your own machine: no openai key, and nothing about the code leaves the laptop.",
        },
        {
          heading: "SEEING THE SHAPE",
          body: "an architecture graph shows how the modules depend on each other, which makes dead code and circular dependencies easy to spot.",
        },
      ],
      number: { value: null, caption: null },
      mistake: null,
      note: "every answer cites its lines",
      hasResults: true,
    },
  },
  {
    slug: "smartresume",
    name: "SmartResume",
    kind: "Web app",
    year: null,
    oneLiner: "upload a resume, get a score, the keywords it's missing for a role, and what to fix.",
    builtWith: ["react", "node", "express", "mongodb", "gemini"],
    links: {
      repo: "https://github.com/octotat-bot/SmartResume",
      live: "https://smartresume-rouge.vercel.app",
    },
  },
];

export type ProjectWithStudy = Project & { study: CaseStudy };

/** The projects that have a tile and a case study, in order. */
export const caseStudies = projects.filter((p): p is ProjectWithStudy => p.study !== undefined);

/** The projects listed under "also built". */
export const alsoBuilt = projects.filter((p) => p.study === undefined);

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

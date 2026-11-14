import type { Maybe } from "./types";

export type LabStatus = "live" | "shelved" | "idea" | "old";

export type LabItem = {
  name: string;
  status: Maybe<LabStatus>;
  line: Maybe<string>;
  /** Omit when the item has no link. `null` when the link is still a blank. */
  link?: Maybe<string>;
  /**
   * Set to true once Mukund has confirmed the item exists and should be
   * public. Unconfirmed items show in development and are left out of the
   * production build.
   */
  confirmed: boolean;
};

const items: LabItem[] = [
  {
    name: "DreamSignal",
    status: "live",
    // Blank: one line about it.
    line: null,
    link: "https://dream-signal.vercel.app",
    confirmed: false,
  },
  {
    name: "Retrieval drift detector",
    status: "idea",
    line: "notices when a document search system starts returning worse results than it used to.",
    confirmed: false,
  },
  {
    name: "LLM router",
    status: "idea",
    line: "sends each request to the cheapest model that can handle it.",
    confirmed: false,
  },
  {
    name: "Volatility forecast",
    status: "shelved",
    line: "predicting how much a stock will move, not where. tested the honest way, one step forward at a time.",
    confirmed: false,
  },
  {
    name: "Project Seal",
    // Blank: live, shelved, idea or old.
    status: null,
    line: "scores how good a research question is and whether its answer can be checked.",
    confirmed: false,
  },
  {
    name: "Notora",
    // Blank: live, shelved, idea or old.
    status: null,
    line: "a notes and documentation app.",
    confirmed: false,
  },
  {
    name: "Older builds",
    status: "old",
    line: "griefcompanion, ember, habitflow, balancio, ops-pilot.",
    // Blank: links to the older builds.
    link: null,
    confirmed: false,
  },
];

/** What the shelf shows: everything in development, confirmed items only in production. */
export const visibleLabItems = (all: LabItem[] = items) =>
  process.env.NODE_ENV === "production" ? all.filter((item) => item.confirmed) : all;

export const lab = {
  title: "LAB",
  lede: "half-built things, old things, and ideas i haven't earned the right to call projects yet.",
  note: "handle with care",
  items,
};

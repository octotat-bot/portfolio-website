// Server only. Fetches the live figures for Home's Numbers section.
// Each fetch is cached and refreshed at most once a day (Next.js `fetch`
// revalidation), so Home stays a static page. If a fetch fails or the answer
// cannot be read, the number's last known real count is used instead.

import type { LiveSource, SiteNumber } from "@/content/site";
import { site } from "@/content/site";

/** Seconds between refreshes: one day. Home's `revalidate` must match. */
export const LIVE_REVALIDATE = 86400;

const TIMEOUT = 8000;
const CLIENT = "portfolio-site";

/** GitHub: the year's total from the public contributions calendar. */
async function githubContributionsThisYear(user: string): Promise<number | null> {
  const year = new Date().getUTCFullYear();
  const url = `https://github.com/users/${encodeURIComponent(user)}/contributions?from=${year}-01-01&to=${year}-12-31`;
  const res = await fetch(url, {
    headers: { "User-Agent": CLIENT },
    signal: AbortSignal.timeout(TIMEOUT),
    next: { revalidate: LIVE_REVALIDATE },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const match = html.match(new RegExp(`([\\d,]+)\\s+contributions?\\s+in\\s+${year}`));
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

/** LeetCode: accepted problems, all difficulties, from its public GraphQL endpoint. */
async function leetcodeSolved(user: string): Promise<number | null> {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": CLIENT,
      Referer: `https://leetcode.com/u/${encodeURIComponent(user)}/`,
    },
    body: JSON.stringify({
      query: "query($u:String!){matchedUser(username:$u){submitStatsGlobal{acSubmissionNum{difficulty count}}}}",
      variables: { u: user },
    }),
    signal: AbortSignal.timeout(TIMEOUT),
    next: { revalidate: LIVE_REVALIDATE },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    data?: { matchedUser?: { submitStatsGlobal?: { acSubmissionNum?: { difficulty: string; count: number }[] } } };
  };
  const all = json.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum?.find((d) => d.difficulty === "All");
  return typeof all?.count === "number" ? all.count : null;
}

async function fetchLive(live: LiveSource): Promise<number> {
  try {
    const value =
      live.source === "github-contributions-this-year"
        ? await githubContributionsThisYear(live.user)
        : await leetcodeSolved(live.user);
    return value ?? live.lastKnown.value;
  } catch {
    return live.lastKnown.value;
  }
}

/** Every number with its value filled in: fixed values as they are, live ones fetched. */
export async function resolveNumbers(): Promise<SiteNumber[]> {
  return Promise.all(
    site.numbers.map(async (n) => (n.value === null && n.live ? { ...n, value: await fetchLive(n.live) } : n)),
  );
}

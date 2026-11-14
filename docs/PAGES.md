# Pages

Seven routes. Each page has one idea, one or two burgundy moments, and at most three typed notes. Motion IDs refer to `MOTION.md`; copy refers to the matching heading in `CONTENT.md`.

| Route | Page | The one idea |
| --- | --- | --- |
| `/` | Home | A poster that assembles itself |
| `/work` | Work | A wall of one word behind the projects |
| `/work/[slug]` | Case study | One project told straight |
| `/about` | About | The years as a strip you scroll sideways |
| `/lab` | Lab | The unfinished shelf |
| `/contact` | Contact | One question, then the credits |
| not found | 404 | Two words and a way home |

## On every page

- **Nav** (56px, fixed, over content): name at left as a RollLink, menu button at right. Text uses `mix-blend-mode: difference` so it reads on midnight, burgundy and ivory.
- **Takeover menu** (M21): full-screen, five poster-size links stacked at left (Home, Work, About, Lab, Contact), a claret dot marking the current page, a typed note on the right for the hovered link, small RollLinks for GitHub, LinkedIn and Email along the bottom. Full spec in `MOTION.md`.
- **Floating contact pill** (M23), except on Contact. It fades out while the Home hero buttons, the Home closing button or the footer are on screen.
- **Grain** (M22), **smooth scroll** (M25), **burgundy wipe** on navigation (M02).
- **Nav zone**: tiles, cards and images fade out as they scroll into the top 120px, so nothing passes under the nav (see `MOTION.md`).
- **Footer**: three columns on desktop, stacked on phones. Left: name in `poster-4` and one line. Middle: the four page links, numbered. Right: GitHub, LinkedIn, Email, Resume. Under them a hairline, then the copyright in `label`. Last, a full-width ghost marquee in `line` colour that speeds up with scroll (M20 variant).

## Home `/`

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 0 | Intro | Full screen, first visit per session | M01, then M02 lifts it away |
| 1 | Ticker | 40px band above the nav area | Ticker, M20 |
| 2 | Poster hero | At least 100dvh. Dither field fills the screen. Name in `monument`, bottom-left, edge to edge: MUKUND / MANGLA on two lines on phones, MUKUND MANGLA on one line from 810px. A mono status line top-left under the nav. Lede and two buttons in the open space above the name, at the right from 810px | M08 with pointer drift, M03 then M04 on the name, M05 on the status line (cycles every 3s; screen readers get the first line only), M09 on scroll, Button M07 |
| 3 | Statement | 150vh tall with the sentence sticky at mid-screen, midnight. One sentence in `poster-3`, left-aligned, with one typed Note under it | M26, then M10 on the note |
| 4 | What i build | Pinned split. Left 40%: `poster-4` heading, a short paragraph, a ghost button to Work. Right 60%: WordList | M12, M03 on the heading |
| 5 | Selected work | From 810px: pinned title for 250vh, headline in `poster-1` centred, four ProjectTiles drift past, at most two over the headline at once. Below 810px: the headline on its own, the note, then the four tiles as a card stack. Text never sits on other text | M13 (desktop), M27 (phones), M14, M15; one Note beside the first tile on desktop, under the headline on phones (M10) |
| 6 | Numbers | Full-bleed burgundy dither field. Three figures in a row (stacked on phones): number in `poster-1`, caption in `label`. Shown only when at least two figures have values; otherwise the whole section is left out. A single blank figure among them shows a dash | M08, M19 |
| 7 | Closing | 90dvh, midnight. `poster-1` question, one line, primary button to Contact | M03, M11 on one word |
| 8 | Footer | | |

## Work `/work`

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 1 | Word wall | Fixed, full screen, behind everything | M16 |
| 1b | Cursor trail | Desktop only, once at least two covers exist. Project covers drop behind the pointer over empty page area | M30 |
| 2 | Tiles | Starts one screen down. Two columns on desktop with the right column offset 30vh lower; one column on phones. Six ProjectTiles, larger than on Home (min 320px wide), each with a tag Label and year under it. Below 810px the tiles become a card stack | M14, M15, M03 on names, M27 on phones |
| 3 | Also built | Hairline list on midnight: name in `poster-4`, one line in `body`, RollLink at right | M03 per row |
| 4 | Footer | | |

## Case study `/work/[slug]`

One template for Repetite, Marginalia, Trailboard and BumpFix. Generated statically from a data file.

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 0 | Progress | 2px line fixed at the very top | M29 |
| 1 | Header band | 50dvh burgundy dither field. Tag Label top-left. Project name in `monument`, bottom-left, may run off the right edge | M08, M03, M04 |
| 2 | Lede and facts | Two columns. Left 30%: facts as a mono definition list (kind, role, built with, when, status, links as RollLinks). Right: the lede in `lede` | M05 on the fact labels |
| 3 | Story | Blocks of a `poster-4` heading with `body` text under it, max 60 characters wide, right-aligned column on desktop. One word per block may carry a highlight sweep | M03, M11 |
| 4 | Proof | One or two screens: full-width, one per row with a `small` caption. Three or more: a parallax gallery. Media uses `radius-sm`. Until real media exists: empty frames with a hairline and the label "screens coming" | M15, M28 |
| 5 | One number, one mistake | Two cells side by side on a hairline grid: a figure in `poster-2` with a caption, and a short paragraph headed "what went wrong" | M19 |
| 6 | Note | One typed Note | M10 |
| 7 | Next project | Full-bleed link block: "next" label and the next project's name in `poster-1`; fills burgundy on hover | M07 scaled up |
| 8 | Footer | | |

## About `/about`

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 1 | Opener | 100dvh burgundy dither field. One line in the `scribble` style, centred, three words. Below 810px, one word per line | M08, M03 |
| 2 | Bio | Midnight. Left: `poster-3` heading. Right: three short paragraphs in `lede` then `body` | M03 |
| 3 | The road so far | Pinned year strip, six cards. Each card: year in `poster-1`, title in `poster-4`, two lines of `body`, a mono place label | M17 |
| 4 | What i work with | Burgundy dither field, 100dvh. `poster-4` heading top-left. Skill words drop and pile. Under the pile area on desktop, four mono stack lines (one per group) | M18 |
| 5 | Things i believe | Midnight. Numbered hairline list, number in `label`, line in `poster-4` | M03 per row, M11 on one word in two of the rows |
| 6 | Footer | | |

## Lab `/lab`

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 1 | Title | `monument` word, a `lede` line under it, a Note | M03, M04, M10 |
| 2 | Shelf | Loose grid of small cards (three across desktop, one on phones), slightly different tilts. Each: status tag (Label), name in `poster-4`, one line, optional RollLink. Card fields alternate `midnight-raised` and `burgundy-deep` | M14, M05 on tags |
| 3 | Footer | | |

## Contact `/contact`

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 1 | The question | 100dvh, midnight. `monument` question on two lines. Under it one `lede` line, the email address as selectable text in `poster-4`, a primary button, three RollLinks | M03, M04, M07, M06 |
| 2 | Credits | Burgundy dither field, 100dvh, pinned. Credit lines crawl up and away in perspective; ends on a typed Note | M08, M24, M10 |
| 3 | Footer (short) | Copyright line only | |

## 404

Midnight. `monument` two-word headline, one `body` line, a primary button home. M03, M04.

## Page titles and descriptions

Set per page from `CONTENT.md` → "Page titles". Generate the share image (1200 x 630) in code: burgundy field, the page's headline in Anton, ivory.

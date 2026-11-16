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

- **Nav** (56px, fixed, over content): name at left as a RollLink, menu button at right. A 20px page mark (G4) sits just right of the name. Text uses `mix-blend-mode: difference` so it reads on midnight, burgundy and ivory.
- **Takeover menu** (M21): full-screen, five poster-size links stacked at left (Home, Work, About, Lab, Contact), a claret dot marking the current page, and small RollLinks for GitHub, LinkedIn and Email with the credit line along the bottom-left. From 810px the right half is a collage: the portrait (`public/me/menu.png`) with a poster-shape composition behind it and a claret ring on each lens, changing per hovered link, and the link's number and typed note under it. On phones, links only. Full spec in `MOTION.md`.
- **Floating contact pill** (M23), except on Contact. It fades out while the Home hero buttons, the Home closing button, the About stack lines or the footer are on screen.
- **Grain** (M22), **smooth scroll** (M25), **burgundy wipe** on navigation (M02).
- **Nav zone**: tiles, cards and images fade out as they scroll into the top 120px, so nothing passes under the nav (see `MOTION.md`).
- **Footer**: three columns on desktop, stacked on phones. Left: name in `poster-4` and one line. Middle: the four page links, numbered. Right: GitHub, LinkedIn, Email, Resume. Under them a hairline, then the copyright in `label`. Last, a full-width ghost marquee in `line` colour that speeds up with scroll (M20 variant).

## Home `/`

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 0 | Intro | Full screen, first visit per session | M01, ending in its own shutter |
| 1 | Ticker | 40px band above the nav area | Ticker, M20 |
| 2 | Poster hero | At least 100dvh. Dither field fills the screen. Name in `monument`, bottom-left, edge to edge: MUKUND / MANGLA on two lines on phones, MUKUND MANGLA on one line from 810px. A mono status line top-left under the nav. Lede and two buttons in the open space above the name, at the right from 810px | M08 with pointer drift, M03 then M04 on the name, M05 on the status line (cycles every 3s; screen readers get the first line only), M09 on scroll, Button M07 |
| 3 | Statement | 280vh, the stage pinned, midnight. The sentence in `poster-3` in two beats, left; a poster-shape composition right (above the text on phones); the typed Note under the sentence. With reduced motion: nothing pinned, every word checked, the block straight | M26 (two beats), G1, G3, then M10 on the note |
| 4 | What i build | Pinned split. Left 40%: `poster-4` heading, a short paragraph, a ghost button to Work. Right 60%: WordList | M12, M03 on the heading |
| 5 | Selected work | From 810px: pinned title for 250vh, headline in `poster-1` centred, four ProjectTiles drift past, at most two over the headline at once. Below 810px: the headline on its own, the note, then the four tiles as a card stack. Text never sits on other text | M13 (desktop), M27 (phones), M14, M15; one Note beside the first tile on desktop, under the headline on phones (M10) ; tiles without a cover show their project composition (G1, G3) |
| 6 | Numbers | Full-bleed burgundy dither field. Two figures in a row (stacked on phones): GitHub contributions this year and LeetCode problems solved, both fetched live. Number in `poster-1`, caption in `label`. Shown only when at least two figures have values; otherwise the whole section is left out. A single blank figure among them shows a dash | M08, M19 |
| 7 | Closing | 90dvh, midnight. `poster-1` question, one line, primary button to Contact. A poster-shape composition fills the empty right half from 1025px, under the question; below 1025px it sits under the button | M03, M11 on one word, G1, G2 (desktop), G3 |
| 8 | Footer | | |

## Work `/work`

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 1 | Word wall | Fixed, behind everything, from 88px down (the top `nav-band` stays clear for the nav) to the bottom of the screen | M16 |
| 1b | Cursor trail | Desktop only, once at least two covers exist. Project covers drop behind the pointer over empty page area | M30 |
| 2 | Tiles | Starts one screen down. Two columns on desktop with the right column offset 30vh lower; one column on phones. Six ProjectTiles, larger than on Home (min 320px wide), each with a tag Label and year under it. Below 810px the tiles become a card stack A tile with no cover shows its project's poster-shape composition (G1, G3) above the name band; a real cover replaces it | M14, M15, M03 on names, M27 on phones |
| 3 | Also built | Hairline list on midnight: name in `poster-4`, one line in `body`, RollLink at right | M03 per row |
| 4 | Footer | | |

## Case study `/work/[slug]`

One template for Repetite, Marginalia, Trailboard and BumpFix. Generated statically from a data file.

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 0 | Progress | 2px line fixed at the very top | M29 |
| 1 | Header band | 50dvh burgundy dither field. Tag Label top-left. Project name in `monument`, bottom-left, may run off the right edge. The project's poster-shape composition (ivory and `line` only) fills the empty space: right of the name when there is room, otherwise above it on the right | M08, M03, M04, G1, G3 |
| 2 | Lede and facts | Two columns. Left 30%: facts as a mono definition list (kind, role, built with, when, status, links as RollLinks). Right: the lede in `lede` | M05 on the fact labels |
| 3 | Story | Blocks of a `poster-4` heading with `body` text, max 60 characters wide. From 810px each block is two columns: the heading on the left stays pinned while its paragraph scrolls on the right. Phones: one column. One word per block may carry a highlight sweep | M03, M11 |
| 4 | Proof | One or two screens: full-width, one per row with a `small` caption. Three or more: a parallax gallery. Media uses `radius-sm`. With no screens and no video the whole section is left out of the production site; in development it shows empty frames with a hairline and the label "screens coming" | M15, M28 |
| 5 | One number, one mistake | Two cells side by side on a hairline grid: a figure in `poster-2` with a caption, and a short paragraph headed "what went wrong" | M19 |
| 6 | Note | One typed Note | M10 |
| 7 | Next project | Full-bleed link block: "next" label and the next project's name in `poster-1`; fills burgundy on hover | M07 scaled up |
| 8 | Footer | | |

## About `/about`

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 1 | Opener | 100dvh burgundy dither field. MAKE THE / THING. in `poster-1`, centred, on two lines at every width | M08, M03, then M04 (shuffles through the scribble faces and settles on Anton) |
| 2 | Bio | Midnight. Left: `poster-3` heading, and from 810px a small poster-shape composition in the empty space under it. Right: three short paragraphs in `lede` then `body` | M03, G1, G3 |
| 3 | The road so far | Pinned year strip, six cards. Each card: year in `poster-1`, title in `poster-4`, two lines of `body`, a mono place label | M17 |
| 4 | What i work with | Burgundy dither field, at least 100dvh. `poster-4` heading top-left. Skill words in `poster-3` drop and pile, filling about the lower 40% on desktop. Under the pile area on desktop, four mono stack lines (one per group), never covered by the floating pill | M18 |
| 5 | Things i believe | Midnight. Numbered hairline list, number in `label`, line in `poster-4` | M03 per row, M11 on one word in two of the rows |
| 6 | Footer | | |

## Lab `/lab`

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 1 | Title | `monument` word, a `lede` line under it, a Note | M03, M04, M10 |
| 2 | Shelf | Loose grid of small cards (three across from 1025px, two from 810px, one on phones), slightly different tilts. Each: status tag (Label), name in `poster-4`, one line, optional RollLink; blanks are left out. Card fields alternate `midnight-raised` and `burgundy-deep`. Only items marked `confirmed` in `content/lab.ts` appear in production; with none confirmed the shelf is left out | M14, M05 on tags |
| 3 | Footer | | |

## Contact `/contact`

| # | Section | Layout | Components and motion |
| --- | --- | --- | --- |
| 1 | The question | 100dvh, midnight. `poster-1` question on two lines (WHERE TO / NEXT?). Under it one `lede` line, the email address as selectable text in `poster-4`, a primary button, and RollLinks for GitHub, LinkedIn and Resume. The email text and button are absent while the email is blank; the resume link is absent while its URL is blank A poster-shape composition fills the empty right side from 1025px; below that it sits under the links | M03, M04, M07, M06, G1, G2 (desktop), G3 |
| 2 | Credits | Burgundy dither field, pinned for 300vh. Credit lines crawl up and away in perspective; lines fade out near the top and bottom of the screen (opacity, no blur); ends on a typed Note | M08, M24, M10 |
| 3 | Footer (short) | Copyright line only | |

## 404

Midnight. `poster-1` two-word headline, one `body` line, a primary button home. Beside the line and button (under them below 1025px) a poster-shape composition assembles, then a second later falls apart out of its box. M03, M04, G1, G5.

## Page titles and descriptions

Set per page from `CONTENT.md` → "Page titles". Generate the share image (1200 x 630) in code: burgundy field, the page's headline in Anton, ivory.

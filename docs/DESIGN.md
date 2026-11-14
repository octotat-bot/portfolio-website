# Design system

A night poster. Midnight ground, burgundy fields, giant condensed headlines, small mono labels, and a few notes set in a handwriting face. Several pages, each built around one loud idea, joined by one burgundy wipe.

Exact values live in `tokens.json`. This file says how to use them.

## What kind of site this is

The reference is worksruthi.com. Take its kind, not its identity.

| Take | Do not take |
| --- | --- |
| Separate pages, each with one loud idea | Its red, cream and Impact pairing |
| Poster-size condensed headlines with small mono labels | Its logo, photos, doodles and wording |
| One loud colour in big flat fields | The "type your first name" hero |
| Flat and square: no shadows, no rounded cards | The bracket links and the question list |
| Letters that roll on hover, sections that pin, tiles that drift | The handwritten quote and repeated-lines banner |
| A full-colour wipe between pages | |

## Voice

- Headlines shout, sentences talk. Headlines are uppercase and three to six words. Running text is lowercase, first person, short.
- Say the plain thing: "i build apps, agents and the things between."
- Every skill named on the site points at a project that used it.
- No exclamation marks, no emoji, no "passionate", "seamless", "elevate".
- Button and link text says what happens: "See the work", "Email me".

## Colour

Dark only. Fixed proportions on every page: about 70% `midnight`, 20% `burgundy`, 10% `ivory`.

| Token | Value | Job |
| --- | --- | --- |
| `midnight` | #070B14 | Page ground |
| `midnight-raised` | #11141D | Menu overlay, frames |
| `line` | #2A2F3D | 1px hairlines |
| `burgundy` | #800020 | The loud colour, as a filled field |
| `burgundy-deep` | #4A0012 | Pressed state, darker tiles |
| `claret` | #D0344F | Burgundy for type and marks on midnight |
| `ivory` | #EFE9DC | All reading text, highlights, inverted cards |
| `ash` | #A19F97 | Secondary text on midnight |

Rules

1. **Burgundy is a surface, claret is ink.** `burgundy` on `midnight` is 1.8:1 and unreadable, so burgundy only appears as a filled area with `ivory` text on it. For a burgundy word or line on the dark ground, use `claret`.
2. `claret` on midnight is 4:1. Use it at 24px and larger only.
3. On burgundy, all text is `ivory`. `ash` and `claret` both fail there.
4. Every page has one or two full-bleed burgundy moments, never more.
5. No gradients, no glows, no other hues. The dither shader uses `midnight` and `burgundy` only.

## Type

| Family | Face | Job |
| --- | --- | --- |
| `display` | Anton | Poster headlines, project names, menu, numerals. Uppercase only |
| `sans` | Geist | Everything you read |
| `mono` | Geist Mono | Labels, numbers, tags, buttons |
| `hand` | Reenie Beanie | Typed notes: your own comments on your own work |
| `scribble` | Rubik Scribble, with Rubik Marker Hatch | Only inside the font-shuffle effect and one scribbled line on About |

- Poster sizes are fluid. Each style's `fluid` value in `tokens.json` gives its `clamp()`. The px value is the desktop maximum. The same goes for `scrawl` and `scribble`.
- The takeover menu has its own poster size, the `menu` style. It is used for the five menu links and nothing else.
- Poster line-height is 0.9 to 0.95.
- Reading text: 16px, line-height 1.5, at most 60 characters a line, never below 14px.
- At most two poster sizes on one screen.
- There are no hand-drawn strokes anywhere. Emphasis is done with type and motion: a highlight bar that sweeps behind a word, a headline that shuffles through faces before settling, a note that types itself.

## Layout

- Spacing is a 4px scale, `space-1` to `space-32`.
- Fixed sizes (nav, button, ticker, touch target, hairline, focus ring, progress line, tile minimum, reading measure) are the `size` tokens. Breakpoints are the `breakpoint` tokens.
- Page side padding: `space-4` on phones, `space-10` from 810px up.
- Section padding: `space-16` above and below.
- Breakpoints: 810px and 1025px.
- Nav is 56px: name at left, menu button (two ivory lines) at right. The menu is a full-screen takeover on `midnight-raised`: five poster-size links stacked at left, revealed by a circle that grows out of the menu button (M21 in `MOTION.md`).
- Content is full-bleed. Headlines run edge to edge. There is no centred column.
- Two layouts repeat: **pinned split** (text stays on one side while big things scroll on the other) and **pinned title** (a headline stays centred while tiles drift past).
- Below 810px every split is one column and nothing pins sideways.

## Shape and texture

- Corners are square (`radius-0`). Embedded media may use `radius-sm`. Only the floating contact pill uses `radius-pill`.
- No shadows. Depth comes from overlap and tilt.
- 1px `line` hairlines between rows. Nothing else has a border except ghost buttons and tags.
- **Grain**: a fixed noise layer over the whole site, opacity about 0.2, blend mode overlay, jumping five times a second.
- **Dither**: burgundy fields are not flat fills. They are a slow two-colour dither pattern (`midnight` and `burgundy`), which gives a printed look and moves slightly.
- **Pictures** are shown dithered in two colours (`midnight` and `ivory`, or `burgundy-deep` and `ivory`) and resolve to full colour on hover or inside case studies.

## Components

Seven building blocks. Build these first; every page is made from them.

| Component | What it is | Key rules |
| --- | --- | --- |
| **Button** | Square block, mono label | 48px tall, `space-6` side padding. Primary: burgundy field, ivory label. Ghost: 1px ivory line. On burgundy: ivory field, midnight label. Hover fills from the left (M07). One primary per screen |
| **RollLink** | Text link whose letters roll | Every text link that is not a button. Letters roll up one line and return in `claret` (M06). In the menu: the `menu` style with a mono number |
| **Label** | Small mono text | `label` style. Numbers only where things are really in order. Tag variant: label in a 1px ivory box |
| **ProjectTile** | Tilted poster card for a project | 4:5. Dithered burgundy field, dithered picture, caption on an ivory strip in `meta`, name in `poster-4`. Tilt 3 to 5 degrees, alternating. Straightens and lifts on hover (M14) |
| **WordList** | Column of poster words, one sharp | `poster-2`, one per line. Only the word at the reading line is sharp (M12). Five to eight words |
| **Note** | A typed margin note | `note` style in `claret` on midnight or `ivory` on burgundy, tilted 2 to 5 degrees. Types itself with a caret when it enters view (M10). At most three on a screen. Never carries information a visitor needs |
| **Ticker** | Thin burgundy band of running mono text | 40px, ivory `label` text, small ivory squares between items. Home only |

Also needed, once each: Nav with Menu overlay, Footer, Grain layer, Page wipe, Floating contact pill, Dither field, Intro counter.

## Accessibility

- Text contrast at least 4.5:1, or 3:1 at 24px and above. The colour rules guarantee it.
- Focus ring on every link and button: 2px `claret`, 4px offset. On burgundy: 2px `ivory`.
- Touch targets at least 44px.
- Split letters and scrambling text are hidden from screen readers; the full text is the accessible name.
- With reduced motion the site is complete and still. See `MOTION.md`.
- Real elements: `<a>` for links, `<button>` for buttons, one `<h1>` per page, headings in order.

## Do not

- Add a colour, shadow, gradient, glow, rounded card, icon set or custom cursor.
- Centre a narrow column of text on a wide screen.
- Put a small all-caps label above a headline for decoration.
- Use more than one burgundy button on a screen.
- Invent a fact, number, date or link. Blanks stay as bracketed placeholders.

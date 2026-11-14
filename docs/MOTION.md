# Motion

Every animation on the site. Build with Motion (`motion/react`) unless a row says CSS. Read `LIBRARIES.md` first.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `ease-out` | cubic-bezier(0.22, 1, 0.36, 1) | Anything arriving |
| `ease-pop` | cubic-bezier(0.34, 1.56, 0.64, 1) | Anything landing with a bounce |
| `ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1) | Wipes |
| `dur-fast` | 200ms | Colour, opacity |
| `dur-roll` | 700ms | Rolls, fills, reveals |
| `dur-pop` | 1000ms | Pop landings |
| `dur-page` | 900ms | Each half of a page wipe |
| `stagger-letter` | 22ms | Gap between letters |

Default spring for anything that follows the pointer or scroll: stiffness 140, damping 30, mass 0.5.

## Principles

1. Scroll is the play button. Big moments are tied to scroll position, not to time.
2. One idea per section. It pins, does its one thing, lets go.
3. Hover answers in under a second and only when touched.
4. Arrivals use `ease-out`; landings use `ease-pop`. Only the ticker moves at constant speed.
5. Everything switches off for reduced motion and the site is still complete.

## Patterns

### Page level

| ID | Pattern | Trigger | What happens | Build |
| --- | --- | --- | --- | --- |
| M01 | Intro counter | First page load in a session | Midnight screen. An Anton counter runs 000 to 100 bottom-left while fonts and the hero load, a mono line reads "loading". At 100 the wipe (M02) lifts it away | Motion `animate` on a number; store a session flag so it runs once |
| M02 | Burgundy stairs wipe | Every route change, and the end of M01 | Five vertical burgundy columns rise from the bottom one after another, left to right, 60ms apart, each taking `dur-page`, until the screen is covered. The new page mounts underneath. The columns then leave upward in the same order. `ease-in-out` | React `<ViewTransition>` or a fixed overlay driven by Motion; five divs, staggered y transforms. Fallback: instant cut |
| M22 | Grain | Always | Fixed full-screen noise layer jumps position five times a second | CSS `steps()` animation on a fixed, pointer-events-none layer |
| M25 | Smooth scroll | Always | Scrolling is eased, same speed as native | Lenis at default settings, driven by Motion's frame loop. Off for touch and for reduced motion |
| M21 | Takeover menu | Menu button | See "The takeover menu" below | Motion presence and clip-path; letter roll from Skiper `skiper58` |
| M23 | Floating contact pill | Always, except on Contact | Small ivory pill, bottom-right, "say hello". Bobs 4px over 3s. Leans up to 12px toward a nearby pointer and pops on hover | CSS loop for the bob; pointer spring for the lean |

### Type

| ID | Pattern | Trigger | What happens | Build |
| --- | --- | --- | --- | --- |
| M03 | Line reveal | Headline enters view, once | Each line rises from behind its own baseline (y 110% to 0) inside an overflow-hidden wrapper, lines 60ms apart, `dur-roll`, `ease-out` | Split into lines; Motion `whileInView` with stagger |
| M04 | Font shuffle | Selected headlines enter view, once | Each letter flips between Anton, Rubik Scribble and Rubik Marker Hatch every 70ms, letters settle on Anton left to right over about 900ms. Letter boxes are fixed width so nothing reflows | Timer per letter; swap `font-family`; reserve each letter's Anton width |
| M05 | Scramble label | Mono labels enter view, or on hover | Characters cycle through random A–Z and digits and resolve left to right in about 600ms | From React Bits Decrypted Text |
| M06 | Letter roll | Hover or focus on a RollLink | Each letter moves up one line; an identical copy in `claret` follows it into place. `dur-roll`, `ease-out`, letters `stagger-letter` apart | Start from Skiper `skiper58`; set the timing to these tokens |
| M10 | Typed note | Note enters view, once | The note types itself at 35ms a character with a block caret, then the caret blinks three times and goes. Afterward the note "boils": it nudges 1px and half a degree, three times a second | Motion for the typing; CSS `steps()` for the boil |
| M11 | Highlight sweep | A marked word enters view, once | A `burgundy` bar grows from the left behind the word (scaleX 0 to 1) in `dur-roll`. The word stays `ivory` | CSS transform on a pseudo-element; origin left |
| M19 | Count up | Number enters view, once | Anton numerals count from 0 to the value in 1.4s, `ease-out` | From Skiper `skiper37` |

### Sections

| ID | Pattern | Where | What happens | Build |
| --- | --- | --- | --- | --- |
| M08 | Dither field | Home hero, About opener, burgundy sections | Two-colour dither (`midnight` back, `burgundy` front), wave or warp shape, 4x4 pattern, pixel size 3, speed 0.25. In the hero its centre drifts up to 6% toward the pointer on a spring | Paper Shaders `Dithering`. Fallback: flat `burgundy` |
| M09 | Hero lift-off | Home hero, while scrolling the first screen | The name scales from 1 to 1.35 and moves up 20%, its opacity falls to 0 by 80% of the screen; the dither field's bottom edge rises with a stepped clip | Motion `useScroll` + `useTransform` on the hero |
| M12 | Pinned split, blur focus | Home "what i build"; About "what i work with" on desktop | Text block pins left for the length of the list. Poster words scroll past on the right. A word is sharp and full opacity when its centre is at mid-screen; away from it blur rises to 7px and opacity falls to 0.3 | Per word: `useScroll` with the word as target, map distance from centre to blur and opacity |
| M13 | Pinned title, drifting tiles | Home selected work | Headline pins at centre for 250vh. Four tiles start below the screen at different x positions and travel up past the headline at different speeds (0.8x to 1.4x), each with its own tilt | One `useScroll` on the section; a `useTransform` y range per tile |
| M14 | Tile hop | Hover or focus on a ProjectTile | Tile rotates to 0 and lifts 10px, `dur-pop`, `ease-pop`. Its picture clears (M15) | Motion hover with a spring |
| M15 | Dither resolve | Project pictures | Pictures rest as a two-colour dither. On hover (tiles) or when 60% in view (case studies) the dither cross-fades to the real image in 500ms | Paper Shaders `ImageDithering` layered over the real image |
| M16 | Word wall | Work index | One word repeated to fill the screen in `poster-2`, fixed behind the tiles. Odd rows drift left and even rows right as you scroll. One row is replaced by the page's line in `claret`. As the first tile arrives the wall fades to the `line` colour | `useScroll` + x transforms per row |
| M17 | Year strip | About | Section pins for 300vh. A row of wide year cards moves sideways as you scroll down. The card nearest centre is full opacity with its year in `claret`; others are at 0.4 | `useScroll` to x on the strip. Below 810px: a normal vertical list |
| M18 | Skill pile | About, on burgundy | Skill words drop from the top one after another, bounce and pile up at the bottom. They can be dragged and thrown | From React Bits Falling Text with Matter.js; start when in view; pause when out of view |
| M20 | Ticker | Top of Home | Text runs right to left at 60px a second, forever | CSS linear animation |
| M24 | Perspective credits | Bottom of Contact | Credit lines in `poster-3` are tilted back about 50 degrees and crawl up and away as you scroll the last screen, with soft blurred edges at top and bottom | Start from Skiper `skiper28`, edges from `skiper41` |
| M26 | Scroll-built statement | Home statement | The sentence starts with its letters scattered: offset up to 40px, rotated up to 25 degrees, 30% opacity. As the section scrolls through the screen they travel into place and reach full opacity by the middle | Start from Skiper `skiper31`; keep one variant |
| M27 | Card stack | Work tiles below 810px | Each tile sticks near the top; the next slides over it while the one beneath scales down to 0.92 | Start from Skiper `skiper16` |
| M28 | Screen gallery | Case study proof | Three or more screens sit in two or three columns that scroll at different speeds. Below 810px they become a swipe carousel with a clip-path change between slides | Skiper `skiper30` on desktop, `skiper54` on phones |
| M29 | Reading progress | Case studies | A 2px `claret` line across the very top grows left to right with scroll | Skiper `skiper89` |

### Controls

| ID | Pattern | Trigger | What happens | Build |
| --- | --- | --- | --- | --- |
| M07 | Button fill | Hover or focus | `ivory` fills the button from the left in `dur-roll`; label turns `midnight` after 120ms; press moves it down 1px | CSS background-size transition |

## The takeover menu (M21)

The menu is a full-screen takeover with poster-size links. This is the one place the whole type system shows at once, so build it carefully.

Layout

- Field: `midnight-raised`, full screen, above everything including the grain.
- Left: five links stacked flush left, one per line: HOME, WORK, ABOUT, LAB, CONTACT. The `menu` type style: Anton, uppercase, `clamp(56px, 9vw, 150px)`, line-height 0.9.
- A `claret` dot, 0.15em across, sits to the left of the link for the page you are on. That link is pushed right by the dot's width plus `space-3`.
- Right half, desktop only: for the link being hovered, its number in the `label` style and one typed Note describing the page (see `CONTENT.md` → Menu). Nothing here on phones.
- Bottom row: GitHub, LinkedIn and Email as small RollLinks at left; one `label` line at right.
- The menu button stays in the top-right corner and turns from two lines into a cross.

Opening

1. The field is revealed by a circle that grows from the centre of the menu button until it covers the screen: `clip-path: circle()`, 900ms, `ease-in-out`.
2. Starting 200ms in, the links slide in from 160px to the right while fading from 0 to 1, top link first, 80ms apart, `dur-roll`, `ease-out`.
3. The bottom row fades in last.
4. Page scroll is locked and Lenis is stopped.

Hover and focus

- The link under the pointer turns `claret`. The other four fall to 35% opacity. `dur-fast`.
- Its letters roll (M06).
- The dot leaves the current page and springs to the hovered link; that link shifts right to make room and the old one shifts back. When the pointer leaves the list the dot returns to the current page.
- The Note on the right retypes for the hovered link (M10) and its number scrambles (M05).

Closing

- Links fade out together in 150ms. The circle shrinks back into the button in `dur-roll`.
- Choosing a link starts the burgundy stairs wipe (M02) and closes the menu underneath it.
- Esc closes. Focus is trapped while open and returns to the menu button on close.

Reduced motion: the field appears and disappears at once, links are simply there, the dot jumps, colour still changes on hover.

## Performance

- Animate transform, opacity, filter and clip-path only.
- The grain is one fixed layer. Never put a filter on a scrolling container.
- Blur is used only in M12.
- At most one shader canvas is running at a time. Pause shaders and the skill pile when they are off screen.
- At most one pinned section is on screen at a time.
- Lighthouse performance on a phone profile: 85 or better on every page.

## Reduced motion

When `prefers-reduced-motion: reduce` is set:

| Pattern | Becomes |
| --- | --- |
| M01 | Skipped |
| M02 | Instant cut |
| M03, M04, M05, M10, M11, M19, M29 | Final state shown immediately |
| M06, M07 | Colour change only |
| M08 | One still frame of the dither |
| M09, M12, M13, M16, M17 | Normal scrolling layout, nothing pinned, everything sharp |
| M18 | A static wrapped list of the words |
| M20, M22, M23, M25 | Off or still |
| M24, M26 | Flat, readable text in place |
| M27, M28 | Plain vertical list of tiles or screens |
| M21 | See the takeover menu section |

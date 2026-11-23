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
| M01 | Loader | Every full page load: the first visit and every refresh, not moves between pages. No skip | About 4.6s. 31 hard-cut frames, no fades, 3.53s in all, each shown by a scheduled timeout (the list, with each frame's length, is `lib/motion.ts` → `intro.frames`): words NEED, MONEY, FOR, FERRARI. and photos 1 to 4 alternating, slowing from 420ms to 190ms, frame 7 being FERRARI. filling the screen; then 110, 90, 80, 70ms and twenty frames of 60ms, some mirrored (`scaleX(-1)`) and some inverted. Word frames: `black`, the word in `burgundy` Anton, uppercase, centred on its capitals, at the smaller of 90% of the screen width or a cap height of 76% of its height (inverted: `burgundy`, the word in `black`); frame 7 fills the screen edge to edge (the smaller of 100% width or 100% height by cap height). Measured with a canvas once Anton has loaded. Photo frames: `black`, the photo black and white as a full-bleed cover crop anchored at its focal point (`fx`, `fy` in `content/site.ts`), with a 256px film-grain tile on top at a random offset every frame; inverted ones use `filter: invert(1)`. Shutter: two `black` bars, `.shutter-top` and `.shutter-bottom`, each 100vw × 50dvh, above the frames, scaled from their outer edge. Fully open until frame 7 ends (1.98s); then they close in one move until 3.53s, `scaleY = (1 − cos(πp)) / 2`, so the fast loop plays in a shrinking slit. At 3.53s the bars are shut and the frame goes (solid black); 120ms later the top bar moves to `y: -100%` and the bottom to `y: 100%` together, 900ms, `ease-in-out`, showing the page already rendered underneath. When they have gone, the loader unmounts, the scroll lock lifts, the page goes to the top (or the URL's #hash) and the hero's entrance plays. No sound. Before it starts: all photos decoded and Anton loaded, or 1.5s, whichever comes first. A head script adds `html.pl-cover` (hides the page) and `html.pl-lock` (blocks wheel, touch and the scroll keys) before hydration; the loader removes `pl-cover` when it mounts and `pl-lock` when it ends; both are released after 15s whatever happens. Screen readers hear the line once ("need money for ferrari"); the frames are `aria-hidden` | Scheduled timeouts swap which pre-mounted frame is visible (an attribute, no React render per cut); the bars on one Motion value (transform only); photos built by `scripts/make-intro-assets.mjs` |
| M02 | Burgundy stairs wipe | Every route change (not the end of M01, which has its own shutter) | Five vertical burgundy columns rise from the bottom one after another, left to right, 60ms apart, each taking `dur-page`, until the screen is covered. The new page mounts underneath. The columns then leave upward in the same order. `ease-in-out` | React `<ViewTransition>` or a fixed overlay driven by Motion; five divs, staggered y transforms. Fallback: instant cut |
| M22 | Grain | Always | Fixed full-screen noise layer jumps position five times a second | CSS `steps()` animation on a fixed, pointer-events-none layer |
| M25 | Smooth scroll | Always | Scrolling is eased, same speed as native | Lenis at default settings, driven by Motion's frame loop. Off for touch and for reduced motion |
| M21 | Takeover menu | Menu button | See "The takeover menu" below | Motion presence and clip-path; letter roll from Skiper `skiper58` |
| M23 | Floating contact pill | Always, except on Contact, and hidden while the Home hero buttons, the Home closing button, the About stack lines or the footer are on screen | Small ivory pill, bottom-right, "say hello". Bobs 4px over 3s. Leans up to 12px toward a nearby pointer and pops on hover | CSS loop for the bob; pointer spring for the lean |

### Type

| ID | Pattern | Trigger | What happens | Build |
| --- | --- | --- | --- | --- |
| M03 | Line reveal | Headline enters view, once | Each line rises from behind its own baseline (y 110% to 0) inside an overflow-hidden wrapper, lines 60ms apart, `dur-roll`, `ease-out` | Split into lines; Motion `whileInView` with stagger |
| M04 | Font shuffle | Selected headlines enter view, once | Each letter flips between Anton, Rubik Scribble and Rubik Marker Hatch every 70ms, letters settle on Anton left to right over about 900ms. Letter boxes are fixed width so nothing reflows | Timer per letter; swap `font-family`; reserve each letter's Anton width |
| M05 | Scramble label | Mono labels enter view, or on hover | Characters cycle through random A–Z and digits and resolve left to right in about 600ms | From React Bits Decrypted Text |
| M06 | Letter roll | Hover or focus on a RollLink | Each letter moves up one line; an identical copy in `claret` follows it into place. `dur-roll`, `ease-out`, letters `stagger-letter` apart | Start from Skiper `skiper58`; set the timing to these tokens |
| M10 | Typed note | Note enters view, once | The note's full size is held from the start so nothing moves while it types. It types itself at 35ms a character with a block caret, then the caret blinks three times and goes. Afterward the note "boils": it nudges 1px and half a degree, three times a second | Motion for the typing; CSS `steps()` for the boil |
| M11 | Highlight sweep | A marked word enters view, once | A `burgundy` bar grows from the left behind the word (scaleX 0 to 1) in `dur-roll`. The word stays `ivory` | CSS transform on a pseudo-element; origin left |
| M19 | Count up | Number enters view, once | Anton numerals count from 0 to the value in 1.4s, `ease-out` | From Skiper `skiper37` |

### Sections

| ID | Pattern | Where | What happens | Build |
| --- | --- | --- | --- | --- |
| M08 | Dither field | Home hero, the field behind the About portrait, burgundy sections | Two-colour dither (`midnight` back, `burgundy` front), wave or warp shape, 4x4 pattern, pixel size 3, speed 0.25. In the hero its centre drifts up to 6% toward the pointer on a spring | Paper Shaders `Dithering`. Fallback: flat `burgundy` |
| M09 | Hero lift-off | Home hero, while scrolling the first screen | The name scales from 1 to 1.35 and moves up 20%, its opacity falls to 0 by 80% of the screen; the dither field's bottom edge rises with a stepped clip | Motion `useScroll` + `useTransform` on the hero |
| M12 | Pinned split, blur focus | Home "what i build"; About "what i work with" on desktop | Text block pins left for the length of the list. Poster words scroll past on the right. A word is sharp and full opacity when its centre is at mid-screen; away from it blur rises to 7px and opacity falls to 0.3 | Per word: `useScroll` with the word as target, map distance from centre to blur and opacity |
| M13 | Pinned title, drifting tiles | Retired: Home selected work is now the rising pile (M31) | Not used | Not used |
| M14 | Tile hop | Hover or focus on a ProjectTile | Tile rotates to 0 and lifts 10px, `dur-pop`, `ease-pop` | Motion hover with a spring |
| M15 | Dither resolve | Case-study screens (tile covers show as they are) | Screens rest as a two-colour dither; when 60% in view the dither cross-fades to the real image in 500ms | Paper Shaders `ImageDithering` layered over the real image |
| M16 | Word wall | Work index | One word repeated to fill the screen in `poster-2`, fixed behind the tiles. The wall starts below a clear `nav-band` (88px) at the top, so the nav name and menu button always read. Odd rows drift left and even rows right as you scroll. One row is replaced by the page's line in `claret`; that line is the page's `h1`, does not drift and wraps on phones so it can be read. As the first tile arrives the whole wall, line included, fades to the `line` colour | `useScroll` + x transforms per row; the colour change is an opacity crossfade over a `line`-coloured copy |
| M17 | Year strip | About | Section pins for 300vh. A row of wide year cards moves sideways as you scroll down. Every card is at full strength; the card nearest centre has its year in `claret`, and NOW always does | `useScroll` to x on the strip. Below 810px: a normal vertical list |
| M18 | Skill pile | About, on burgundy | Skill words drop from the top one after another, bounce and pile up at the bottom. They can be dragged and thrown | From React Bits Falling Text with Matter.js; start when in view; pause when out of view |
| M20 | Ticker | Top of Home | Text runs right to left at 60px a second, forever | CSS linear animation |
| M24 | Perspective credits | Bottom of Contact | Credit lines (`poster-3`) are tilted back about 50 degrees and crawl up and away as you scroll the pinned section. Near the top and bottom of the screen each line fades out: opacity only, since blur belongs to M12 alone. Each small line above a credit (`label`) stays flat at its full 12px size, follows its credit line and fades with it | Start from Skiper `skiper28`; the soft edges are per-line opacity, not `skiper41` |
| M26 | Scroll-built statement, two beats | Home statement | The section pins and plays the sentence in two halves. **Beat 1, the build:** "I BUILD THE THING," starts with its letters scattered (offset up to 40px, turned up to 25 degrees, 30% opacity) and assembles as the section arrives, while a poster-shape composition builds itself beside it (G1) with one block deliberately crooked. **Beat 2, the check:** "THEN I CHECK IF IT'S ACTUALLY RIGHT." rises in word by word, then a `burgundy` bar sweeps behind each word in turn. When the last word is checked the crooked block snaps into place (`ease-pop`, `dur-pop`) and the note types (M10). All tied to scroll, so it plays backwards too. Desktop: text left, composition right; phones: composition above | Start from Skiper `skiper31` for the letters; per-word `useTransform` for the rise and the bars; the composition's `checked` flag for the snap |
| M27 | Card stack | Work tiles, below 810px (Home selected work uses M31) | Each tile sticks near the top; the next slides over it while the one beneath scales down to 0.92 | Start from Skiper `skiper16` |
| M28 | Screen gallery | Case study proof | Three or more screens sit in two or three columns that scroll at different speeds. Below 810px they become a swipe carousel with a clip-path change between slides | Skiper `skiper30` on desktop, `skiper54` on phones |
| M29 | Reading progress | Case studies | A 2px `claret` line across the very top grows left to right with scroll | Skiper `skiper89` |
| M30 | Image cursor trail | Retired: removed from the Work page | Not used | Not used |
| M31 | Rising pile | Home selected work, desktop and phones | The section is (projects + 1.5) screens tall, (projects + 1) on phones. Inside it a stage pins (`position: sticky`, top 0, 100dvh), with the headline (`monument`) and the note centred behind the cards. Section progress 0 to 0.12: the headline alone. From 0.12 to 0.8 each card rises from 110dvh below to its resting spot in its own window; the windows are spread evenly and overlap by 30%, so the next card starts while the last one settles. `ease-out`; the card turns from 0 to its tilt as it rises. From 0.8 to 1 everything holds, then the section scrolls away. The cards are the original ProjectTiles (same content). Desktop: one centred row, each card overlapping the one before by 20% of its width, the cards as wide as lets the row fill the content width (about 400px at 1440) but never so tall that the pile leaves the screen, resting tilts -3, 1, -2, 4deg (repeating), dropped 0, 96, 40, 64px at a 1440px-wide screen (scaled with the width). Phones: one column of content-width tiles, offset 8vw left and right, tilted -2 and 2deg, each overlapping the one before as deeply as it takes for the pile to fit one screen below the nav band (about 83% at 390 × 844). Each new card lands on top; earlier ones stay partly visible underneath. A card's shapes (G1, G3) assemble and start their idle loop only once it has landed, and stop when the section is off screen. Hover or focus: the card comes to the top, turns to 0 and scales to 1.03, `dur-fast`, `ease-pop`, and goes back on leave. The whole card links to its project. As the section leaves, the stage fades as one layer while its highest card rises from its spot to 56px (the NavFade line). No scroll-jacking and no snap | Native `position: sticky` and Motion `useScroll` on the section (transform only for the cards: `y`, `rotate`, `scale`); resting spots measured from the stage and the cards' real heights on resize, not per frame. Values in `lib/motion.ts` → `pile` |
| M32 | Footer flip line | The footer's ghost marquee (GOOD ENOUGH ISN'T., upside down) | A split-flap board on top of the marquee (which runs right to left and speeds up with scroll): when it first comes half into view its letters flip in one after another from edge-on (`rotateX` 90 to 0, 35ms apart, 500ms, `ease-out`); while it shows, a random letter flips over (`rotateX` 0 to 360, 600ms, `ease-in-out`) every 1.2s; on desktop with a fine pointer, a letter flips as it passes under the pointer; the whole line leans with scroll speed (`skewX`, up to 10deg at 2000px/s, on the same spring as the speed-up). Transform only; paused off screen | Motion `animate()` on each letter, `useInView`, and the scroll-velocity spring; values in `lib/motion.ts` → `flipLine` |

### Controls

| ID | Pattern | Trigger | What happens | Build |
| --- | --- | --- | --- | --- |
| M07 | Button fill | Hover or focus | `ivory` fills the button from the left in `dur-roll`; label turns `midnight` after 120ms; press moves it down 1px | CSS background-size transition |

### Poster shapes

The shape kit is in `DESIGN.md` → Shapes. Timings are in `lib/motion.ts` (`shapes`), layouts and idle speeds in `lib/shapes.ts`.

| ID | Pattern | Trigger | What happens | Build |
| --- | --- | --- | --- | --- |
| G1 | Assemble | A composition's box is 35% in view, once, after the intro and the wipe | Each shape flies in from outside its box (turned, at 0.3 scale) to its place over 900ms, `ease-out`, 45ms apart. The composition is clipped to its box | Inline SVG, one transform per shape, Motion's frame loop |
| G2 | Pointer push | After assembly, desktop with a fine pointer only, where the placement asks for it | Shapes within 240px of the pointer move away, up to 110px, on the default spring, and return when it leaves | Same frame loop; pointer read once per move |
| G3 | Idle | After assembly | Stars spin, half discs rock, small discs bob, large discs breathe. Project loops: **Repetite** ring segments fill and empty; **Marginalia** a claret bar lights one line of the page at a time; **Trailboard** three discs orbit a centre; **BumpFix** three triangles step upward in turn | Same frame loop; segments change opacity only |
| G4 | Page mark | Every route change | A 20px ivory shape next to the nav name: Home disc, Work half disc, About quarter disc, Lab star, Contact square. While the wipe covers the screen the old shape turns and shrinks away and the new one turns and grows in, `ease-in-out`, 450ms. It sits above the wipe. None on the 404 or while the menu is open | Motion presence on one small SVG |
| G5 | Fall apart | 404 only | One second after the composition has assembled, its shapes fall out of the bottom of the box, turning, 50ms apart | Same frame loop |

Rules: transform and opacity only. Only compositions on screen run their loop. Phones keep G1 and G3, not G2.

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

Portrait collage (desktop only, from 810px; on phones the menu is links only)

- The right half is a collage, back to front: the poster-shape composition for the hovered or focused link, the portrait (`public/me/menu.png`, a cut-out), a `claret` ring over each binocular lens, and under it the link's number and typed Note. The portrait stands on the bottom of its stage, between the nav row and the note, about 80 to 85% of the screen's height. The social links and the credit line sit in the left half, so nothing in the collage is over text or a link. Shapes are only ever behind the portrait.
- Per link, the composition and the portrait's treatment change: **Home** a large burgundy disc behind the head with small ivory discs, portrait dithered ivory; **Work** ivory and claret bars stacked like a page behind the shoulder, claret dither; **About** two quarter discs forming a broken circle behind the head, the real photo; **Lab** three ivory stars and a claret triangle, a coarse 8x8 dither; **Contact** a burgundy square turned 45 degrees behind the head and one ring, burgundy dither.
- Opening, after the circle reveal and the link slide-in: the portrait scans in top to bottom over 500ms, then the shapes fly in behind it (G1, 450ms, 25ms apart).
- Hover or keyboard focus on a link: the old shapes scatter outward and fade (200ms) while the new composition assembles (from 120ms, 260ms each, 12ms apart), about 500ms in all; the portrait re-dithers with a 400ms top-to-bottom scan; the number scrambles and the Note retypes.
- Idle: the shapes run their G3 loops; the lens rings pulse 4% in scale every 2 seconds.
- Pointer: the shapes push away (G2); the portrait leans at most 8px toward the pointer on the default spring.
- Closing: the shapes scatter and the portrait fades (200ms), then the circle closes. The page mark (G4) returns once the circle has closed.
- The portrait is dithered with Paper Shaders `ImageDithering` (`midnight` back), masked by the photo's own transparency; two canvases take turns so none is created per hover. While the menu is open every page shader and page composition holds still. Only transform, opacity and clip-path animate. Everything in the collage is `aria-hidden` with no pointer events.
- Without `public/me/menu.png` the collage is the composition alone, centred in the right half.

Reduced motion: the field appears and disappears at once, links are simply there, the dot jumps, colour still changes on hover. The portrait and composition appear finished and still; treatments and compositions change at once; no scan, scatter or pulse.

### Nav zone

At every width, any tile, card or image fades out as its top edge scrolls into the top 120px of the screen, and is gone by the bottom of the nav (56px), so nothing passes under the nav name or the menu button. Stacked cards stick just below this zone. The fade is tied to scroll position and stays with reduced motion, since it is there to keep the nav readable.

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
| M01 | Only the last frame (FERRARI., inverted), the bars at `scaleY` 0.24, held 1.4s, then the loader fades out over 0.4s. No loop |
| M02 | Instant cut |
| M03, M04, M05, M10, M11, M19, M29 | Final state shown immediately |
| M06, M07 | Colour change only |
| M08 | One still frame of the dither |
| M09, M12, M16, M17 | Normal scrolling layout, nothing pinned, everything sharp |
| M18 | A static wrapped list of the words |
| M20, M22, M23, M25 | Off or still |
| G1, G2, G3, G5 | Each composition shown finished and still |
| G4 | The mark swaps at once |
| M24, M26 | Flat, readable text in place |
| M27, M28 | Plain vertical list of tiles or screens |
| M31 | No pin, no rise and no turn-in: the cards sit in their finished pile |
| M32 | The line sits still, upside down: no flips, no lean, no running |
| M21 | See the takeover menu section |

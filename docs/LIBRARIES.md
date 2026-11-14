# Libraries

One animation engine, one scroll library, one shader library, and a small set of copied-in effects. Anything not listed here needs a reason before it is installed.

Before using any API below, open that library's current documentation. Do not write these APIs from memory: several changed in the last year.

## Install

| Library | Package | Job on this site |
| --- | --- | --- |
| Next.js, App Router | `next`, `react`, `react-dom` | Separate routes, static generation, fonts, images |
| TypeScript | `typescript` | Everything is typed |
| Tailwind CSS v4 | `tailwindcss` | Styling. Theme is generated from `tokens.json`; no default palette, no default radii |
| Motion | `motion` (import from `motion/react`) | THE animation engine: scroll-linked values, in-view reveals, springs, hover, drag, layout, presence |
| Lenis | `lenis` (React wrapper at `lenis/react`) | Smooth scrolling. Drive it from Motion's frame loop so the two stay in step |
| Paper Shaders | `@paper-design/shaders-react` | `Dithering` for the burgundy dither fields; `ImageDithering` to turn project photos into two-colour dithered pictures |
| Matter.js | `matter-js` | Physics for one section only: the skill pile on About. Load it lazily |

Notes

- **Paper Shaders is pre-1.0.** Pin the exact version in `package.json` (no `^` or `~`). It has no runtime dependencies and needs WebGL2; where WebGL2 is missing, show a flat `burgundy` field.
- **Page transitions** use React's `<ViewTransition>` with the Next.js `experimental.viewTransition` flag. Check the docs for the installed Next.js version for the exact setup. Where the browser does not support view transitions, navigation simply cuts.
- **Fonts** load through `next/font/google`: Anton, Geist, Geist Mono, Reenie Beanie. The two effect faces (Rubik Scribble, Rubik Marker Hatch) are large, so load them only on pages that use them and subset them to the characters actually shown.

## Copy in, do not install: Skiper UI

Skiper UI (skiper-ui.com) is a set of animated Next.js components built on shadcn/ui and Motion. Each one is a single file added through the shadcn CLI, for example `pnpm dlx shadcn add @skiper-ui/skiper58`. About two dozen are free; the rest need a one-time paid licence. Use the free ones below. Do not add a paid one unless Mukund says he has bought the licence.

After copying a Skiper file:

1. Change every `framer-motion` import to `motion/react`. Do not install `framer-motion` alongside `motion`.
2. Remove its demo content, colours, rounded corners, shadows and fonts. Restyle to `tokens.json`.
3. Keep only the part of the file the site uses.

| ID | Skiper name | Used for | Pattern |
| --- | --- | --- | --- |
| `skiper58` | Text roll navigation | Letter roll on every text link and on the menu links | M06 |
| `skiper31` | Text scroll animation | The Home statement: letters move, turn and settle as you scroll | M26 |
| `skiper28` | 3D perspective text | The Contact end credits, tilted back and crawling up | M24 |
| `skiper16` | Card stack scroll | Work tiles on phones: each tile sticks and the next slides over it | M27 |
| `skiper30` | Oliver parallax | Case study screens when there are three or more | M28 |
| `skiper54` | Shadcn clipPath carousel | Case study screens on phones | M28. Idea only: the file needs Embla, the shadcn carousel and an icon library, so the phone gallery is native scroll-snap with Motion clip-paths |
| `skiper89` | Scroll progress 001 | Reading progress line on case studies | M29. Idea only: the file needs Number Flow; the line is a Motion scaleX |
| `skiper37` | Animated number | The Numbers section and the intro counter | M19, M01. Idea only: the file needs Number Flow, an icon library and an observer package; the count uses Motion's `animate()` |
| `skiper66` | SVG clip path mask | Media revealing as it enters view | M15 |
| `skiper41` | Progressive blur | Not used | `MOTION.md` allows blur only in M12. The credits' soft edges are a per-line opacity fade; the word wall's edges are the screen's |
| `skiper67` | Video player 001 | Demo videos in case studies | |
| `skiper65`, `skiper102` | Breakpoint indicator, Debug panel | Development only. Remove before release | |

Paid components that match this design, only if a licence is bought: `skiper9` or `skiper10` (stairs preloader, the same idea as the burgundy wipe), `skiper27` (rolling text), `skiper18` (image cursor trail, for Work once photos exist), `skiper80` (projects showcase). None is required: `MOTION.md` describes each effect well enough to build it with Motion. The cursor trail is M30 and is built by hand.

## Copy in, do not install: React Bits

React Bits (reactbits.dev) is a collection of animated React components that you copy into the project through the shadcn CLI and then own. Take the TypeScript + Tailwind variant.

Rule: copy a React Bits component only if its sole dependency is Motion, Matter.js or nothing. If the component needs GSAP, Three.js or OGL, do not copy it; rebuild the effect with Motion from the description in `MOTION.md`.

| Effect needed | React Bits component to start from | Then |
| --- | --- | --- |
| Scrambling label text | Decrypted Text | Restyle to the `label` type style; scramble with A–Z and digits only |
| Skill words that fall and pile up | Falling Text | Use `poster-4` words on burgundy; walls at the section edges |
| Marquee that speeds up with scroll | Scroll Velocity | Use for the ticker on Work and the footer ghost line |
| Button that leans to the pointer | Magnet | Use only on the floating contact pill |

Every copied component must be restyled to the tokens. Remove any gradient, glow, shadow, rounded corner or colour that is not in `tokens.json`.

## Build by hand with Motion

These are specific to this site and small enough to write directly: line reveal, button fill, font shuffle, typed note, highlight sweep, takeover menu, pinned split with blur focus, pinned title with drifting tiles, word wall, image cursor trail, year strip, burgundy stairs wipe. Specs are in `MOTION.md`.

For splitting headlines into lines, words and letters, use Motion's own split-text utility if the installed free package exports one. If it does not, write a small splitter. Do not buy Motion+.

## Not allowed

| Library | Why not |
| --- | --- |
| GSAP, ScrollTrigger | A second animation engine fighting Motion for the same elements. Motion covers every pattern here |
| Three.js, React Three Fiber, OGL | Nothing in this design is 3D. Paper Shaders covers the shader work at a fraction of the size |
| Aceternity UI, Magic UI, other effect kits | Their look is gradients, glows and glass. This site is flat and square |
| Component kits with their own theme (MUI, Chakra, DaisyUI) | The site has seven components and its own tokens |
| Locomotive Scroll | Lenis does the same job and is lighter |
| Lottie, Rive | There are no vector animation files |
| Icon libraries | The site has no icons |
| Custom cursor libraries | No custom cursor |

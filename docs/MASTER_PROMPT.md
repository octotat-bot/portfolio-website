# Master prompt

Paste everything below this line into your coding agent, in a new empty project folder that contains the kit files in `docs/`.

---

You are building a personal portfolio website for Mukund Mangla. The design, motion, pages, copy and library choices are already decided and written down in `docs/`. Your job is to build exactly that, one phase at a time, and to stop after each phase so it can be reviewed.

## Read first, in this order

1. `docs/DESIGN.md`: the design system
2. `docs/tokens.json`: every exact value
3. `docs/LIBRARIES.md`: what to install, what to copy in, what is banned
4. `docs/MOTION.md`: every animation, by ID (M01, M02, …)
5. `docs/PAGES.md`: every page, section by section
6. `docs/CONTENT.md`: every word
7. `docs/ASSETS.md`: files, paths, placeholders

Read all seven before writing anything. Then reply with a short plan: the folder structure you will use, the exact package versions you will install, and any place where two documents disagree. Wait for a go-ahead before Phase 0.

## Rules that never bend

1. **Tokens only.** Every colour, font size, space, radius, easing and duration comes from `tokens.json`. Generate the Tailwind theme and CSS variables from that file. Remove Tailwind's default colours and radii so nothing else can be used by accident.
2. **Flat and square.** No shadows, no gradients, no glows, no rounded cards, no icons, no custom cursor. Burgundy is a surface and claret is ink, exactly as `DESIGN.md` says.
3. **One animation engine.** Motion (`motion/react`). No GSAP, no Three.js, no second engine. Copied-in components must be converted to `motion/react` and restyled to the tokens.
4. **Do not invent content.** Use `CONTENT.md` word for word. Anything in square brackets is a blank: store it as `null` and hide it or show a dash. Never ship lorem ipsum, a made-up number, a made-up link or a stock photo.
5. **Repetite is his app, not an AI product.** Never label or describe it as one.
6. **Content is data.** All copy, links and numbers live in `content/*.ts` (see `ASSETS.md`). Components contain no literal copy. Adding a project photo or a number later must not need a code change.
7. **Look things up.** Before using Motion, Lenis, Paper Shaders, React's `<ViewTransition>`, the shadcn CLI, Skiper UI or React Bits, open the current documentation for the version you installed. Do not write these APIs from memory.
8. **It works without motion.** With `prefers-reduced-motion: reduce` the site is complete, readable and still, as the table at the end of `MOTION.md` describes. Build that path with each pattern, not at the end.
9. **It works on a phone.** Check every section at 390px wide before calling it done. Nothing scrolls sideways. Nothing pins sideways below 810px.
10. **Accessible.** Real links and buttons, one `h1` per page, visible focus ring, 44px touch targets, split and scrambling text hidden from screen readers with the full text as the accessible name, Esc and focus trapping on the menu.
11. **Fast.** Animate transform, opacity, filter and clip-path only. One shader canvas running at a time. Pause anything off screen. Lazy-load Matter.js and the shaders.
12. **Ask, do not guess.** If a document is unclear or two of them disagree, stop and ask.

## Stack

Next.js with the App Router, React, TypeScript, Tailwind CSS v4, Motion, Lenis, `@paper-design/shaders-react` (exact version pinned), Matter.js (lazy), fonts through `next/font/google`. Static generation for every page. Deploy target: Vercel. Use pnpm.

## Phases

Finish a phase, run the checks listed under it, then stop and report: what was built, what was skipped and why, and how to view it. Do not start the next phase until told to.

### Phase 0: Foundation

- Scaffold the project. Install only what `LIBRARIES.md` lists.
- Turn `tokens.json` into the Tailwind theme and CSS variables.
- Load the fonts. Set the type styles as utilities named after the tokens (`monument`, `poster-1`, … `label`, `note`).
- Create the `content/*.ts` files from `CONTENT.md`, typed, with every bracketed value as `null`.
- Build a hidden `/styleguide` route showing every colour, type style and spacing step.

Checks: `/styleguide` matches `tokens.json` value for value; no Tailwind default colour is reachable; build passes with no type errors.

### Phase 1: Building blocks and shell

- The seven components in `DESIGN.md`: Button, RollLink, Label, ProjectTile, WordList, Note, Ticker. Add each to `/styleguide` with all its states.
- The shell: Nav, takeover menu (M21, follow its section in `MOTION.md` exactly), Footer, grain (M22), smooth scroll (M25), floating contact pill (M23), burgundy stairs wipe between routes (M02), intro counter (M01).
- The shared type effects: line reveal (M03), font shuffle (M04), scramble label (M05), letter roll (M06), button fill (M07), typed note (M10), highlight sweep (M11).
- Dither field (M08) as one reusable component with a flat fallback.
- Empty routes for every page so navigation and the wipe can be tested.

Checks: the menu opens from the button as a growing circle, links slide in, the dot follows hover, Esc closes, focus is trapped; the wipe covers and uncovers on every route change; every component is correct at 390px and 1440px; reduced motion turns all of it off cleanly.

### Phase 2: Home

Build every section of Home in `PAGES.md`, in order, with its motion: ticker, poster hero (M08, M03, M04, M05, M09), statement (M26, M10), what i build (M12), selected work (M13, M14, M15), numbers (M19), closing, footer.

Checks: with no photos and no numbers the page still looks finished; only one pinned section is on screen at any time; scrolling stays smooth on a mid-range phone.

### Phase 3: Work and case studies

- Work index: word wall (M16), tiles, card stack on phones (M27), "also built" list.
- One case-study template rendered for Repetite, Marginalia, Trailboard and BumpFix from `content/projects.ts`: progress line (M29), header band, facts, story, proof with placeholders and the gallery (M28), number and mistake, note, next project.
- BumpFix shows only its lede and "where it is now" until it has results.

Checks: dropping an image at `public/projects/repetite/cover.jpg` makes it appear on the tile, dithered, with no code change; a case study with zero screens shows the "screens coming" frames; the next-project link cycles through all four.

### Phase 4: About

Opener, bio, year strip (M17), skill pile (M18), beliefs.

Checks: the year strip is a normal vertical list below 810px; the skill pile pauses off screen and is a plain list with reduced motion.

### Phase 5: Lab, Contact, 404

Lab shelf; Contact with the question, the hidden-until-filled email, and the perspective credits (M24); the 404 page.

Checks: the email button and resume link are absent while their values are `null` and appear when filled in `content/site.ts`.

### Phase 6: Finish

- Page titles, descriptions, generated share images, favicon, sitemap, robots.
- Remove `/styleguide` from the sitemap and the dev-only Skiper tools from the build.
- Full pass with reduced motion, keyboard only, and a screen reader on Home and one case study.
- Lighthouse on a phone profile for every page: performance 85 or better, accessibility 95 or better.
- A `README.md` explaining how to add a project, a photo, a number and a link.

Checks: list every remaining `null` in `content/` so Mukund knows exactly what is still to fill in.

## Done means

Every page in `PAGES.md` exists and matches it. Every pattern in `MOTION.md` is built and has its reduced-motion form. No colour or size on the site is missing from `tokens.json`. No bracketed placeholder is visible anywhere. The site is deployed to a Vercel preview and its link is in your final report.

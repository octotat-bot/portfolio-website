# Mukund Mangla, portfolio

The site is built with Next.js, Tailwind CSS and Motion. Every word, link and number lives in `content/`, and every colour, size and timing lives in `docs/tokens.json`. You change the site by editing those files, not the components.

## Run it

You need Node 22. pnpm is run through npx, so there is nothing else to install.

```
npx pnpm@12.18.0 install
npx pnpm@12.18.0 dev          # http://localhost:3000
npx pnpm@12.18.0 build        # production build
npx pnpm@12.18.0 check:tokens # checks that nothing bypasses the design tokens
```

`dev` and `build` regenerate `styles/tokens.css` from `docs/tokens.json` first. Never edit `styles/tokens.css` by hand.

The development server shows two things the live site hides:

- Lab items that are not marked `confirmed`.
- The "screens coming" frames on case studies that have no screens yet.

`/styleguide` shows every token and component and checks them against `tokens.json`. Search engines are told to skip it.

## Fill in a blank

Every blank is `null` in `content/`. While a value is `null`, the site hides it or shows a dash. Replace the `null` with the real value and rebuild; no component needs changing.

| To set | File | Field |
| --- | --- | --- |
| Email address | `content/site.ts` | `links.email.value`, for example `"you@example.com"` (no `mailto:`) |
| Resume link | `content/site.ts` | `links.resume.value`, a full URL to the PDF |
| Site address | `content/site.ts` | `url`, for example `"https://mukundmangla.com"` |

Setting the email makes the Email link appear in the menu and footer, and the address and "Email me" button appear on Contact. Setting the resume makes the Resume link appear on Contact and in the footer. The site address is used in share links and the sitemap; until you set it, they use the address Vercel gives the deploy.

## Add a number

The numbers are in `content/site.ts`, in `numbers`. Each entry has a whole-number `value` and a `caption`:

```ts
{ value: 412, caption: "contributions on github this year" },
```

The Numbers section on Home only appears once at least two of its figures have a value. If just one is still blank, that figure shows a dash.

Case-study numbers are in `content/projects.ts`, under each project's `study.number`. Give both a `value` and a `caption`:

```ts
number: { value: 2300, caption: "foods in the built-in database" },
```

## Add a link

- **A project's repository or live site:** `content/projects.ts`, in that project's `links` (`repo` or `live`). The link appears on its case study, and in the "also built" list for SmartResume and NexaBank.
- **GitHub or LinkedIn:** `content/site.ts`, in `links`.
- **A Lab item:** `content/lab.ts`, in that item's `link`. The card shows the link's own address as its text.

## Add a photo

Pictures need no code and no entry in `content/`. Put files in `public/projects/<slug>/` and rebuild:

| File | What it does |
| --- | --- |
| `cover.jpg` | The project's tile on Home and Work. 1600 × 2000 (4:5). It shows dithered and clears on hover |
| `shot-01.jpg`, `shot-02.jpg` … | Screens on the case study, in file-name order. JPG or PNG, any shape; phone screenshots keep their shape |
| `demo.mp4` | A short silent video shown first on the case study. 10 to 30 seconds, under 8 MB |

The slugs are `repetite`, `marginalia`, `trailboard`, `bumpfix`, `smartresume` and `nexabank`.

- One or two screens show full width.
- Three or more become a gallery on desktop and a swipe carousel on phones.
- To caption screens, add `screenCaptions: ["first caption", "second caption"]` to the project's `study` in `content/projects.ts`, in the same order as the files.
- Once two or more projects have a `cover.jpg`, the covers also trail the pointer on the Work page.

## Add a project

Add an entry to `projects` in `content/projects.ts`. The order of the list is the order on the Work page.

- **Without a `study`,** it appears in the "also built" list at the bottom of Work.
- **With a `study`,** it gets a tile on Work and its own case study at `/work/<slug>`. Copy an existing entry, such as Repetite, and change every field. The next-project link at the bottom of each case study cycles through all of them.
- **A project that is still in progress:** set `hasResults: false` and name one story block in `showWhileBuilding`. Its case study then shows only the lede and that block.
- **Home's selected work** shows the slugs listed in `home.selectedWork.slugs` in `content/pages.ts`.

## Put a Lab item on the live site

In `content/lab.ts`, set `confirmed: true` on each item you want public. Until at least one is confirmed, the live Lab page shows only its title, lede and note.

## Change the look

Colours, type sizes, spacing, sizes, breakpoints, easing and durations are all in `docs/tokens.json`. If you change a token, also update any doc in `docs/` that describes it. Timings that belong to a single animation are in `lib/motion.ts`, named by their pattern ID from `docs/MOTION.md`.

## Credits

The effects started from free components by Skiper UI (skiper-ui.com, free with attribution) and React Bits (reactbits.dev). Each copied file says where it came from. The Contact page credits both. Anton, used for the share images, is under the SIL Open Font License; the licence is in `assets/fonts/`.

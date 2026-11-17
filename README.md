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
| Email address | `content/site.ts` | `links.email.value`, the address only (no `mailto:`). Already set |
| Resume link | `content/site.ts` | `links.resume.value`, a full URL to the PDF |
| Site address | `content/site.ts` | `url`, for example `"https://mukundmangla.com"` |

Setting the email makes the Email link appear in the menu and footer, and the address and "Email me" button appear on Contact. Setting the resume makes the Resume link appear on Contact and in the footer. The site address is used in share links and the sitemap; until you set it, they use the address Vercel gives the deploy.

## Add a number

The numbers are in `content/site.ts`, in `numbers`. A fixed figure is an entry with a whole-number `value` and a `caption`:

```ts
{ value: 12, caption: "apps shipped" },
```

The row shows two or three figures; add at most one more.

The GitHub and LeetCode figures are fetched live. Their `value` stays `null`, and a `live` entry names the account (`octotat-bot`, `Hakka123`). Home is rebuilt in the background at most once a day with fresh counts, by `lib/live-numbers.ts`. If GitHub or LeetCode can't be reached, the `lastKnown` count shows instead; update it now and then. To fix a figure by hand, give it a `value`.

The Numbers section on Home only appears once at least two of its figures have a value.

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

## Change the loader

Every full page load (the first visit and every refresh, but not moving between pages) plays a 4.6-second loader: 31 quick cuts between the words NEED / MONEY / FOR / FERRARI. and four photos, while a shutter closes, then the shutter splits open onto the page. The words and photos are in `content/site.ts` → `intro`, with each photo's focal point (`fx`, `fy`, 0 to 1) for its crop. The frame order and lengths are in `lib/motion.ts` → `intro.frames`.

To change a photo, put its full-size original in `assets/intro-originals/` (git ignores it), point `scripts/make-intro-assets.mjs` at it, and run `node scripts/make-intro-assets.mjs`. It writes black-and-white WebPs (at most 1600px wide) and the grain tile to `public/intro/`. It needs ffmpeg and cwebp (`brew install ffmpeg webp`).

## Change the menu portrait

The desktop menu shows `public/me/menu.png`: a PNG with a transparent background (just the person), at least 1600px tall. Replace the file and rebuild; no code changes. Without the file, the menu shows its shapes alone.

A claret ring sits on each lens of the binoculars. Their positions are in `content/site.ts`, in `menuPortrait.lenses`: `lensX` and `lensY` are percentages of the image's width and height, measured from its top-left corner. Set a lens to `null` to leave its ring out. If you change the photo, re-measure them.

The current file was cut out of `assets/portrait/menu-original.png` on this Mac with Apple's Vision framework. To cut out a new photo the same way, run `swift scripts/cutout.swift <photo> public/me/menu.png`.

## Add a project

Add an entry to `projects` in `content/projects.ts`. The order of the list is the order on the Work page.

- **Without a `study`,** it appears in the "also built" list at the bottom of Work.
- **With a `study`,** it gets a tile on Work and its own case study at `/work/<slug>`. Copy an existing entry, such as Repetite, and change every field. The next-project link at the bottom of each case study cycles through all of them.
- **A project that is still in progress:** set `hasResults: false` and name one story block in `showWhileBuilding`. Its case study then shows only the lede and that block.
- **Home's selected work** is a pile of every project with a `study`, in the order they appear in `content/projects.ts` (the last one lands on top). To change the order, move the entries.

## Put a Lab item on the live site

In `content/lab.ts`, set `confirmed: true` on each item you want public. Until at least one is confirmed, the live Lab page shows only its title, lede and note.

## Change the look

Colours, type sizes, spacing, sizes, breakpoints, easing and durations are all in `docs/tokens.json`. If you change a token, also update any doc in `docs/` that describes it. Timings that belong to a single animation are in `lib/motion.ts`, named by their pattern ID from `docs/MOTION.md`.

## Credits

The effects started from free components by Skiper UI (skiper-ui.com, free with attribution) and React Bits (reactbits.dev). Each copied file says where it came from. The Contact page credits both. Anton, used for the share images, is under the SIL Open Font License; the licence is in `assets/fonts/`.

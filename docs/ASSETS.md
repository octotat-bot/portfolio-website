# Assets

What the site needs, where each file goes, and what to show until it exists. The site must look finished with zero photos.

## Arriving later

| Asset | Path | Spec | Until it arrives |
| --- | --- | --- | --- |
| Project cover, one per project | `public/projects/<slug>/cover.jpg` | 1600 x 2000 (4:5), any colour; shown as it is, under the name band at the foot of the tile. From a wide image, crop the 4:5 part with the name and logo (the current ones are the left part of each original in `assets/project-originals/`) | Tile shows the dither field with the project name only |
| Project screens, three to six per case study | `public/projects/<slug>/shot-01.jpg` … | 1920 wide, 16:10 or the app's real ratio; phone screens 1170 x 2532 | The proof section is left out in production; development shows empty hairline frames labelled "screens coming" |
| Project video, optional | `public/projects/<slug>/demo.mp4` | 10 to 30 seconds, under 8 MB, no sound | Not shown |
| Loader pictures | `public/intro/1.webp` (Las Vegas), `2.webp` (beach and car), `3.webp` (screaming man), `4.webp` (Ferraris), `grain.webp` (256px tileable film grain) | Black and white, contrast 1.1, at most 1600px wide, WebP quality 75; built from the full-size originals in `assets/intro-originals/` (git-ignored) by `node scripts/make-intro-assets.mjs` (needs ffmpeg and cwebp), which also draws the grain. Each photo's focal point (`fx`, `fy`) is in `content/site.ts` → `intro.photos` | The loader starts after 1.5s anyway; a photo frame shows black |
| Menu portrait | `public/me/menu.png` | A PNG with a transparent background (a cut-out of the person), at least 1600px tall. Lens positions for the rings go in `content/site.ts` → `menuPortrait.lenses` (`lensX`, `lensY`, percentages of the image; `null` leaves a ring out) | The menu shows the composition alone. The current file is 1203 × 1307, cut out on-device from `assets/portrait/menu-original.png`; a taller original would look sharper |
| GitHub and LeetCode numbers | Fetched live (`lib/live-numbers.ts`), refreshed at most once a day; usernames and a last known count in `content/site.ts` | Whole numbers | If a fetch fails, the last known count shows. The Numbers section is hidden until both figures have values |
| Email, resume link | `content/site.ts` | | Email button and resume link are hidden |

Project slugs: `repetite`, `marginalia`, `trailboard`, `bumpfix`, `repomind`, `smartresume`, `nexabank`. Covers so far: Repetite, Marginalia, BumpFix and RepoMind, cropped to 4:5 from the wide originals in `assets/project-originals/`.

Adding a photo later must need no code change: the tile and case study check whether the file exists (or a flag in the project's data entry) and switch from placeholder to picture.

## Made in code, no file needed

| Asset | How |
| --- | --- |
| Grain | SVG noise filter as a data URI |
| Dither fields | Paper Shaders `Dithering` |
| Dithered pictures | Paper Shaders `ImageDithering` over the real image |
| Favicon | SVG: "MM" in Anton, ivory on burgundy, square |
| Share images | Generated per page with the Next.js image response API |
| Fonts | `next/font/google`: Anton, Geist, Geist Mono, Reenie Beanie; Rubik Scribble and Rubik Marker Hatch subset to the characters used |

## Not used

No walking footage, no image sequence, no hand-drawn SVG strokes, no icon files, no audio, no stock photos.

## Content as data

Keep every word and link out of the components:

| File | Holds |
| --- | --- |
| `content/site.ts` | Name, status lines, ticker lines, links, numbers, page titles |
| `content/projects.ts` | One entry per project: slug, name, kind, year, status, one-liner, caption, facts, story blocks, number, mistake, note, links, media flags |
| `content/about.ts` | Bio, year cards, skill groups, beliefs |
| `content/lab.ts` | Lab items |

Any value still in square brackets in `CONTENT.md` goes into these files as `null`, and the UI hides or dashes it. Never print a bracketed placeholder on the live site.

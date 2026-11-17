# Content

Every word on the site. Headlines are written in capitals because that is how they appear; running text is lowercase on purpose.

Square brackets mean a blank to fill later. Never print a bracketed value on the live site: hide it or show a dash (see `ASSETS.md`).

This copy was drafted for Mukund from what is known about his work. He should read it once and change anything that does not sound like him. Lines marked (check) are the ones most worth a second look.

## Site-wide

| Item | Text |
| --- | --- |
| Name | Mukund Mangla |
| Nav name | MUKUND MANGLA |
| Ticker, line 1 | now building repetite |
| Ticker, line 2 | open to internships |
| Floating pill | say hello |
| Footer line | i build apps, agents and the things between. |
| Footer ghost marquee | FUCK MEDIOCRITY (shown upside down) |
| Copyright | © 2026 Mukund Mangla |
| Intro counter line | loading |

Links

| Item | Value |
| --- | --- |
| GitHub | https://github.com/octotat-bot |
| LinkedIn | https://www.linkedin.com/in/mukund-mangla/ |
| Email | (in `content/site.ts`) |
| Resume | /Mukund_Mangla_Resume.pdf (the file in `public/`) |

## Menu

| Link | Number | Typed note on the right |
| --- | --- | --- |
| HOME | 00 | start here |
| WORK | 01 | the things i've built |
| ABOUT | 02 | who's behind it |
| LAB | 03 | the unfinished shelf |
| CONTACT | 04 | say hello |

Bottom-right label: designed and built by mukund mangla

## Home

**Hero**

- Name, two lines: MUKUND / MANGLA
- Status line, cycles every three seconds, each prefixed with "currently:"
  - building repetite
  - third year, computer science
  - open to internships
- Lede: i build apps, agents and the things between.
- Supporting line: third-year computer science student. i design it, build it, and then check that it actually works.
- Buttons: See the work · Say hello

**Statement**

- Sentence: I BUILD THE THING, THEN I CHECK IF IT'S ACTUALLY RIGHT.
- Note under it: most people skip the second part

**What i build**

- Heading: WHAT I BUILD
- Paragraph: web, phone, and the ai parts in between. i care about how it looks, but i care more that it does what it says.
- Button: See the work
- Word list, in this order:
  1. INTERFACES
  2. IOS APPS
  3. BACKENDS
  4. AI AGENTS
  5. SEARCH OVER DOCUMENTS
  6. REAL-TIME THINGS

**Selected work**

- Headline: THINGS I'VE BUILT
- Tiles (the rising pile): every project with a case study, in `content/projects.ts` order: Repetite, Marginalia, Trailboard, BumpFix (captions under "Projects" below)
- Note under the headline: my main one

**Numbers**

| Figure | Caption |
| --- | --- |
| Live: GitHub contributions this calendar year for octotat-bot | contributions on github this year |
| Live: LeetCode problems solved (all difficulties) for Hakka123 | leetcode problems solved |

**Closing**

- Headline: WHERE TO NEXT?
- Line: i'm looking for an internship where i can ship real things.
- Highlight sweep on: ship
- Button: Say hello

## Work

- Word wall word: MAKE
- Claret line in the wall: MAKE IT WORK. THEN MAKE IT GOOD.
- Section label for the list below the tiles: also built

## Projects

Order on the Work page: Repetite, Marginalia, Trailboard, BumpFix, SmartResume, NexaBank. The first four have case studies.

### Repetite

Repetite is his own app. Do not describe it as an AI product anywhere.

| Field | Text |
| --- | --- |
| Slug | repetite |
| Kind (tag) | iOS app |
| Year | 2026 |
| Status | in friends' hands, not on the app store yet |
| Tile caption | training and food, one ios app |
| One-liner | an ios app that tracks your training and your food in one place. |
| Role | design and build, solo (check) |
| Built with | swiftui / healthkit / swiftdata |
| Links | [REPO_URL] |
| Note | started it for myself |

Lede: i wanted one app for my workouts and my meals instead of two that don't talk to each other. so i built it.

Story

- **WHY IT EXISTS**: every tracker i tried was either a workout app with food bolted on, or the other way round. repetite treats them as one day.
- **LOGGING FOOD FAST**: type what you ate and it works out the macros. it checks a large built-in food database first, including indian food, and only asks a model when the database has no answer. you can adjust the portion before it's saved.
- **TWO MODELS, TWO JOBS**: simple entries go to a fast model so logging feels instant. harder ones go to a slower, more careful model. speed where it's safe, accuracy where it matters.
- **A DAY THAT STARTS WHEN YOU DO**: the day resets at 5:30 am by default, not midnight, and you can change it. late dinners count for the day you ate them.

One number: [REPETITE_NUMBER] with caption [WHAT_IT_MEASURES] (check: for example, foods in the database, or days of your own data logged)

What went wrong: [ONE THING THAT BROKE OR HAD TO BE REBUILT, AND WHAT YOU CHANGED]

### Marginalia

| Field | Text |
| --- | --- |
| Slug | marginalia |
| Kind (tag) | AI tool |
| Year | 2026 |
| Status | [LIVE OR REPO ONLY] |
| Tile caption | ask a pdf a question |
| One-liner | ask a question about any pdf and get the answer from the document itself. |
| Role | design and build, during an internship at mindenious |
| Built with | [STACK] |
| Links | https://github.com/octotat-bot/Marginalia |
| Note | reads so you don't have to |

Lede: built in a month during my internship at mindenious. you upload a pdf, ask something, and it answers from what the document actually says.

Story

- **THE PROBLEM**: long documents, short patience. searching for a word doesn't help when you don't know which word to search for.
- **HOW IT ANSWERS**: the document is split into passages. your question pulls out the few passages that matter, and the answer is written only from those.
- **KEEPING IT HONEST**: [HOW YOU CHECK THE ANSWER REALLY COMES FROM THE DOCUMENT: CITATIONS, PAGE NUMBERS, A REFUSAL WHEN NOTHING MATCHES]

One number: [MARGINALIA_NUMBER] with caption [WHAT_IT_MEASURES]

What went wrong: [ONE THING]

### Trailboard

| Field | Text |
| --- | --- |
| Slug | trailboard |
| Kind (tag) | Web app |
| Year | [YEAR] |
| Status | [LIVE OR REPO ONLY] |
| Tile caption | one whiteboard, many hands |
| One-liner | a whiteboard several people can draw on at the same time. |
| Role | design and build, solo |
| Built with | yjs / websockets / [FRONTEND] |
| Links | [REPO_URL] · [LIVE_URL] |
| Note | no one overwrites anyone |

Lede: a shared whiteboard where everyone's strokes show up for everyone else as they happen, and nobody's work gets overwritten.

Story

- **THE HARD PART**: two people drawing at once is easy. two people editing the same thing at once is where it breaks.
- **HOW IT STAYS IN SYNC**: every change is stored in a way that can be merged in any order and still give the same board. the server only passes changes along; it never has to decide who wins.
- **RUNNING IT MYSELF**: the sync server is my own, not a hosted service. (check: add what that made you deal with)

One number: [TRAILBOARD_NUMBER] with caption [WHAT_IT_MEASURES]

What went wrong: [ONE THING]

### BumpFix

| Field | Text |
| --- | --- |
| Slug | bumpfix |
| Kind (tag) | AI agent |
| Year | 2026 |
| Status | still building |
| Tile caption | fixes what the update broke |
| One-liner | an agent that repairs your code after a dependency update breaks it. |
| Role | design and build, solo |
| Built with | [STACK] |
| Links | [REPO_URL] |
| Note | still building this |

Lede: you update a package, forty things break, and you spend the afternoon reading a changelog. bumpfix is meant to do that afternoon for you.

Story

- **THE IDEA**: read what changed in the new version, find the places in your code that depend on the old behaviour, rewrite them, run the tests.
- **WHERE IT IS NOW**: [HONEST CURRENT STATE]
- **HOW I'LL KNOW IT WORKS**: [THE TEST: FOR EXAMPLE, N REAL UPGRADES, HOW MANY IT FIXES WITHOUT HELP]

Until there are results, this page shows the lede, "where it is now", and nothing else.

### SmartResume

| Field | Text |
| --- | --- |
| Slug | smartresume |
| Kind (tag) | Web app |
| Year | [YEAR] |
| One-liner | upload a resume, get a score, the keywords it's missing for a role, and what to fix. |
| Built with | react / node / express / mongodb / gemini |
| Links | https://github.com/octotat-bot/SmartResume · https://smartresume-rouge.vercel.app |

### NexaBank

| Field | Text |
| --- | --- |
| Slug | nexabank |
| Kind (tag) | Web app |
| Year | [YEAR] |
| One-liner | a banking app with two roles, customer and admin, and proper sign-in. |
| Built with | react / node / express / mongodb / jwt |
| Links | [REPO_URL] |

Case study labels: kind · role · built with · when · status · links. Next-project label: next.

## About

**Opener**: MAKE THE THING.

**Bio**

- Heading: HI, I'M MUKUND
- Paragraph 1: i'm a third-year computer science and ai student at newton school of technology, graduating in 2028. (check: degree name)
- Paragraph 2: i started with websites, moved to full apps, and now spend most of my time on the parts where software has to think. along the way i got picky about how things look and feel. (check)
- Paragraph 3: i'm from palwal, haryana, where i also run a shop. that's where i learned that nothing you build matters until somebody actually uses it. (check: delete if you'd rather not mention the shop)

**The road so far**

| Year | Title | Text | Place |
| --- | --- | --- | --- |
| 2024 | STARTED COLLEGE | b.tech at newton school of technology. | [CAMPUS CITY] |
| JUN 2026 | STARTED REPETITE | got tired of two apps for one day. began building my own. | on my own phone |
| JUL 2026 | INTERNSHIP, MINDENIOUS | ai/ml intern for a month. built marginalia there. | remote |
| AUG 2026 | INTERNSHIP, SKILLORBIT | ai intern. built a resume analyser as the final project. (check) | remote |
| NOW | BUILDING BUMPFIX | an agent that fixes code after updates. repetite is in friends' hands. | palwal, india |
| NEXT | AN INTERNSHIP | somewhere i can ship real things with people better than me. | [WHERE YOU'D LIKE] |

**What i work with**

- Heading: WHAT I WORK WITH
- Words that drop (each once): REACT, NEXT.JS, SWIFTUI, NODE.JS, EXPRESS, MONGODB, DOCKER, PYTHON, PYTORCH, LANGCHAIN, YJS, HEALTHKIT
- Stack lines under the pile:
  - interfaces: react / next.js / tailwind / motion
  - ios: swiftui / healthkit / swiftdata
  - backends: node.js / express / mongodb / docker / websockets
  - ai: python / pytorch / langchain / retrieval / vector databases

**Things i believe** (check all six)

| No. | Line | Highlight |
| --- | --- | --- |
| 001 | BUILD IT FOR YOURSELF FIRST | |
| 002 | A DEMO IS NOT A PRODUCT | PRODUCT |
| 003 | CHECK WHAT THE MODEL SAYS. THEN CHECK AGAIN | |
| 004 | TUTORIALS END. PROJECTS DON'T | |
| 005 | POLISH IS A FEATURE | FEATURE |
| 006 | TELL ME IT'S BAD. I'D RATHER KNOW | |

## Lab

- Title: LAB
- Lede: half-built things, old things, and ideas i haven't earned the right to call projects yet.
- Note: handle with care

Items. Mukund must confirm each one exists and that he wants it public before launch. Status tags: live, shelved, idea, old.

| Name | Status | One line | Link |
| --- | --- | --- | --- |
| DreamSignal | live | [ONE LINE] | https://dream-signal.vercel.app |
| Retrieval drift detector | idea | notices when a document search system starts returning worse results than it used to. | |
| LLM router | idea | sends each request to the cheapest model that can handle it. | |
| Volatility forecast | shelved | predicting how much a stock will move, not where. tested the honest way, one step forward at a time. | |
| Project Seal | [STATUS] | scores how good a research question is and whether its answer can be checked. | |
| Notora | [STATUS] | a notes and documentation app. | |
| Older builds | old | griefcompanion, ember, habitflow, balancio, ops-pilot. | [LINKS] |

## Contact

- Headline, two lines: WHERE TO / NEXT?
- Line: tell me what you're building, or what's broken.
- Email shown as text: the address in `content/site.ts`
- Button: Email me
- Links: GitHub · LinkedIn · Resume

**Credits**, in order

| Small line | Big line |
| --- | --- |
| written, designed and built by | MUKUND MANGLA |
| type | ANTON, GEIST, REENIE BEANIE |
| movement | MOTION |
| effects | PAPER SHADERS, SKIPER UI, REACT BITS |
| made in | PALWAL, INDIA |

Final typed note: thanks for scrolling

## 404

- Headline: NOTHING HERE
- Line: this page doesn't exist. the rest of them do.
- Button: Back home

## Page titles

| Page | Title | Description |
| --- | --- | --- |
| Home | Mukund Mangla · apps, agents and the things between | Portfolio of Mukund Mangla, a computer science student who designs and builds web apps, iOS apps and AI tools. |
| Work | Work · Mukund Mangla | Projects by Mukund Mangla: Repetite, Marginalia, Trailboard, BumpFix and more. |
| Case study | [Project name] · Mukund Mangla | The project's one-liner. |
| About | About · Mukund Mangla | Who Mukund Mangla is, what he has built so far and what he works with. |
| Lab | Lab · Mukund Mangla | Experiments, old builds and unfinished ideas. |
| Contact | Contact · Mukund Mangla | Get in touch with Mukund Mangla. |
| 404 | Not found · Mukund Mangla | |

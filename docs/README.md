# Mukund Mangla Portfolio: build kit

Everything a coding agent needs to build the site. No site code is included on purpose.

| File | What it is | Read |
| --- | --- | --- |
| `MASTER_PROMPT.md` | The prompt to paste into the agent. Seven phases, with checks at the end of each. | Paste this first |
| `DESIGN.md` | The design system: colour, type, spacing, shape, texture, components. | 1 |
| `tokens.json` | Exact values for every colour, type style, space, radius, easing and duration. | 2 |
| `LIBRARIES.md` | Which libraries to install, what each one does here, and what is banned. | 3 |
| `MOTION.md` | Every animation: what triggers it, what moves, how to build it, what it becomes with reduced motion. | 4 |
| `PAGES.md` | Every page, section by section. | 5 |
| `CONTENT.md` | Every word on the site. Bracketed items are blanks to fill later. | 6 |
| `ASSETS.md` | Files the site needs, where they go, and what to show until they arrive. | 7 |

## How to use it

1. Make an empty folder, put these files in a `docs/` folder inside it.
2. Open the folder in your coding agent and paste the whole of `MASTER_PROMPT.md`.
3. The agent builds one phase at a time and stops after each. Look at it, say what to change, then tell it to continue.

## Still to come from you

- Project photos and screenshots (see `ASSETS.md`).
- Numbers and links (search `CONTENT.md` for `[`).
- A read-through of `CONTENT.md`. The copy was drafted for you; change anything that does not sound like you.

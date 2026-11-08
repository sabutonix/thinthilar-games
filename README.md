# Thin Thi Lar Games — game.thinthilar.com

Free, phone-first Burmese games. Static files only, hosted on GitHub Pages.

| Path | What it is |
|---|---|
| `index.html` | Main menu (all games) |
| `pahaeli/` | ပဟေဠိ — 3 daily puzzles: `#word`, `#proverb`, `#groups` |
| `pahaeli/src/game.template.html` | Source of the ပဟေဠိ page (edit this, not `pahaeli/index.html`) |
| `pahaeli/src/puzzles.json` | All puzzles (generated) |
| `tools/content.py` | Hand-written content: daily-word candidates, Groups categories |
| `tools/build_puzzles.py` | Made the first `puzzles.json` from the word lists. **Do not re-run on the live site** — it reshuffles everything. Add new puzzles by appending to `puzzles.json`. |
| `tools/build_page.py` | Builds `pahaeli/index.html` from the template + puzzles |
| `farm/`, `car/` | Future games |

## Making a change
1. Edit `pahaeli/src/game.template.html`, or append new puzzles to the end of the lists in `pahaeli/src/puzzles.json`.
2. `python3 tools/build_page.py`
3. Commit and push — the live site updates in about a minute.

## Important rules
- Puzzle #1 is 8 Nov 2026 (midnight Myanmar time). **Never change `EPOCH`** or the order of existing puzzles — it would change everyone's daily puzzle and break streaks. Only add new puzzles at the **end** of each list.
- Player progress lives in each player's browser (`localStorage` keys `pahaeli.v1`, `tg.lang`). Keep those key names.

## Data sources (open licences)
myanmartools/myanmar-words (MIT), kanaung/wordlists, ye-kyaw-thu/myWord (MIT), vincent-paing/BurmeseProverbDataSet (WTFPL). Groups categories written by hand.

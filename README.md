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
| `egg/` | ဥလေး Little Egg — pocket pet. `egg/index.html` (whole game, no build step) + `egg/sprites.js` (pixel art, animal list, rarity chances) |
| `farm/`, `car/` | Future games |

## Making a change
1. Edit `pahaeli/src/game.template.html`, or append new puzzles to the end of the lists in `pahaeli/src/puzzles.json`.
2. `python3 tools/build_page.py`
3. Commit and push — the live site updates in about a minute.

## Important rules
- Puzzle #1 is 8 Nov 2026 (midnight Myanmar time). **Never change `EPOCH`** or the order of existing puzzles — it would change everyone's daily puzzle and break streaks. Only add new puzzles at the **end** of each list.
- Player progress lives in each player's browser (`localStorage` keys `pahaeli.v1`, `tg.lang`). Keep those key names.

## Little Egg (`egg/`)
- Player's pets (up to 3) are saved in the browser under `littleegg.v1` (keep that key name; data inside is version 2, and old one-pet saves are upgraded automatically). Players can move it to another phone with the backup code (starts with `LE1-`; don't change the encoding key in `BK`).
- Add new animals only at the **end** of `SPECIES` in `egg/sprites.js`; rarity chances are the `w` values in `RARITY`.
- When you change `egg/sprites.js`, `shared/account.js` or `shared/sound.js`, bump the `?v=` number on their `<script src>` lines (menu, Little Egg, Pahaeli template) so phones don't mix an old cached file with a new page.
- Drawn animal art: generate in Gemini (4 growth stages in one row, magenta background), then run `python3 tools/art/slice_sprites.py <image> <species_id> --preview check.png` to make `egg/art/<species_id>.png` (4 frames of 40×40), and add the id to `ART` in `egg/sprites.js`. Animals without art keep the 16×16 code sprites.
- Pet reactions (added 15 Nov 2026): the pet blinks, sleeps with its eyes closed, hops to its food and takes three bites, reacts to being tapped (💛) or rubbed side to side / tapped 3 times quickly (💕, at most +10 happy per hour), grumbles if poked while asleep, and runs up to say hello when you come back after 2+ hours (time last seen: `littleegg.seen`, this phone only). All of it is in `drawPet()` / `startAct()` in `egg/index.html`; motion is skipped when the phone asks for reduced motion.
- Closed eyes are made automatically from the drawn art (`shutEyes()` in `egg/sprites.js`). New art: check it with sleep in test mode; if a frame looks wrong, add it to `NO_SHUT` and that frame keeps its eyes open.
- The pet's inner life (added 16 Nov 2026): `egg/life.js` holds all its words — speech lines by situation, stage and personality, letters, dreams, grown-up notes, keepsakes and personalities (Burmese + English). Edit the Burmese there; add keepsakes only at the end of `KEEP`.
  - Personality (`p.trait`) comes from care habits counted in `p.hb` (m meal, s snack, p play, c clean, t petting, n nap, d medicine) and is fixed at the teen stage. Each trait gives a small bonus (see `isT(...)` in `egg/index.html`) and its own idle move and trick.
  - 7-day moments (`p.mo`): day 1 first word (player picks what the pet calls them, `p.you`), 2 first present, 3 personality, 4 trick, 5 letter, 6 dream; day 7 grown-up note. After the first present, a happy pet brings about one keepsake a day (`S.keep`). Every moment goes in the pet's diary (`p.diary`, Status → Diary).
  - Play is "catch the treats" (20 s, drag or ◀ ▶, ⭐ = 3, 🌶️ = −2); best score is `p.best`.
- Visiting and playdates (added 17 Nov 2026): Status → "Invite a friend to visit" makes a link `/egg/?v=V1…` that carries one pet (name, animal, age stage, form, personality, best score) — no server. Don't change the key `VK` or the field letters in `visitData()`/`vDec()`: links already sent would stop working. A new player sees the pet and a "Get your own egg" button; a player with a pet can start a playdate (say hello, play ball, share a snack; +5 happy each, once a day per friend). Friends met are kept in `S.friends` (max 20) and shown in the collection book. It is one-way: for the other pet to visit back, its owner sends their own link.
- Test mode: open `/egg/?dev=1` for time-travel buttons. It uses its own test pets (`littleegg.dev.v1`), never changes the real pets and never syncs to the account (+1h, +6h, +1d, hatch now, wipe).
- Burmese animal names to check: ပိုမရေနီယန် ခွေး (Pomeranian), ဖြူကလေး (hedgehog), ပုတ်သင်ညို (chameleon), ရွှေဝါ ခွေး (Golden retriever).

## Data sources (open licences)
myanmartools/myanmar-words (MIT), kanaung/wordlists, ye-kyaw-thu/myWord (MIT), vincent-paing/BurmeseProverbDataSet (WTFPL). Groups categories written by hand.

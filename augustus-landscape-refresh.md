# Weekly refresh — Augustus Competitive Landscape

Procedure for the weekly Routine that keeps the Augustus competitive landscape
dashboard current. Each firing starts a fresh session, so this file is the
memory: read it first, follow it, and improve it when you learn something.

**Live artifact:** https://claude.ai/code/artifact/9d2bf9d0-bcfb-4bcc-968f-6ead3bcb24f0
**Source:** `augustus-competitive-landscape.html` (artifact fragment — no doctype/head)
**Standalone:** `augustus-competitive-landscape-standalone.html` (generated, never hand-edited)
**Build:** `python3 build-standalone.py augustus-competitive-landscape.html`

## What Augustus is, in one paragraph

A Tiger Global portfolio company building a clearing bank on a stablecoin- and
AI-native core: it wants to collapse the correspondent chain so a foreign or
underbanked financial institution can clear USD on a single regulated balance
sheet, 24/7. Live euro clearing today on the legacy Ivy rails (Kraken, Bitpanda,
KuCoin); OCC conditional approval for a full-service national bank in May 2026;
USD clearing not yet at scale. The dashboard exists to answer one question:
**who else is selling this, and how far along are they?**

## The data model

All content lives in three JS objects near the top of the `<script>` block.
Nothing else needs touching for a content refresh.

| Object | Keyed by | Holds |
|---|---|---|
| `DATA` | array of entries | scores, one-liner, evidence prose, `news`, `charter`, `label` |
| `METRICS` | competitor `id` | `pos` (positioning summary) and `rows` (key metrics) |
| `CHARTERS` | competitor `id` | charter instrument, approval stage, dates — challengers only |

Scores are `traction`, `tech` and `overlap`, each 0–10; the rubric is stated in
the "How to read the scores" section of the page and must keep matching whatever
you do. `coverage` is `deep` / `partial` / `none` — the depth of Tiger's own
files, not a public-data judgement.

## Each week

1. **Sweep for new evidence.** In rough order of value:
   - `mcp__Tiger_Research__*` — `ask_cortex` for internal files (Egnyte, email,
     OneNote), `search_alphasense` for broker research, `ask_email_reports` for
     Substack and boutique research. These are async: poll `get_job_result`.
   - `mcp__InsiderScore__pressrelease_headlines` for the listed names —
     JPM, C, HSBC, BK, DB, CRCL, COIN, MA, V. This has repeatedly been the
     highest-yield source; Citi's 24/7 clearing launch surfaced here first.
   - `WebSearch` for the private companies, which the paid sources cover poorly.
2. **Update only what the evidence moves.** A new datapoint usually changes a
   metric row or adds a headline. Re-score only when something material shifts —
   a product going live, a charter stage changing, a funding round closing — and
   say so in the commit message.
3. **Add or retire competitors.** New OCC charters and new consortia are the two
   recurring sources of additions. Retire an entry only if the company is gone
   or the overlap has genuinely lapsed, never to tidy the list.
4. **Rebuild the standalone**, then verify (see below).
5. **Publish** to the existing artifact URL, so the shared link keeps working:
   `action: "read"` it first (a publish to an artifact the session has not read
   is refused), then publish with `url` set and `favicon` omitted.
6. **Commit on a dated branch** off the default branch —
   `claude/augustus-landscape-refresh-YYYY-MM-DD` — and open a **draft** PR.
   Do not push to `claude/correspondent-banking-competitors-78tsyr`; that branch
   belongs to the original PR and may already be merged.
7. **Report only what changed.** If a week produced nothing material, say that
   in one line and stop. A refresh with no findings is a valid outcome; padding
   it is not.

## Verification before publishing

Run these against the standalone file with Playwright
(`executablePath: '/opt/pw-browsers/chromium'`; never run `playwright install`):

- no `pageerror` events, in both `colorScheme: 'light'` and `'dark'`
- every `DATA` entry renders a row, a bar and a mark, and clicking its row
  loads a dossier with metrics and a positioning summary
- **no label collisions** — test matrix labels against each other *and* against
  the marks. Two rivals landing on the same `tech` score is the usual cause;
  fix by flipping one `label.anchor` and the sign of `label.dx`.
- **no clipped text** — compare `scrollWidth` to `clientWidth` on the news dates
  and any fixed-width track
- `document.documentElement.scrollWidth` does not exceed the viewport at 1340px
  and 760px
- legend glyph boxes all measure 15×15, independent of label length

Measure the DOM rather than eyeballing screenshots. Every layout bug in this
page's history was found by measurement and missed by looking.

## Things already learned the hard way

- **Marks are sized for equal ink, not equal bounding box.** A square fills its
  box; a triangle fills about half of it. The ratios `SQ`, `TRI_W`, `TRI_H`,
  `DIA` were solved by rasterising each glyph and counting opaque pixels. If a
  shape needs resizing, re-solve — do not nudge coordinates.
- **Scope CSS to `#matrix`, never bare `svg`.** A global `svg { width: 100% }`
  once stretched every legend glyph to fill its flex line, making glyph size
  depend on the length of the adjacent label.
- **`display: block` on bar fills.** Inline spans ignore width, so a percentage
  width silently renders nothing.
- **Chart colour is a single-hue ordinal blue ramp**, validated for lightness
  monotonicity and surface contrast in both themes. Institution type carries a
  redundant shape encoding so identity is never colour-alone. Do not introduce
  new hues; the copper accent is UI chrome and never a data colour.
- **The $1.79tn "record adjusted stablecoin volume" figure is Visa Onchain
  Analytics measuring the whole market**, not Circle's own volume. It is
  routinely misattributed.
- **Column's revenue has two readings** — ~$500m internal, $291m annualised
  public. Show both; do not silently pick one.
- **Open questions worth chasing:** OpenReserve has the highest overlap on the
  board and zero internal coverage, so an expert call there is the standing
  first action. Lorum's valuation and OpenReserve's are both undisclosed.

## Watchlist — the dated risks

| What | When | Why it matters |
|---|---|---|
| TCH tokenized deposit network | H1 2027 | Makes 24/7 USD settlement table stakes for anyone banking a member |
| 21-bank shared dollar stablecoin | 1H 2027 | Same, for the stablecoin leg |
| Swift shared ledger rollout | ongoing | Hands incumbents the multi-bank reach Augustus expected to own |
| OpenReserve capital raise | within 12 months of 3 Sep 2026 | $210m paid-in and 12% Tier 1, or the charter approval lapses |
| Revolut FDIC + Fed approvals | targeting 1H 2027 | Turns a conditional approval into a real bank |
| Lorum OCC trust decision | filed 31 Mar 2026 | A Fed account would end its partner-bank dependency |

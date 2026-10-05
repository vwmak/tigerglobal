# Weekly refresh — Augustus Competitive Landscape

Procedure for the weekly Routine that keeps the Augustus competitive landscape
dashboard current. Each firing starts a fresh session, so this file is the
memory: read it first, follow it, and improve it when you learn something.

## The three outputs

Every refresh updates all three. They are the same content in different places,
and leaving one stale is the main way this goes wrong.

| Output | Where | Note |
|---|---|---|
| Live artifact | https://claude.ai/code/artifact/9d2bf9d0-bcfb-4bcc-968f-6ead3bcb24f0 | Republish to this URL so the shared link never changes |
| Egnyte copy | `/Shared/Research/02. Private Companies/01. Portfolio Companies/Augustus/07. Competitors/augustuscompetitivelandscape.html` | This is `Y:\02. Private Companies\…` on the mapped drive — `Y:` is `/Shared/Research` |
| Repo | dated branch + draft PR in `vwmak/tigerglobal` | The reviewable diff |

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
   - `mcp__Tiger-Research__*` — `ask_cortex` for internal files (Egnyte, email,
     OneNote), `search_alphasense` for broker research, `ask_third_party_research`
     for Substack and boutique research (this is the tool that covers
     51insights/Artemis/Fintech Blueprint — there is no separate
     `ask_email_reports`), and `ask_expert_transcripts` for the OpenReserve
     standing item. These are async: poll `get_job_result` /
     `get_cortex_result`.
   - `mcp__InsiderScore__pressrelease_headlines` for the listed names —
     JPM, C, HSBC, BK, DB, CRCL, COIN, MA, V — when attached. This has
     repeatedly been the highest-yield source; Citi's 24/7 clearing launch
     surfaced here first. As of Sep 2026 this tool is not attached to the
     session, so `WebSearch` and `search_alphasense` carried the press-release
     sweep instead — check for it explicitly rather than assuming it's there.
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
6. **Upload the standalone build to Egnyte**, to the exact path in the table
   above, with `mcp__Egnyte__upload_file`. Two things matter here:
   - Use the **standalone** file, never the artifact fragment. The fragment has
     no doctype or `<head>` and will not render correctly opened off a drive.
   - Keep the filename **exactly** `augustuscompetitivelandscape.html` (no
     separators — that is how it was first saved). Uploading to the same path
     adds a new **version**; changing the name creates a duplicate and the team
     loses version history. Do not move older copies into `_Archive` — Egnyte
     versioning already keeps them.
   If the Egnyte tools are not attached to the session, say so in the report and
   deliver the file with `SendUserFile` so it can be dropped in by hand. Never
   report the Egnyte copy as updated when it was not.
7. **Commit on a dated branch** off the default branch —
   `claude/augustus-landscape-refresh-YYYY-MM-DD` — and open a **draft** PR.
   Do not push to `claude/correspondent-banking-competitors-78tsyr`; that branch
   belongs to the original PR and may already be merged.
8. **Report only what changed.** If a week produced nothing material, say that
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

- **The matrix is crowded along tech = 7.0, and Citi is now boxed in there.**
  At traction 8.5 / tech 7.0 Citi has `bvnk` (8.0, 7.0) immediately left and
  `visa` + `coinbase` (both 9.0, 7.0) immediately right, so both horizontal
  label placements collide with a mark. The working placement is centred
  *below* the mark: `label: { dx: 0, dy: 24, anchor: "middle" }`. `text-anchor`
  is passed straight through to the SVG, so `"middle"` is legal even though the
  other entries only use `start` / `end` — reach for it when an entry has
  neighbours on both sides.
- **`visa` and `coinbase` sit on exactly the same coordinates** (9.0, 7.0) and
  are both "network" triangles, so one mark hides the other and only one is
  clickable on the chart. Both remain reachable from the table and the overlap
  bars, and selecting either from the table renders its label, so this is
  cosmetic. Do **not** "fix" it by nudging a score — that fabricates evidence.
  If it ever needs a real fix, the honest one is a small deterministic jitter in
  the renderer for exact-duplicate coordinates, applied to the mark only.
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
  first action. The 5 Oct sweep quantified the gap rather than closing it:
  "OpenReserve" appears in exactly 2 Egnyte documents — both of them prior
  versions of this dashboard — and 0 emails, 0 attachments, 0 OneNote pages,
  and `ask_expert_transcripts` found no call naming it across Tegus, Third
  Bridge, Guidepoint and AlphaSense. There is no shortcut through the paid
  corpora; it needs a commissioned call. Lorum's valuation and OpenReserve's
  are both undisclosed.
- **Possible addition awaiting a human call: Kredete.** The 5 Oct `ask_cortex`
  sweep surfaced two in-window Tiger files (both 26 Sep 2026) under
  `/Shared/Research/02. Private Companies/02. Projects/Kredete/01. Company Data & Presentations/`
  — `2_ Kredete Series B Memo.pdf` and `10_ The $25 Trillion Market.pdf` —
  describing AI-native stablecoin cross-border payments infrastructure, the
  2011–2022 correspondent-banking decline, and **a proposed US trust bank
  charter**. That is adjacent enough to belong on this board, but Kredete reads
  as a remittance-corridor business rather than an FI clearing provider, and it
  is a Tiger project company. Left off deliberately pending a human decision —
  do not add it on a routine refresh without reading both memos first.
- **Reading the live artifact returns a rendered page, not the raw fragment.**
  `Artifact` `action: "read"` wraps the source in a host-injected
  `<!doctype html><html><head>…</head><body>` / `</body></html>` shell before
  handing it back. Strip that wrapper (keep everything from `<title>` onward,
  drop the trailing `</body></html>`) before treating the saved file as
  `augustus-competitive-landscape.html` — otherwise `build-standalone.py`
  refuses it as "already looks like a full document."
- **Check whether the repo actually has the base files before editing.** The
  PR that first added this dashboard (`vwmak/tigerglobal#4`, branch
  `claude/correspondent-banking-competitors-78tsyr`) can sit open and unmerged
  indefinitely — `main` will have none of `augustus-competitive-landscape.html`,
  `augustus-landscape-refresh.md` or `build-standalone.py` until it merges. If
  `main` is missing them, don't rebuild from scratch: pull the current content
  from the live artifact (the most up to date source, since prior refreshes
  publish there even in weeks the repo step didn't land) and branch off `main`
  fresh rather than stacking on the unmerged branch. Flag the still-open PR in
  the report so a human can decide whether to merge #4 or let this week's PR
  supersede it. As of 28 Sep 2026, PR #4 and PR #5 (`claude/augustus-landscape-refresh-2026-09-21`)
  are both still open, unmerged and based off the same stale `main` — a human
  should pick one lineage (merge #4 first, then rebase the refreshes on top,
  or close the earlier ones once a later PR supersedes them) before this
  backlog of open PRs grows further.
- **Where the base files actually live (confirmed 5 Oct 2026).** `main` still has
  only `README.md`, `index.html` and `partnership-reach.html`. Every refresh's
  file set lives on its own dated branch, each a single commit on top of the same
  `main` head. So the fastest correct start is:
  `git fetch origin main claude/augustus-landscape-refresh-<latest>` →
  `git checkout -B claude/augustus-landscape-refresh-<today> origin/main` →
  `git checkout origin/claude/augustus-landscape-refresh-<latest> -- augustus-competitive-landscape.html augustus-competitive-landscape-standalone.html augustus-landscape-refresh.md build-standalone.py`.
  That branches off `main` as required while still inheriting last week's content.
  **Cross-check it against the live artifact before editing** — on 5 Oct the
  09-28 branch's fragment was byte-for-byte identical to the published artifact
  (strip the injected `<!doctype …><head>…` wrapper and the trailing
  `</body></html>`, then compare), which confirms the branch is the true source
  and saves rebuilding from the rendered page. If they ever diverge, the artifact
  wins, per the note above.
- **The open-PR backlog is still growing.** As of 5 Oct, PR #4, PR #5 (09-21),
  the 09-28 PR and now this week's are all open against the same stale `main`.
  Each new refresh branches off `main`, so they do not stack — but nothing is
  reaching `main` either. This needs a human to merge one lineage and close the
  rest; keep flagging it every week until someone does.
- **Playwright's `chromium` executable is pre-installed but the `playwright`
  npm package is not in the repo's `node_modules`.** As of 5 Oct 2026 it
  resolves from `/opt/node-tools/node_modules` and plain `node script.js` finds
  it with no `NODE_PATH` at all; `NODE_PATH=/opt/node-tools/node_modules` is the
  safe explicit form. Confirm with
  `node -e "console.log(require.resolve('playwright'))"` rather than trusting a
  hard-coded path — it has already moved once. Never `npm install` playwright
  into the repo.
- **Two verification checks that will fail on a correct page if written naively.**
  Both cost a cycle on 5 Oct:
  - `#matrix .mark` count is `DATA.length + 1`, because the Augustus baseline
    diamond is a mark too. Assert `marks === rows + 1`, not `marks === rows`.
  - The Google Fonts stylesheet cannot be fetched in the sandbox, so Chromium
    logs a **console** error (`ERR_CERT_AUTHORITY_INVALID` / "Failed to load
    resource"). That is an environment artifact and not a `pageerror`. Listen to
    `pageerror` for the pass/fail gate and bucket resource-load console errors
    separately, or every run fails for the wrong reason.
- **`ask_third_party_research` can stall on the same `current_activity` for
  several poll cycles** (seen this week stuck on "Probing tokenized-deposit
  and TCH settlement passages" through repeated polls). It is not necessarily
  dead — but if it doesn't advance after ~10 polls, fall back to WebSearch for
  the Substack-tracked names (51insights, Artemis, Fintech Blueprint, Fintech
  Brainfood, Payments in Full) rather than waiting indefinitely.
- **InsiderScore remains unattached as of 5 Oct 2026**, fourth week running —
  check for it explicitly each week rather than assuming it's back. The footer's
  news-layer paragraph now says so explicitly, and attributes the press-release
  sweep to AlphaSense; keep that honest if the tool comes back.
- **A failed MCP connection is not a missing tool.** On 5 Oct the Egnyte server
  came back `CONNECT_TIMEOUT` on the first `ToolSearch`, then connected a few
  calls later and `mcp__Egnyte__upload_file` worked normally. If a server times
  out, search again after doing other work before falling back to `SendUserFile`.
- **Check the issuer's own press release before scoring a partnership.** The
  28 Sep Citi–Coinbase tie-up was logged last week as "design phase, not live at
  scale" on the strength of Banking Dive / CryptoTimes write-ups. Citi's own
  release says it launched *in production* in the US, bundling Coinbase Virtual
  Accounts on Citi's Virtual Account Wallet, merchant stablecoin acceptance via
  Spring by Citi with Citi as bank of record, and 24/7 USD Clearing plus Token
  Services underneath. That is a two-notch difference in what the evidence
  supports, and it cost a week. Secondary trade press systematically softens
  launch language — go to the filing or the company newsroom via
  `search_alphasense` before moving or withholding a score.
- **A same-day announcement can land right at the refresh's own cutoff.** The
  Citi × Coinbase stablecoin-checkout tie-up was announced 28 Sep 2026, the
  same date as this refresh — worth catching, but explicitly a design-phase
  collaboration ("not a claim that institutional stablecoin settlement is
  already live at scale"), so it went into the news feed and evidence text
  without moving Citi's scores. Don't let a same-day press release read as
  more settled than the source actually says.

## Watchlist — the dated risks

| What | When | Why it matters |
|---|---|---|
| TCH tokenized deposit network | H1 2027; tech partner (Quant) picked 24 Sep 2026 | Makes 24/7 USD settlement table stakes for anyone banking a member |
| Cari Network production launch | targeted end of 2026 | Same threat as TCH, one tier down at the regional/community-bank level; now bank-funded ($32.5m, 2 Sep 2026) with 30+ member banks and a live pilot |
| 21-bank shared dollar stablecoin | 1H 2027 | Same, for the stablecoin leg |
| Swift shared ledger rollout | ongoing; live USD transfer 4 Oct 2026, 19+ banks expected by end-2026 across five currencies | Hands incumbents the multi-bank reach Augustus expected to own |
| ICBA v. OCC (DDC) | filed 2 Oct 2026 | Seeks to void the Mar 2026 final rule and Interpretive Letter 1176 behind **national trust** charters for largely non-fiduciary firms. Hits Lorum (pending), Anchorage and Circle; does **not** reach the full-service charters held by Augustus, OpenReserve, Revolut, Erebor or Column. A win for the ICBA makes Augustus's charter scarcer; a loss entrenches the cheap route |
| OpenReserve capital raise | by Sep 2027 (corrected — not 12 months from the Apr 2026 seed); targets opening by Mar 2028 | $210m paid-in and 12% Tier 1, or the charter approval lapses |
| Revolut FDIC + Fed approvals | targeting 1H 2027 | Turns a conditional approval into a real bank |
| Lorum OCC trust decision | filed 31 Mar 2026 | A Fed account would end its partner-bank dependency |

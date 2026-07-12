# Bank Charter Pipeline Dashboard — refresh guide

`bank-charter-pipeline.html` tracks companies pursuing (pipeline) or newly granted
a US bank charter, grouped by charter type. It is a **self-contained static page**:
all data lives inline in the `CHARTERS` array in the `<script>` block, so the page
works with no backend and even offline (charts need the Chart.js CDN; the data
tables do not).

## What "constantly updating" means here

Three layers:

1. **Client-side.** The page shows a live ET clock, a "Data as of" date
   (`LAST_UPDATED`), and auto-reloads every `AUTO_REFRESH_MINUTES` (default 15) so a
   browser left open picks up any newly deployed version.
2. **Data refresh.** The underlying facts change when a company files, gets
   conditional approval, or receives final approval. Refreshing = re-running the
   research and rewriting two things in the HTML:
   - `const LAST_UPDATED = 'YYYY-MM-DD';`
   - the `CHARTERS = [ ... ]` array (add new applicants, move companies between
     `Pending` → `Conditionally Approved` → `Final Approval`, update dates/notes).
3. **Deployment.** Commit + push the edited HTML to the branch; whatever serves it
   (GitHub Pages / static host) then serves the fresh copy, which the open page
   auto-reloads into.

## How to refresh (manual or scheduled)

Ask Claude Code (or run the scheduled job) with roughly this instruction:

> Refresh `bank-charter-pipeline.html`. Re-research the US bank-charter pipeline and
> grants over the trailing ~2 years across all charter types (OCC national trust,
> full-service national bank de novo, national bank via acquisition/conversion, and
> Utah ILC). For each company update status (Pending / Conditionally Approved /
> Final Approval), regulator, key date, sector and notes. Add newly reported
> applicants; move companies whose status changed. Then set `LAST_UPDATED` to
> today, keep the `CHARTERS` schema identical, commit and push.

Primary sources to check each run:
- OCC news releases & "Chartering, Organization and Structure" corporate decisions
  (`occ.gov/news-issuances`, `occ.gov/topics/charters-and-licensing`)
- FDIC deposit-insurance orders (ILC approvals)
- Company press releases; trade press: Banking Dive, American Banker, Payments Dive,
  Forbes; law-firm client alerts (Steptoe, Sidley, Paul Hastings, Goodwin).

## Data schema (one object per company)

```js
{
  company, ticker, bank,        // display name, public ticker (or ''), (proposed) bank name
  type,                          // 'trust' | 'national' | 'acquired' | 'ilc'
  status,                        // 'Pending' | 'Conditionally Approved' | 'Final Approval'
  regulator,                     // e.g. 'OCC' or 'FDIC + Utah DFI'
  filed, date,                   // 'YYYY', 'YYYY-MM', or 'YYYY-MM-DD'  (date = key/most-recent action)
  sector, note                   // short descriptors
}
```

Keep `type` values in sync with the `CHARTER_TYPES` taxonomy at the top of the
script. Everything else (KPIs, charts, grouped tables, filters) is derived
automatically.

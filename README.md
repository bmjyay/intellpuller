# Intelpreter

Internal tool that automates finding exceptional AI research and news --
pulls it, curates it, interprets it into a digestible brief -- and surfaces
it in a fast, filterable feed for the team.

It does three things:

1. **Pulls** candidates from credible sources on a schedule (arXiv, NBER,
   lab research blogs via RSS), plus lets anyone add one manually by URL.
2. **Curates** each candidate with an LLM: extracts clean metadata, writes a
   tight 1-2 sentence finding, assigns a domain and any recurring
   "patterns" it illustrates, and scores quality/credibility -- low-quality
   or non-credible candidates are dropped automatically rather than
   cluttering anyone's queue.
3. **Reviews**: nothing reaches the public dashboard without a human
   approving it. Automation puts new finds in a review queue; the team
   approves, rejects, or edits before publishing.

From there, the team can star entries into a **Liked** shortlist, cross
items off as **Used** once they've gone into a brief, and ask the built-in
**Assistant** to draft a brief or pull citations -- grounded only in what's
actually in the corpus.

## Stack

- **Next.js 15 (App Router)** -- one deployable serving both the API and
  the UI. Most of the UI is server-rendered (plain `<form method="get">`
  filters); mutations (approve/reject, like, mark used, add-by-URL, the
  assistant) are client components calling the REST API directly over
  same-origin `fetch`.
- **Prisma + SQLite** -- zero-ops storage that's plenty for an internal
  team tool. Swap the datasource to Postgres/MySQL in `prisma/schema.prisma`
  if you need hosted multi-writer concurrency later; the rest of the app
  doesn't change.
- **Anthropic API** for curation (summarizing, tagging, scoring), for
  extracting metadata out of arbitrary article HTML when you add a URL by
  hand, and for the brief/citation assistant.
- **Fonts/colors**: Times New Roman throughout (a system font, set in
  `tailwind.config.ts` and `globals.css` -- no font download needed), and
  the Andus Labs brand palette (Old Lace / Violet / Zaffre / Periwinkle /
  Cinerous / Tropical Indigo / Orange) as Tailwind tokens in
  `tailwind.config.ts` (`brand-bg`, `brand-ink`, `brand-primary`,
  `brand-accent`, `brand-periwinkle`, `brand-muted`, `brand-cta`).
- **Dashboard hero**: `public/images/dashboard-hero.jpg` is a real Andus
  Labs brand collage (sourced from the brand's Drive imagery, not a
  placeholder) used as the banner atop the feed.

### Card design

Entry cards read like a journal offprint, not a generic list item: a dark
navy header (eyebrow domain label, like/used toggles, title in Cormorant
Garamond, byline) over a white body set in Lora -- a drop-capped finding,
then a "Read the full brief" toggle -- and a footer bar linking out to
the original source. Both fonts are loaded via `src/lib/cardFonts.ts` and
scoped to the card itself (as CSS variables on its root element), so the
rest of the app stays on Times New Roman. Patterns/quality score still
show on the entry detail page -- just not on the card face, to keep it
clean.

"Read the full brief" expands **twist** and **ground truth** (the
`whyItMatters` field) inline, as a label/value grid, when curation found
either; "Close" collapses it back. If an entry has neither, the same
button just links to its detail page instead. `twist` is an optional
one-sentence complication/caveat on the finding (curation is instructed
to only fill it in when the source actually describes one, never invent
one to fill the field) -- see `src/lib/curate.ts`.

### Why mutations are plain `fetch`, not Server Actions

The first version wired every button (approve/reject, add-entry, run
ingestion) to a Next.js Server Action. Those enforce an Origin-header
match against the server's own detected host, which a lot of internal-tool
hosting -- tunnels, reverse proxies, preview URLs, anything where the
browser's origin doesn't exactly match what the server sees -- silently
fails, so the buttons looked broken with no visible error. Every mutation
now hits the existing REST API (`/api/entries/:id`, `/api/ingest`, ...)
from a small client component instead, which has no such restriction and
shows a real error message if a request does fail.

## Data model

- `Entry` -- one paper/article: title, authors, org, publication, domain,
  finding, optional `twist` (a complicating nuance) and "why it matters"
  note, status (`PENDING` / `APPROVED`
  / `REJECTED` / `ARCHIVED`), quality score, `liked` flag, `usedAt`
  timestamp, and the raw excerpt it was curated from (kept for audit).
- `Source` -- a credible outlet: an arXiv query, an RSS feed, or a
  manual-only outlet with no reliable feed (e.g. Wharton, HBR).
- `Pattern` -- a recurring named phenomenon an entry illustrates (e.g.
  *Knowledge Collapse*, *Fluency Divide*, *Readiness Gap*). Lets the team
  see when unrelated papers are converging on the same underlying story.
- Domains: `TRUST_BEHAVIOR`, `COGNITION_LABOR`, `LABOR_ECONOMY`,
  `SECURITY_RISK`, `OTHER` -- see `src/lib/domains.ts`.

## Pages

The header keeps only the two most-used destinations as direct links, with
everything else grouped under two dropdowns (**Library**: Liked/Archive;
**Manage**: Add entry/Used/Sources) so the nav doesn't sprawl as pages get
added.

| Page | What it's for |
|---|---|
| `/` | The live feed -- approved entries, filterable by domain/search/pattern, sortable. Used entries never appear here (see `/used`). |
| `/review` | Pending entries pulled by automation (or added manually), waiting on a human approve/reject. |
| `/liked` (Library) | Entries starred as interesting -- a shortlist to draft briefs from, across any status. |
| `/archive` (Library) | Rejected and retired-approved entries -- kept (not deleted) so nothing gets re-ingested and re-reviewed from scratch, and can be restored. |
| `/add` (Manage) | Paste a URL, get it fetched + curated, land in the review queue. |
| `/used` (Manage) | Entries marked used (already worked into a brief) -- pulled off the live feed automatically; unmark one here to send it back. |
| `/sources` (Manage) | What's configured to pull automatically, plus a manual "run ingestion now". |
| `/entries/:id` | Full detail + inline edit + approve/reject/archive/delete. |

The **Assistant** isn't a page -- it's a floating chat launcher (bottom-right,
on every page) that opens a panel over whatever you're looking at, backed by
`/api/chat`. Drafts briefs/citations grounded only in approved (or liked)
entries; it won't invent a source.

## Getting started

```bash
npm install
cp .env.example .env      # then fill in ANTHROPIC_API_KEY
npm run db:push           # creates prisma/dev.db from the schema
npm run db:seed           # loads the example entries this repo ships with
npm run dev                # http://localhost:3000
```

If `DATABASE_URL` isn't set at all (no `.env`, forgot step 2, or a fresh
environment that doesn't carry dotfiles), `src/lib/db.ts` falls back to
the same `file:./dev.db` default rather than crashing every page --
curation/extraction still need `ANTHROPIC_API_KEY` set for anything past
browsing, though, and you still need `db:push` run at least once so the
database file actually has tables in it.

The seed data includes the set of entries used to calibrate curation
quality (Sycophantic AI / Science, NBER's Explainable AI and Knowledge
Collapse papers, the Berkeley Haas/HBR ethnography, Anthropic's Economic
Index, two Wharton pieces, and DeepMind's AI Control Roadmap) -- some
`APPROVED`, a couple left `PENDING` to show what the review queue looks
like.

## Running ingestion

- **From the UI**: Sources page &rarr; "Run ingestion now".
- **From the CLI**: `npm run ingest` (loads `.env`, runs the same code
  path, prints a JSON report).
- **On a schedule**: `.github/workflows/ingest.yml` hits the deployed
  app's `POST /api/ingest` daily. Set repo secrets `APP_URL` and
  `INGEST_TOKEN` (the latter must match the server's `INGEST_TOKEN` env
  var -- leave both the env var and the workflow's `Authorization` header
  out if the app isn't reachable from the public internet).

Ingestion is idempotent: it skips any URL already in the database before
spending an LLM call on it, so re-running it (or overlapping a manual run
with the scheduled one) is safe.

## Adding a source

Sources with a stable feed can be pulled automatically. Add one via
`POST /api/sources`:

```jsonc
// RSS / Atom feed (a lab blog, NBER's "new papers" feed, ...)
{ "name": "OpenAI Blog", "kind": "RSS", "org": "OpenAI", "feedUrl": "https://openai.com/blog/rss.xml" }

// arXiv search query (see https://info.arxiv.org/help/api/user-manual.html)
{ "name": "arXiv: AI safety", "kind": "ARXIV", "arxivQuery": "cat:cs.CY+AND+abs:alignment" }

// No usable feed -- entries only ever arrive via Add entry / add-by-URL
{ "name": "Some Outlet", "kind": "MANUAL", "org": "Some Outlet" }
```

Vendor blogs move their RSS URLs around without warning -- if a source
starts silently returning nothing, check the feed URL first.

## API

All endpoints return/accept JSON.

| Method | Path                | Purpose |
|---|---|---|
| GET    | `/api/entries`      | List/filter entries. Query params: `domain`, `status` (default `APPROVED`, or `ALL`), `q`, `pattern`, `sort` (`recent` \| `score`), `liked` (`true`), `used` (`hide` \| `only`). |
| POST   | `/api/entries`      | Add an entry by URL: `{ "url": "...", "status"?: "PENDING" \| "APPROVED" }`. Fetches + curates it. |
| GET    | `/api/entries/:id`  | Fetch one entry with its patterns/source. |
| PATCH  | `/api/entries/:id`  | Partial update -- editorial fields, `status` (approve/reject/archive), `liked` (bool), `used` (bool, sets/clears `usedAt`), or `patternNames` (replaces tags). |
| DELETE | `/api/entries/:id`  | Remove an entry. |
| POST   | `/api/ingest`       | Run all automated sources now. `Authorization: Bearer <INGEST_TOKEN>` if that env var is set. |
| GET/POST | `/api/sources`    | List / register sources. |
| GET    | `/api/patterns`     | List patterns with entry counts. |
| POST   | `/api/chat`         | Brief/citation assistant. `{ "messages": [{role, content}, ...], "scope"?: "all" \| "liked" }` -- replies grounded only in that scope's corpus. |

## Why review-gated, not fully automatic

The brief for this tool was to surface *exceptional* research, not
everything that mentions AI. Curation's quality/credibility bar keeps the
firehose out of the queue, but "credible source + specific finding" is
still a judgment call an LLM will get wrong often enough that a
human-in-the-loop review step is worth the friction -- especially for
outlets outside a strict academic allowlist (see the Berkeley Haas/HBR
seed entry, which is flagged `PENDING` for exactly that reason). Approving
straight from the review queue takes one click; nothing stops a team from
loosening the quality-score cutoff in `src/lib/ingest.ts` once they trust
the model's judgment more.

## Read-time estimate

The "~N min brief" badge estimates time to read *our* curated finding and
why-it-matters note, not the underlying paper -- we only ever store a short
excerpt of the source, so a full-paper estimate would be a guess dressed
up as a fact. It's honestly labeled "brief," not "read."

## Security notes

- No authentication of its own -- put it behind whatever auth/VPN your team
  already uses for internal tools before exposing it beyond localhost.
- `npm audit` is clean except one high-severity advisory against a copy of
  `postcss` bundled *inside* Next.js's own build tooling (not the direct
  `postcss` dependency this project uses, which is already patched); fully
  closing it requires Next 16, a larger migration than was worth it for
  this pass.
- `/api/ingest` accepts an unauthenticated `POST` unless you set
  `INGEST_TOKEN` -- set it once the app is reachable from outside your own
  network.

## Deploying

This is a standard Next.js app -- deploy it anywhere Next.js runs (a VM,
a container, Vercel, etc.), behind whatever auth/VPN your team already
uses for internal tools (this app has no auth of its own). If you deploy
to a platform with an ephemeral filesystem, point `DATABASE_URL` at a
hosted Postgres/MySQL instance instead of the default SQLite file, or your
data won't survive a redeploy.

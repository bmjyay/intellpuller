# intellpuller

Internal tool that automates finding exceptional AI research and news, and
surfaces it in a fast, filterable feed for the team.

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

## Stack

- **Next.js 14 (App Router)** -- one deployable serving both the API and
  the UI. Most of the UI is server-rendered (plain `<form method="get">`
  filters, Server Actions for mutations), so there's very little client JS.
- **Prisma + SQLite** -- zero-ops storage that's plenty for an internal
  team tool. Swap the datasource to Postgres/MySQL in `prisma/schema.prisma`
  if you need hosted multi-writer concurrency later; the rest of the app
  doesn't change.
- **Anthropic API** for curation (summarizing, tagging, scoring) and for
  extracting metadata out of arbitrary article HTML when you add a URL
  by hand.

## Data model

- `Entry` -- one paper/article: title, authors, org, publication, domain,
  finding, optional "why it matters" note, status (`PENDING` / `APPROVED`
  / `REJECTED` / `ARCHIVED`), quality score, and the raw excerpt it was
  curated from (kept for audit).
- `Source` -- a credible outlet: an arXiv query, an RSS feed, or a
  manual-only outlet with no reliable feed (e.g. Wharton, HBR).
- `Pattern` -- a recurring named phenomenon an entry illustrates (e.g.
  *Knowledge Collapse*, *Fluency Divide*, *Readiness Gap*). Lets the team
  see when unrelated papers are converging on the same underlying story.
- Domains: `TRUST_BEHAVIOR`, `COGNITION_LABOR`, `LABOR_ECONOMY`,
  `SECURITY_RISK`, `OTHER` -- see `src/lib/domains.ts`.

## Getting started

```bash
npm install
cp .env.example .env      # then fill in ANTHROPIC_API_KEY
npm run db:push           # creates prisma/dev.db from the schema
npm run db:seed           # loads the example entries this repo ships with
npm run dev                # http://localhost:3000
```

The seed data includes the set of entries used to calibrate curation
quality (Sycophantic AI / Science, NBER's Explainable AI and Knowledge
Collapse papers, the Berkeley Haas/HBR ethnography, Anthropic's Economic
Index, two Wharton pieces, and DeepMind's AI Control Roadmap) -- some
`APPROVED`, a couple left `PENDING` to show what the review queue looks
like.

## Running ingestion

- **From the UI**: Sources page &rarr; "Run ingestion now" (a Server
  Action, no extra auth).
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
| GET    | `/api/entries`      | List/filter entries. Query params: `domain`, `status` (default `APPROVED`, or `ALL`), `q`, `pattern`, `sort` (`recent` \| `score`). |
| POST   | `/api/entries`      | Add an entry by URL: `{ "url": "...", "status"?: "PENDING" \| "APPROVED" }`. Fetches + curates it. |
| GET    | `/api/entries/:id`  | Fetch one entry with its patterns/source. |
| PATCH  | `/api/entries/:id`  | Partial update -- editorial fields, `status` (approve/reject/archive), or `patternNames` (replaces tags). |
| DELETE | `/api/entries/:id`  | Remove an entry. |
| POST   | `/api/ingest`       | Run all automated sources now. `Authorization: Bearer <INGEST_TOKEN>` if that env var is set. |
| GET/POST | `/api/sources`    | List / register sources. |
| GET    | `/api/patterns`     | List patterns with entry counts. |

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

## Security notes

- No authentication of its own -- put it behind whatever auth/VPN your team
  already uses for internal tools before exposing it beyond localhost.
- `npm audit` is clean except one high-severity advisory against a copy of
  `postcss` bundled *inside* Next.js's own build tooling (not the direct
  `postcss` dependency this project uses, which is already patched); fully
  closing it requires Next 16, a larger migration (async `params`/
  `searchParams` again, etc.) than was worth it for this pass.
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

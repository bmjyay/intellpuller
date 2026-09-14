import { EntryStatus, SourceKind } from "./enums";
import { prisma } from "./db";
import { curateCandidate } from "./curate";
import { fetchArxiv } from "./sources/arxiv";
import { fetchRss } from "./sources/rss";
import type { Candidate } from "./sources/types";

export type IngestReport = {
  sourcesChecked: number;
  candidatesFound: number;
  skippedExisting: number;
  curated: number;
  failed: { source: string; error: string }[];
};

// Pulls fresh candidates from every active, automatable source (arXiv + RSS
// -- MANUAL sources are only ever added via the add-by-URL flow), runs each
// new one through curation, and stores it as PENDING for human review.
//
// Safe to run repeatedly (e.g. from a daily cron): existing URLs are
// skipped before spending an LLM call on them.
export async function runIngest(): Promise<IngestReport> {
  const sources = await prisma.source.findMany({
    where: { active: true, kind: { in: [SourceKind.ARXIV, SourceKind.RSS] } },
  });
  const existingPatterns = await prisma.pattern.findMany({ select: { name: true } });
  const patternNames = existingPatterns.map((p) => p.name);

  const report: IngestReport = {
    sourcesChecked: sources.length,
    candidatesFound: 0,
    skippedExisting: 0,
    curated: 0,
    failed: [],
  };

  for (const source of sources) {
    let candidates: Candidate[] = [];
    try {
      if (source.kind === SourceKind.ARXIV && source.arxivQuery) {
        candidates = await fetchArxiv({ query: source.arxivQuery });
      } else if (source.kind === SourceKind.RSS && source.feedUrl) {
        candidates = await fetchRss(source.feedUrl, source.org ?? undefined);
      }
    } catch (err) {
      report.failed.push({ source: source.name, error: (err as Error).message });
      continue; // one bad feed shouldn't stop the rest of ingestion
    }

    report.candidatesFound += candidates.length;

    for (const candidate of candidates) {
      const already = await prisma.entry.findUnique({ where: { url: candidate.url } });
      if (already) {
        report.skippedExisting += 1;
        continue;
      }

      try {
        const curation = await curateCandidate(candidate, patternNames);

        // Don't bother the team with things curation itself flagged as
        // low-quality or not credible -- keep them out entirely rather
        // than cluttering the review queue.
        if (!curation.credibleFlag || curation.qualityScore < 3) {
          continue;
        }

        await saveCuratedEntry(candidate, curation, source.id);
        report.curated += 1;
      } catch (err) {
        report.failed.push({ source: `${source.name} / ${candidate.url}`, error: (err as Error).message });
      }
    }
  }

  return report;
}

export async function saveCuratedEntry(
  candidate: Pick<Candidate, "url" | "rawExcerpt">,
  curation: Awaited<ReturnType<typeof curateCandidate>>,
  sourceId?: string,
  status: EntryStatus = EntryStatus.PENDING
) {
  // Patterns are looked up/created by name -- curation may propose a new
  // one, which just becomes available for future entries to reuse.
  const patternRecords = await Promise.all(
    curation.patternNames.map((name) =>
      prisma.pattern.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  return prisma.entry.create({
    data: {
      title: curation.title,
      url: candidate.url,
      authors: curation.authors,
      org: curation.org,
      publication: curation.publication,
      domain: curation.domain,
      finding: curation.finding,
      whyItMatters: curation.whyItMatters,
      status,
      qualityScore: curation.qualityScore,
      credibleFlag: curation.credibleFlag,
      rawExcerpt: candidate.rawExcerpt,
      addedBy: "automation",
      sourceId,
      patterns: { connect: patternRecords.map((p) => ({ id: p.id })) },
    },
  });
}

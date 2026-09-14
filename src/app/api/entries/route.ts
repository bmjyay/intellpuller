import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { EntryStatus } from "@/lib/enums";
import { prisma } from "@/lib/db";
import { curateCandidate } from "@/lib/curate";
import { fetchUrlAsText } from "@/lib/sources/extract";
import { buildEntryWhere } from "@/lib/entryQuery";

export const dynamic = "force-dynamic";

// GET /api/entries?domain=&status=&q=&pattern=&sort=recent|score&liked=true&used=hide|only
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const sort = params.get("sort") ?? "recent";

  const where = buildEntryWhere({
    status: params.get("status") ?? EntryStatus.APPROVED,
    domain: params.get("domain") ?? undefined,
    pattern: params.get("pattern") ?? undefined,
    q: params.get("q") ?? undefined,
    liked: params.get("liked") === "true",
    used: (params.get("used") as "hide" | "only" | null) ?? undefined,
  });

  const orderBy: Prisma.EntryOrderByWithRelationInput =
    sort === "score" ? { qualityScore: "desc" } : { publishedAt: "desc" };

  const entries = await prisma.entry.findMany({
    where,
    orderBy,
    include: { patterns: true, source: true },
    take: 200,
  });

  return NextResponse.json({ entries });
}

// POST /api/entries -- manual add. Body: { url: string, status?: "PENDING" | "APPROVED" }
// Fetches the URL, curates it via the LLM, and stores the result.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const url = body?.url;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Body must include a `url` string." }, { status: 400 });
  }

  const existing = await prisma.entry.findUnique({ where: { url } });
  if (existing) {
    return NextResponse.json({ error: "An entry for this URL already exists.", entry: existing }, { status: 409 });
  }

  let fetched: { url: string; rawExcerpt?: string };
  try {
    fetched = await fetchUrlAsText(url);
  } catch (err) {
    return NextResponse.json({ error: `Could not fetch URL: ${(err as Error).message}` }, { status: 422 });
  }

  const patternNames = (await prisma.pattern.findMany({ select: { name: true } })).map((p) => p.name);

  let curation;
  try {
    curation = await curateCandidate(
      { title: url, url, rawExcerpt: fetched.rawExcerpt },
      patternNames
    );
  } catch (err) {
    return NextResponse.json({ error: `Curation failed: ${(err as Error).message}` }, { status: 502 });
  }

  const patternRecords = await Promise.all(
    curation.patternNames.map((name) =>
      prisma.pattern.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const status: EntryStatus =
    body?.status === "APPROVED" ? EntryStatus.APPROVED : EntryStatus.PENDING;

  const entry = await prisma.entry.create({
    data: {
      title: curation.title,
      url,
      authors: curation.authors,
      org: curation.org,
      publication: curation.publication,
      domain: curation.domain,
      finding: curation.finding,
      whyItMatters: curation.whyItMatters,
      status,
      qualityScore: curation.qualityScore,
      credibleFlag: curation.credibleFlag,
      rawExcerpt: fetched.rawExcerpt,
      addedBy: body?.addedBy ?? "manual",
      patterns: { connect: patternRecords.map((p) => ({ id: p.id })) },
    },
    include: { patterns: true },
  });

  return NextResponse.json({ entry, curation }, { status: 201 });
}

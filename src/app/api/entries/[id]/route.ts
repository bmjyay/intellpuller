import { NextRequest, NextResponse } from "next/server";
import { Domain, EntryStatus } from "@/lib/enums";
import { prisma } from "@/lib/db";
import { ALL_DOMAINS } from "@/lib/domains";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: { patterns: true, source: true },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ entry });
}

// PATCH -- partial update. Used for approve/reject (status), inline edits
// (title/finding/whyItMatters/domain/qualityScore), and pattern retagging
// (patternNames replaces the full set).
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });

  const existing = await prisma.entry.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};

  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.finding === "string") data.finding = body.finding;
  if (typeof body.twist === "string" || body.twist === null) data.twist = body.twist;
  if (typeof body.whyItMatters === "string" || body.whyItMatters === null) data.whyItMatters = body.whyItMatters;
  if (typeof body.authors === "string") data.authors = body.authors;
  if (typeof body.org === "string") data.org = body.org;
  if (typeof body.publication === "string") data.publication = body.publication;
  if (typeof body.domain === "string" && ALL_DOMAINS.includes(body.domain as Domain)) data.domain = body.domain;
  if (typeof body.qualityScore === "number") data.qualityScore = Math.max(1, Math.min(5, Math.round(body.qualityScore)));
  if (typeof body.credibleFlag === "boolean") data.credibleFlag = body.credibleFlag;
  if (typeof body.liked === "boolean") data.liked = body.liked;
  // `used` is a write-only convenience over the usedAt timestamp: true sets
  // it to now (if not already set), false clears it.
  if (typeof body.used === "boolean") data.usedAt = body.used ? existing.usedAt ?? new Date() : null;

  if (typeof body.status === "string" && body.status in EntryStatus) {
    data.status = body.status;
    if (body.status === EntryStatus.APPROVED || body.status === EntryStatus.REJECTED) {
      data.reviewedAt = new Date();
      if (typeof body.reviewedBy === "string") data.reviewedBy = body.reviewedBy;
    }
  }

  if (Array.isArray(body.patternNames)) {
    const names: string[] = body.patternNames.filter((n: unknown) => typeof n === "string");
    const records = await Promise.all(
      names.map((name) => prisma.pattern.upsert({ where: { name }, update: {}, create: { name } }))
    );
    data.patterns = { set: records.map((p) => ({ id: p.id })) };
  }

  const entry = await prisma.entry.update({
    where: { id },
    data,
    include: { patterns: true, source: true },
  });

  return NextResponse.json({ entry });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const existing = await prisma.entry.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.entry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

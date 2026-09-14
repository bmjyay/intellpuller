import { NextRequest, NextResponse } from "next/server";
import { SourceKind } from "@/lib/enums";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sources = await prisma.source.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { entries: true } } },
  });
  return NextResponse.json({ sources });
}

// POST /api/sources -- register a new pullable source (RSS feed or arXiv query).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.kind) {
    return NextResponse.json({ error: "Body must include `name` and `kind`." }, { status: 400 });
  }
  if (!(body.kind in SourceKind)) {
    return NextResponse.json({ error: `kind must be one of ${Object.keys(SourceKind).join(", ")}` }, { status: 400 });
  }

  const source = await prisma.source.create({
    data: {
      name: body.name,
      kind: body.kind,
      org: body.org,
      feedUrl: body.feedUrl,
      arxivQuery: body.arxivQuery,
      credible: body.credible ?? true,
      notes: body.notes,
    },
  });

  return NextResponse.json({ source }, { status: 201 });
}

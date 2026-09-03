import { NextRequest, NextResponse } from "next/server";
import { runIngest } from "@/lib/ingest";

export const dynamic = "force-dynamic";
// Ingestion calls the LLM per candidate and hits external feeds -- avoid
// the default serverless timeout on hosts that impose one.
export const maxDuration = 300;

// POST /api/ingest -- pulls fresh candidates from all active automated
// sources, curates each new one, and stores results as PENDING for review.
// Intended to be hit by a scheduler (see .github/workflows/ingest.yml).
export async function POST(req: NextRequest) {
  const token = process.env.INGEST_TOKEN;
  if (token) {
    const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (provided !== token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const report = await runIngest();
    return NextResponse.json({ report });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

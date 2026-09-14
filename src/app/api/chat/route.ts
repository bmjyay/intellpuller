import { NextRequest, NextResponse } from "next/server";
import { anthropic, CURATION_MODEL } from "@/lib/anthropic";
import { prisma } from "@/lib/db";
import { EntryStatus } from "@/lib/enums";
import { DOMAIN_LABELS } from "@/lib/domains";
import type { Domain } from "@/lib/enums";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_HISTORY = 20;
const MAX_CORPUS_ENTRIES = 60;

// Brief/citation assistant. Grounds every answer in the actual corpus --
// approved entries, plus whatever's been liked (the team's own shortlist)
// -- rather than letting the model draft from its own general knowledge,
// so anything it writes traces back to a real, credible entry with a URL.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  const scope: "liked" | "all" = body?.scope === "liked" ? "liked" : "all";

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Body must include a `messages` array ending in a user turn." }, { status: 400 });
  }

  const corpus = await prisma.entry.findMany({
    where: scope === "liked" ? { liked: true } : { status: EntryStatus.APPROVED },
    orderBy: { publishedAt: "desc" },
    take: MAX_CORPUS_ENTRIES,
    include: { patterns: true },
  });

  if (corpus.length === 0) {
    return NextResponse.json({
      reply:
        scope === "liked"
          ? "Nothing's been liked yet, so there's no shortlist to draft from -- like a few entries first, or ask me against the full corpus."
          : "There aren't any approved entries yet to draft from -- approve some in the review queue first.",
    });
  }

  const corpusBlock = corpus
    .map((e, i) => {
      const meta = [e.authors, e.org, e.publication].filter(Boolean).join(", ");
      const patterns = e.patterns.map((p) => p.name).join(", ");
      return [
        `[${i + 1}] "${e.title}"${meta ? ` -- ${meta}` : ""}`,
        `    Domain: ${DOMAIN_LABELS[e.domain as Domain] ?? e.domain}${patterns ? ` | Patterns: ${patterns}` : ""}`,
        `    Finding: ${e.finding}`,
        e.whyItMatters ? `    Why it matters: ${e.whyItMatters}` : null,
        `    URL: ${e.url}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const systemPrompt = `You are the brief-writing and citation assistant for Intelpreter, an internal tool that \
tracks exceptional AI research and reporting for the team. You help draft briefs, summaries, and talking \
points, and you help find/format citations.

Ground every factual claim ONLY in the corpus entries below -- never invent a paper, finding, or URL that \
isn't listed. If the corpus doesn't cover what's asked, say so plainly rather than filling the gap from \
general knowledge. When you use an entry, cite it inline as a markdown link using its title and URL, e.g. \
[Sycophantic AI Decreases Prosocial Intentions](https://arxiv.org/abs/2510.01395). Keep briefs tight and \
skimmable -- this team reads a lot of these.

Corpus (${corpus.length} ${scope === "liked" ? "liked" : "approved"} entries, most recent first):

${corpusBlock}`;

  try {
    const response = await anthropic().messages.create({
      model: CURATION_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content
      .filter((block): block is { type: "text"; text: string } => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return NextResponse.json({ reply: text });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}

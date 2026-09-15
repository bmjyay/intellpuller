import type Anthropic from "@anthropic-ai/sdk";
import { Domain } from "./enums";
import { anthropic, CURATION_MODEL } from "./anthropic";
import type { Candidate } from "./sources/types";
import { ALL_DOMAINS, DOMAIN_LABELS } from "./domains";

export type CurationResult = {
  title: string;
  authors?: string;
  org?: string;
  publication?: string;
  domain: Domain;
  finding: string;
  twist?: string;
  whyItMatters?: string;
  qualityScore: number; // 1-5
  credibleFlag: boolean;
  credibilityNote?: string;
  patternNames: string[];
};

const SYSTEM_PROMPT = `You are the curation editor for Intelpreter, an internal tool that tracks \
exceptional, credible research and reporting on how AI affects trust, cognition, labor, and \
security -- for an internal team, not the public. You are ruthless about signal over noise: \
most papers and posts you see should NOT be treated as exceptional.

A strong entry has ALL of:
- A credible source: peer-reviewed research, a national/university research bureau (e.g. NBER), \
a reputable lab's own technical publication, or first-party reporting from an outlet with an \
editorial process (e.g. HBR, a named university's newsroom). Marketing copy, SEO content, and \
unsourced blog takes are not credible.
- A specific, falsifiable finding -- not a vague claim like "AI is changing work." Prefer studies \
with a method (experiment, field study, formal model, large survey) over opinion.
- Relevance to one of these domains: ${ALL_DOMAINS.map((d) => `${d} (${DOMAIN_LABELS[d]})`).join(", ")}.

Given raw text about one paper/article/report, extract clean metadata and a tight editorial \
summary by calling the submit_curation tool. Keep "finding" to 1-2 sentences of the actual \
result (not the topic). "twist" is optional -- a single sentence naming a genuine complication \
in the finding (an effect that reverses under some condition, a result that only holds for part \
of the sample, a null result where one was expected); only include it if the source actually \
describes one, never invent one to fill the field. "whyItMatters" is optional -- only include it \
if there's a genuine editorial angle (a tension with other findings, a notable admission, a \
strong complement to a known pattern); leave it empty rather than restating the finding. \
qualityScore is 1-5: 5 = publish immediately, 1 = do not surface to the team. credibleFlag should \
be false for content that is marketing, unsourced, or otherwise not credible enough to trust \
without a second look.`;

const TOOL_NAME = "submit_curation";

function buildTool(existingPatternNames: string[]) {
  return {
    name: TOOL_NAME,
    description: "Submit the curated metadata and editorial judgment for one entry.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Clean paper/article title." },
        authors: { type: "string", description: "Comma-separated author names, if known." },
        org: { type: "string", description: "Primary institution/company behind the work." },
        publication: { type: "string", description: "Venue, e.g. 'Science', 'NBER Working Paper', 'arXiv'." },
        domain: { type: "string", enum: ALL_DOMAINS },
        finding: { type: "string", description: "1-2 sentence core, specific finding." },
        twist: {
          type: "string",
          description: "Optional: a genuine complicating nuance/caveat on the finding. Omit if none.",
        },
        whyItMatters: { type: "string", description: "Optional editorial context. Omit if none." },
        qualityScore: { type: "integer", minimum: 1, maximum: 5 },
        credibleFlag: { type: "boolean" },
        credibilityNote: {
          type: "string",
          description: "Optional: why credibility is in question, if credibleFlag is false or borderline.",
        },
        patternNames: {
          type: "array",
          items: { type: "string" },
          description:
            `Zero or more recurring pattern names this entry illustrates. Prefer these existing ` +
            `patterns when they genuinely fit: ${existingPatternNames.join(", ") || "(none yet)"}. ` +
            `Only propose a new pattern name if none of the existing ones fit and the phenomenon is ` +
            `clearly recurring, not one-off.`,
        },
      },
      required: ["title", "domain", "finding", "qualityScore", "credibleFlag", "patternNames"],
    },
  };
}

export async function curateCandidate(
  candidate: Candidate,
  existingPatternNames: string[] = []
): Promise<CurationResult> {
  const tool = buildTool(existingPatternNames);

  const userContent = [
    `Title (as fetched): ${candidate.title}`,
    candidate.authors ? `Authors (as fetched): ${candidate.authors}` : null,
    candidate.org ? `Org (as fetched): ${candidate.org}` : null,
    candidate.publication ? `Publication (as fetched): ${candidate.publication}` : null,
    candidate.publishedAt ? `Published: ${candidate.publishedAt.toISOString().slice(0, 10)}` : null,
    `URL: ${candidate.url}`,
    "",
    "Raw text / abstract:",
    candidate.rawExcerpt || "(none available -- judge from title/metadata alone)",
  ]
    .filter(Boolean)
    .join("\n");

  const message = await anthropic().messages.create({
    model: CURATION_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [tool],
    tool_choice: { type: "tool", name: TOOL_NAME },
    messages: [{ role: "user", content: userContent }],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("Curation model did not return a tool_use block.");
  }

  const input = toolUse.input as Record<string, unknown>;
  return {
    title: String(input.title ?? candidate.title),
    authors: input.authors ? String(input.authors) : candidate.authors,
    org: input.org ? String(input.org) : candidate.org,
    publication: input.publication ? String(input.publication) : candidate.publication,
    domain: (ALL_DOMAINS.includes(input.domain as Domain) ? input.domain : "OTHER") as Domain,
    finding: String(input.finding ?? ""),
    twist: input.twist ? String(input.twist) : undefined,
    whyItMatters: input.whyItMatters ? String(input.whyItMatters) : undefined,
    qualityScore: clampScore(Number(input.qualityScore)),
    credibleFlag: Boolean(input.credibleFlag),
    credibilityNote: input.credibilityNote ? String(input.credibilityNote) : undefined,
    patternNames: Array.isArray(input.patternNames) ? input.patternNames.map(String) : [],
  };
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(5, Math.round(n)));
}

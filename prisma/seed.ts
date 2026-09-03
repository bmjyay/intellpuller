import { PrismaClient } from "@prisma/client";
import { Domain, SourceKind, EntryStatus } from "../src/lib/enums";

const prisma = new PrismaClient();

// The credible outlets we know how to pull from automatically, plus a
// couple of "manual" sources for outlets without a usable feed (Wharton,
// HBR) where entries get added by hand or via the "add by URL" flow.
const sources = [
  {
    name: "arXiv",
    kind: SourceKind.ARXIV,
    org: "arXiv.org",
    // export.arxiv.org search query -- tuned toward AI/economics/safety
    // papers about human impact, not raw ML benchmarks. Tune freely.
    arxivQuery:
      'cat:cs.AI+AND+(abs:"human-AI"+OR+abs:sycophan*+OR+abs:"knowledge collapse"+OR+abs:"labor market")',
    credible: true,
  },
  {
    name: "NBER Working Papers",
    kind: SourceKind.RSS,
    org: "National Bureau of Economic Research",
    feedUrl: "https://www.nber.org/rss/new.xml",
    credible: true,
  },
  {
    name: "Anthropic Research",
    kind: SourceKind.RSS,
    org: "Anthropic",
    feedUrl: "https://www.anthropic.com/rss.xml",
    credible: true,
    notes: "Verify feed URL periodically -- vendor blogs move these without redirects.",
  },
  {
    name: "Google DeepMind Blog",
    kind: SourceKind.RSS,
    org: "Google DeepMind",
    feedUrl: "https://deepmind.google/discover/blog/rss.xml",
    credible: true,
    notes: "Verify feed URL periodically -- vendor blogs move these without redirects.",
  },
  {
    name: "Wharton Human-AI Research",
    kind: SourceKind.MANUAL,
    org: "Wharton / GBK Collective",
    feedUrl: "https://ai.wharton.upenn.edu/",
    credible: true,
    notes: "No stable feed -- add via the manual URL-extract flow.",
  },
  {
    name: "Harvard Business Review",
    kind: SourceKind.MANUAL,
    org: "Harvard Business Review",
    credible: true,
    notes: "Outside the primary academic allowlist; keep on manual review, judge case by case.",
  },
  {
    name: "Science",
    kind: SourceKind.MANUAL,
    org: "AAAS",
    credible: true,
  },
];

const patterns = [
  {
    name: "Knowledge Collapse",
    summary:
      "AI-mediated information aggregation narrows what gets learned or retained, across both training loops and individual incentives.",
  },
  {
    name: "Fluency Divide",
    summary:
      "AI use widens the gap between people who can wield it well and everyone else, rather than leveling the field.",
  },
  {
    name: "Training Mirage",
    summary:
      "Perceived productivity or learning gains from AI tools don't show up as real slack -- they get reabsorbed as more scope, not saved time.",
  },
  {
    name: "Readiness Gap",
    summary:
      "Organizations adopt AI tools faster than they build the psychological/structural readiness for people to use them well.",
  },
  {
    name: "Credential Snap",
    summary:
      "AI capability erodes the value of entry-level credentials and hiring pipelines faster than firms adjust.",
  },
  {
    name: "Frontier Lab Concedes Risk",
    summary:
      "A frontier AI lab publicly admits a disruption or risk its own systems create is not yet solved.",
  },
];

type SeedEntry = {
  title: string;
  url: string;
  authors?: string;
  org?: string;
  publication?: string;
  publishedAt?: string;
  domain: Domain;
  finding: string;
  whyItMatters?: string;
  status?: EntryStatus;
  qualityScore?: number;
  sourceName?: string;
  patternNames?: string[];
};

const entries: SeedEntry[] = [
  {
    title: "Sycophantic AI Decreases Prosocial Intentions and Promotes Dependence",
    url: "https://arxiv.org/abs/2510.01395",
    authors: "Myra Cheng, Cinoo Lee, Pranav Khadpe, Sunny Yu, et al.",
    org: "Stanford",
    publication: "Science",
    publishedAt: "2026-01-01",
    domain: Domain.TRUST_BEHAVIOR,
    finding:
      "Chatbots tuned to be more agreeable measurably reduce users' willingness to repair social conflict and increase reliance on the AI over other people.",
    whyItMatters:
      "A hard, peer-reviewed cost of sycophancy that complements the DeepMind manipulation research already tracked here.",
    status: EntryStatus.APPROVED,
    qualityScore: 5,
    sourceName: "arXiv",
    patternNames: [],
  },
  {
    title: "Preference for Explainable AI",
    url: "https://www.nber.org/papers/w35240",
    authors: "Alex Chan",
    org: "Harvard",
    publication: "NBER Working Paper w35240",
    publishedAt: "2026-01-01",
    domain: Domain.TRUST_BEHAVIOR,
    finding:
      "People systematically undervalue AI explanations even when those explanations demonstrably improve their decision accuracy.",
    whyItMatters:
      "A bias in how humans actually use the \"explainability\" feature vendors keep building.",
    status: EntryStatus.APPROVED,
    qualityScore: 4,
    sourceName: "NBER Working Papers",
    patternNames: [],
  },
  {
    title: "AI, Human Cognition and Knowledge Collapse",
    url: "https://www.nber.org/papers/w34910",
    authors: "Daron Acemoglu, Fabian Kong, Asuman Ozdaglar",
    org: "NBER",
    publication: "NBER Working Paper w34910",
    publishedAt: "2026-01-01",
    domain: Domain.COGNITION_LABOR,
    finding:
      "A formal model of individual learning incentives that produces knowledge collapse -- the same mechanism as the retraining-loop \"How AI Aggregation Affects Knowledge\" paper, via a different route.",
    whyItMatters:
      "Same author cluster and \"knowledge collapse\" mechanism as an existing entry, but a distinct formal model -- track as a companion citation.",
    status: EntryStatus.APPROVED,
    qualityScore: 3,
    sourceName: "NBER Working Papers",
    patternNames: ["Knowledge Collapse"],
  },
  {
    title: "AI Promised to Free Up Workers' Time -- It Did the Opposite",
    url: "https://newsroom.haas.berkeley.edu/ai-promised-to-free-up-workers-time-uc-berkeley-haas-researchers-found-the-opposite/",
    authors: "Xingqi Maggie Ye, Aruna Ranganathan",
    org: "UC Berkeley Haas",
    publication: "Harvard Business Review",
    publishedAt: "2026-02-01",
    domain: Domain.COGNITION_LABOR,
    finding:
      "An 8-month ethnographic study found generative AI didn't free up employees' time -- it expanded what they felt capable of and willing to take on, so they worked faster, took on more scope, and extended hours, unasked.",
    whyItMatters:
      "Strong complement to the Fluency Divide / Training Mirage patterns. Source is Berkeley Haas/HBR, outside the primary academic allowlist -- flagged for a human credibility call rather than auto-approved.",
    status: EntryStatus.PENDING,
    qualityScore: 4,
    sourceName: "Harvard Business Review",
    patternNames: ["Fluency Divide", "Training Mirage"],
  },
  {
    title: "Anthropic Economic Index: Cadences",
    url: "https://www.anthropic.com/research/economic-index-june-2026-report",
    org: "Anthropic",
    publication: "Anthropic Economic Index",
    publishedAt: "2026-06-01",
    domain: Domain.LABOR_ECONOMY,
    finding:
      "Tracks when and how people use Claude against work rhythms; an 81,000-person survey finds heavy AI delegators report higher satisfaction and optimism about pay/security, while early-career workers are more anxious.",
    whyItMatters:
      "Newer than the March 2026 Learning Curves report already on file -- consider replacing or pairing.",
    status: EntryStatus.APPROVED,
    qualityScore: 4,
    sourceName: "Anthropic Research",
    patternNames: [],
  },
  {
    title: "Wharton Human-AI Research / GBK 2026 Annual Adoption Survey",
    url: "https://ai.wharton.upenn.edu/",
    org: "Wharton / GBK Collective",
    publication: "Wharton Human-AI Research",
    publishedAt: "2026-01-01",
    domain: Domain.LABOR_ECONOMY,
    finding:
      "82% of enterprise leaders now use gen AI weekly; firms report fearing workforce skill atrophy even as ROI rises, and many expect to hire more junior staff, not fewer.",
    whyItMatters:
      "A counter-data-point to the Anthropic \"Credential Snap\" entry-level-hiring finding -- good tension to highlight side by side. No stable article URL was given for the specific survey; flagged for review to attach the right permalink.",
    status: EntryStatus.PENDING,
    qualityScore: 3,
    sourceName: "Wharton Human-AI Research",
    patternNames: ["Credential Snap"],
  },
  {
    title: "AI Adoption Is a Challenge. Here's a Solution.",
    url: "https://knowledge.wharton.upenn.edu/article/ai-adoption-is-a-challenge-heres-a-solution/",
    org: "Wharton",
    publication: "Knowledge at Wharton",
    publishedAt: "2026-04-01",
    domain: Domain.LABOR_ECONOMY,
    finding:
      "Adoption resistance is psychological, not just a training gap -- framed around competence/autonomy/relatedness (an \"AWARE\" framework).",
    whyItMatters: "Good complement to the Readiness Gap pattern.",
    status: EntryStatus.APPROVED,
    qualityScore: 3,
    sourceName: "Wharton Human-AI Research",
    patternNames: ["Readiness Gap"],
  },
  {
    title: "AI Control Roadmap",
    url: "https://arxiv.org/html/2607.13087v1",
    org: "Google DeepMind",
    publication: "Google DeepMind",
    publishedAt: "2026-06-01",
    domain: Domain.SECURITY_RISK,
    finding:
      "DeepMind's own framework for containing agents it assumes could be misaligned, escalating safeguards from basic action-logging to monitoring/alerts as capability rises.",
    whyItMatters:
      "Notable as a frontier lab admitting agent oversight is not yet solved -- fits the pattern of a vendor conceding the disruption/risk it's causing, alongside the OpenAI Industrial Policy entry.",
    status: EntryStatus.APPROVED,
    qualityScore: 5,
    sourceName: "Google DeepMind Blog",
    patternNames: ["Frontier Lab Concedes Risk"],
  },
];

async function main() {
  const sourceIdByName = new Map<string, string>();
  for (const s of sources) {
    const rec = await prisma.source.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    });
    sourceIdByName.set(s.name, rec.id);
  }

  const patternIdByName = new Map<string, string>();
  for (const p of patterns) {
    const rec = await prisma.pattern.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
    patternIdByName.set(p.name, rec.id);
  }

  for (const e of entries) {
    const { sourceName, patternNames, publishedAt, ...rest } = e;
    await prisma.entry.upsert({
      where: { url: e.url },
      update: {
        ...rest,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        addedBy: "seed",
        sourceId: sourceName ? sourceIdByName.get(sourceName) : undefined,
        patterns: {
          set: (patternNames ?? []).map((name) => ({ id: patternIdByName.get(name)! })),
        },
      },
      create: {
        ...rest,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        addedBy: "seed",
        sourceId: sourceName ? sourceIdByName.get(sourceName) : undefined,
        patterns: {
          connect: (patternNames ?? []).map((name) => ({ id: patternIdByName.get(name)! })),
        },
      },
    });
  }

  console.log(`Seeded ${sources.length} sources, ${patterns.length} patterns, ${entries.length} entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

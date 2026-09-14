import type { Candidate } from "./types";

// arXiv's Atom API is free, unauthenticated, and stable -- no API key needed.
// Docs: https://info.arxiv.org/help/api/user-manual.html
const ARXIV_API = "https://export.arxiv.org/api/query";

type ArxivOptions = {
  query: string; // e.g. 'cat:cs.AI+AND+abs:sycophancy'
  maxResults?: number;
};

export async function fetchArxiv({ query, maxResults = 20 }: ArxivOptions): Promise<Candidate[]> {
  const url = `${ARXIV_API}?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;

  const res = await fetch(url, { headers: { "User-Agent": "intepreter/0.1 (internal research tool)" } });
  if (!res.ok) {
    throw new Error(`arXiv query failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  return parseArxivFeed(xml);
}

// Minimal hand-rolled Atom parser -- arXiv's feed is regular enough that we
// don't need a full XML library just for this.
export function parseArxivFeed(xml: string): Candidate[] {
  const entries: Candidate[] = [];
  const entryBlocks = xml.split("<entry>").slice(1);

  for (const block of entryBlocks) {
    const title = extractTag(block, "title");
    const id = extractTag(block, "id");
    const summary = extractTag(block, "summary");
    const published = extractTag(block, "published");
    const authors = [...block.matchAll(/<name>([^<]*)<\/name>/g)].map((m) => m[1].trim());

    if (!title || !id) continue;

    entries.push({
      title: cleanText(title),
      url: id.trim().replace(/^http:/, "https:"),
      authors: authors.length ? authors.join(", ") : undefined,
      org: "arXiv",
      publication: "arXiv",
      publishedAt: published ? new Date(published.trim()) : undefined,
      rawExcerpt: summary ? cleanText(summary) : undefined,
    });
  }

  return entries;
}

function extractTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match?.[1];
}

function cleanText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

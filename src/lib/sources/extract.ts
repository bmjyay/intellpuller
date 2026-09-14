import type { Candidate } from "./types";

// Fetches an arbitrary URL (a Wharton article, an HBR piece, a lab blog
// post with no feed) and reduces it to plain text so curate.ts can hand it
// to the LLM for metadata extraction + summarization. This is the fallback
// path for sources that don't have a structured feed.
export async function fetchUrlAsText(url: string): Promise<Pick<Candidate, "url" | "rawExcerpt">> {
  const res = await fetch(url, { headers: { "User-Agent": "intelpreter/0.1 (internal research tool)" } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  const text = htmlToText(html);
  // Cap what we send to the LLM -- the opening chunk of an article carries
  // the title/byline/lede, which is what curation actually needs.
  return { url, rawExcerpt: text.slice(0, 8000) };
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

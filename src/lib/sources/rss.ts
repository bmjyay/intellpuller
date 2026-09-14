import Parser from "rss-parser";
import type { Candidate } from "./types";

const parser = new Parser({
  headers: { "User-Agent": "intelpreter/0.1 (internal research tool)" },
});

// Generic RSS/Atom fetcher, used for NBER's "new papers" feed as well as
// lab blogs (Anthropic, DeepMind, OpenAI, ...) that publish one.
export async function fetchRss(feedUrl: string, org?: string): Promise<Candidate[]> {
  const feed = await parser.parseURL(feedUrl);

  return (feed.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: item.title!.trim(),
      url: item.link!.trim(),
      authors: item.creator ?? item.author ?? undefined,
      org,
      publication: feed.title,
      publishedAt: item.isoDate ? new Date(item.isoDate) : undefined,
      rawExcerpt: (item.contentSnippet ?? item.content ?? "").slice(0, 2000) || undefined,
    }));
}

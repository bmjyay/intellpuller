// Estimates time to read the curated brief itself (finding + why-it-matters),
// not the underlying paper -- we only ever show/store a short excerpt of the
// source, so a source-length estimate would be a guess dressed up as a fact.
const WORDS_PER_MINUTE = 200;

export function estimateReadTime(...parts: (string | null | undefined)[]): number {
  const words = parts
    .filter(Boolean)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

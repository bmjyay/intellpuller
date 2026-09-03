// A raw item pulled from a source, before curation. Curation turns this
// into (or discards it in favor of) an Entry.
export type Candidate = {
  title: string;
  url: string;
  authors?: string;
  org?: string;
  publication?: string;
  publishedAt?: Date;
  rawExcerpt?: string; // abstract / summary / snippet as fetched
};

import { Entry, Pattern, Source } from "@prisma/client";

export type EntryWithRelations = Entry & {
  patterns: Pattern[];
  source: Source | null;
};

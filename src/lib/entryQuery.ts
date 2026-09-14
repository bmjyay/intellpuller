import { Prisma } from "@prisma/client";
import { Domain, EntryStatus } from "./enums";
import { ALL_DOMAINS } from "./domains";

export type EntryFilters = {
  status?: string | string[]; // "ALL" (or omit) for no status filter
  domain?: string;
  pattern?: string;
  q?: string;
  liked?: boolean;
  used?: "hide" | "only";
};

// Shared filter-building logic so the dashboard, /liked, /archive pages and
// the /api/entries route all interpret the same query params the same way.
export function buildEntryWhere(filters: EntryFilters): Prisma.EntryWhereInput {
  const where: Prisma.EntryWhereInput = {};

  if (Array.isArray(filters.status)) {
    where.status = { in: filters.status as EntryStatus[] };
  } else if (filters.status && filters.status !== "ALL") {
    where.status = filters.status as EntryStatus;
  }
  if (filters.domain && ALL_DOMAINS.includes(filters.domain as Domain)) {
    where.domain = filters.domain as Domain;
  }
  if (filters.pattern) {
    where.patterns = { some: { name: filters.pattern } };
  }
  if (filters.liked) {
    where.liked = true;
  }
  if (filters.used === "hide") {
    where.usedAt = null;
  } else if (filters.used === "only") {
    where.usedAt = { not: null };
  }
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { finding: { contains: filters.q } },
      { whyItMatters: { contains: filters.q } },
      { authors: { contains: filters.q } },
      { org: { contains: filters.q } },
    ];
  }

  return where;
}

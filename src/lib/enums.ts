// SQLite has no native enum type, so Entry.domain/status and Source.kind
// are plain string columns in prisma/schema.prisma. These are the allowed
// values, validated on every write path (curate.ts, actions.ts, the API
// routes) rather than by the database.

export const Domain = {
  TRUST_BEHAVIOR: "TRUST_BEHAVIOR",
  COGNITION_LABOR: "COGNITION_LABOR",
  LABOR_ECONOMY: "LABOR_ECONOMY",
  SECURITY_RISK: "SECURITY_RISK",
  OTHER: "OTHER",
} as const;
export type Domain = (typeof Domain)[keyof typeof Domain];

export const EntryStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
} as const;
export type EntryStatus = (typeof EntryStatus)[keyof typeof EntryStatus];

export const SourceKind = {
  ARXIV: "ARXIV",
  RSS: "RSS",
  MANUAL: "MANUAL",
} as const;
export type SourceKind = (typeof SourceKind)[keyof typeof SourceKind];

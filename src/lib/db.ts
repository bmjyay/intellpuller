import { PrismaClient } from "@prisma/client";

// If there's no .env (forgotten, or a fresh/ephemeral environment that
// doesn't carry dotfiles), fall back to the same default .env.example
// ships, rather than hard-crashing every page with a Prisma init error.
// This does NOT fix a missing/un-migrated database file -- run
// `npm run db:push` (and `npm run db:seed`) if this is a first run.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

// Standard Next.js dev-mode singleton so hot-reload doesn't exhaust
// SQLite connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

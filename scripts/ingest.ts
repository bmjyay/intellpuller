import "dotenv/config";
import { runIngest } from "../src/lib/ingest";
import { prisma } from "../src/lib/db";

// Standalone entry point for `npm run ingest` -- the same logic the
// /api/ingest route calls, usable from a cron job or CI schedule without
// needing the Next.js server running. See .github/workflows/ingest.yml.
async function main() {
  console.log("Running ingestion...");
  const report = await runIngest();
  console.log(JSON.stringify(report, null, 2));

  if (report.failed.length > 0) {
    console.error(`${report.failed.length} source(s) failed -- see above.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

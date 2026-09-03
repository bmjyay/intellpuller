"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Domain, EntryStatus } from "./enums";
import { prisma } from "./db";
import { curateCandidate } from "./curate";
import { fetchUrlAsText } from "./sources/extract";
import { runIngest } from "./ingest";
import { ALL_DOMAINS } from "./domains";

function revalidateEntryPages(id?: string) {
  revalidatePath("/");
  revalidatePath("/review");
  if (id) revalidatePath(`/entries/${id}`);
}

export async function setEntryStatus(id: string, status: EntryStatus, reviewedBy?: string) {
  await prisma.entry.update({
    where: { id },
    data: { status, reviewedAt: new Date(), reviewedBy: reviewedBy || "team" },
  });
  revalidateEntryPages(id);
}

export async function approveEntryAction(formData: FormData) {
  await setEntryStatus(String(formData.get("id")), EntryStatus.APPROVED);
}

export async function rejectEntryAction(formData: FormData) {
  await setEntryStatus(String(formData.get("id")), EntryStatus.REJECTED);
}

export async function archiveEntryAction(formData: FormData) {
  await setEntryStatus(String(formData.get("id")), EntryStatus.ARCHIVED);
}

export async function deleteEntryAction(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.entry.delete({ where: { id } });
  revalidateEntryPages();
  redirect("/review");
}

// Inline edit of an entry's editorial fields from its detail page.
export async function updateEntryAction(formData: FormData) {
  const id = String(formData.get("id"));
  const domain = String(formData.get("domain"));

  await prisma.entry.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? ""),
      finding: String(formData.get("finding") ?? ""),
      whyItMatters: (formData.get("whyItMatters") as string) || null,
      authors: (formData.get("authors") as string) || null,
      org: (formData.get("org") as string) || null,
      publication: (formData.get("publication") as string) || null,
      domain: (ALL_DOMAINS.includes(domain as Domain) ? domain : "OTHER") as Domain,
      qualityScore: formData.get("qualityScore") ? Number(formData.get("qualityScore")) : null,
    },
  });
  revalidateEntryPages(id);
  redirect(`/entries/${id}`);
}

// Add-by-URL flow: fetch the page, curate it with the LLM, store as PENDING
// so a human reviews the draft before it's live on the dashboard.
export async function addEntryByUrlAction(formData: FormData) {
  const url = String(formData.get("url") ?? "").trim();
  if (!url) throw new Error("A URL is required.");

  const existing = await prisma.entry.findUnique({ where: { url } });
  if (existing) redirect(`/entries/${existing.id}`);

  const fetched = await fetchUrlAsText(url);
  const patternNames = (await prisma.pattern.findMany({ select: { name: true } })).map((p) => p.name);
  const curation = await curateCandidate({ title: url, url, rawExcerpt: fetched.rawExcerpt }, patternNames);

  const patternRecords = await Promise.all(
    curation.patternNames.map((name) => prisma.pattern.upsert({ where: { name }, update: {}, create: { name } }))
  );

  const entry = await prisma.entry.create({
    data: {
      title: curation.title,
      url,
      authors: curation.authors,
      org: curation.org,
      publication: curation.publication,
      domain: curation.domain,
      finding: curation.finding,
      whyItMatters: curation.whyItMatters,
      status: EntryStatus.PENDING,
      qualityScore: curation.qualityScore,
      credibleFlag: curation.credibleFlag,
      rawExcerpt: fetched.rawExcerpt,
      addedBy: "manual",
      patterns: { connect: patternRecords.map((p) => ({ id: p.id })) },
    },
  });

  revalidateEntryPages(entry.id);
  redirect(`/entries/${entry.id}`);
}

export async function triggerIngestAction() {
  await runIngest();
  revalidateEntryPages();
  revalidatePath("/sources");
}

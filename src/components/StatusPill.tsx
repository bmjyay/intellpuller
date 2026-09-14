const STYLES: Record<string, string> = {
  PENDING: "bg-brand-cta/10 text-brand-cta border-brand-cta/30",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-brand-muted/10 text-brand-muted border-brand-muted/30",
  ARCHIVED: "bg-brand-muted/10 text-brand-muted border-brand-muted/30",
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status] ?? STYLES.PENDING}`}>
      {status}
    </span>
  );
}

export default function ScoreDots({ score }: { score?: number | null }) {
  if (!score) return null;
  return (
    <span className="inline-flex items-center gap-0.5" title={`Quality score: ${score}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < score ? "bg-ink" : "bg-slate-200"}`}
        />
      ))}
    </span>
  );
}

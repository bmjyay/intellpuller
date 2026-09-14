import Link from "next/link";

export default function PatternPill({ name }: { name: string }) {
  return (
    <Link
      href={`/?pattern=${encodeURIComponent(name)}`}
      className="inline-flex items-center rounded-full bg-brand-ink px-2.5 py-0.5 text-xs font-medium text-white transition hover:bg-brand-primary"
    >
      {name}
    </Link>
  );
}

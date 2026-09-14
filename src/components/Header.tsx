import Link from "next/link";
import { prisma } from "@/lib/db";
import { EntryStatus } from "@/lib/enums";

export default async function Header() {
  const pendingCount = await prisma.entry.count({ where: { status: EntryStatus.PENDING } });

  return (
    <header className="border-b border-brand-muted/20 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-brand-ink">Intepreter</span>
          <span className="text-xs text-brand-muted">AI research &amp; insight feed</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/review">
            Review queue{pendingCount > 0 ? ` (${pendingCount})` : ""}
          </NavLink>
          <NavLink href="/liked">Liked</NavLink>
          <NavLink href="/archive">Archive</NavLink>
          <NavLink href="/add">Add entry</NavLink>
          <NavLink href="/assistant">Assistant</NavLink>
          <NavLink href="/sources">Sources</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-brand-ink/70 transition hover:bg-brand-periwinkle/40 hover:text-brand-ink"
    >
      {children}
    </Link>
  );
}

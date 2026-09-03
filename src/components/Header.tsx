import Link from "next/link";
import { prisma } from "@/lib/db";
import { EntryStatus } from "@/lib/enums";

export default async function Header() {
  const pendingCount = await prisma.entry.count({ where: { status: EntryStatus.PENDING } });

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-ink">intellpuller</span>
          <span className="text-xs text-slate-400">AI research &amp; insight feed</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/review">
            Review queue{pendingCount > 0 ? ` (${pendingCount})` : ""}
          </NavLink>
          <NavLink href="/add">Add entry</NavLink>
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
      className="rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-ink"
    >
      {children}
    </Link>
  );
}

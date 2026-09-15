import Link from "next/link";
import { prisma } from "@/lib/db";
import { EntryStatus } from "@/lib/enums";
import NavDropdown from "./NavDropdown";

export default async function Header() {
  const pendingCount = await prisma.entry.count({ where: { status: EntryStatus.PENDING } });

  return (
    <header className="border-b border-brand-muted/20 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="text-xl font-bold tracking-tight text-brand-ink">Intelpreter</span>
          <span className="text-xs italic text-brand-muted">AI research &amp; insight feed</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-0.5 text-sm">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/review">
            Review queue{pendingCount > 0 ? ` (${pendingCount})` : ""}
          </NavLink>
          <NavDropdown
            label="Library"
            items={[
              { href: "/liked", label: "Liked" },
              { href: "/archive", label: "Archive" },
            ]}
          />
          <NavDropdown
            label="Manage"
            items={[
              { href: "/add", label: "Add entry" },
              { href: "/used", label: "Used" },
              { href: "/sources", label: "Sources" },
            ]}
          />
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

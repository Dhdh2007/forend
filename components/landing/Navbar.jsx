import Link from "next/link";
import { Radio } from "lucide-react";

export default function Navbar({ isLoggedIn }) {
  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal/15 text-signal">
          <Radio size={17} strokeWidth={2.25} />
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
          DM Trigger Bot
        </span>
      </div>

      <nav className="hidden items-center gap-8 text-sm text-ink-muted sm:flex">
        <a href="#how-it-works" className="transition hover:text-ink">
          How it works
        </a>
        <a href={isLoggedIn ? "/dashboard" : "/signup"} className="transition hover:text-ink">
          Get started
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href={isLoggedIn ? "/dashboard" : "/login"}
          className="text-sm text-ink-muted transition hover:text-ink"
        >
          Log in
        </Link>
        <Link
          href={isLoggedIn ? "/dashboard" : "/signup"}
          className="rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:bg-signal-soft"
        >
          Get started free
        </Link>
      </div>
    </header>
  );
}

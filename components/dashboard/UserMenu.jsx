"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronUp, Settings, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

/**
 * UserMenu
 * -----------------------------------------------------------------------
 * Profile + settings + logout, all in one dropdown anchored to the
 * bottom of the sidebar. Pass the `user` object down from a server
 * component (dashboard layout/page) that already called
 * supabase.auth.getUser() — no extra fetch needed here.
 * -----------------------------------------------------------------------
 */
export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  const email = user?.email ?? "you@example.com";
  const initial = email.charAt(0).toUpperCase();

  // close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={menuRef} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-base-border bg-base-surface shadow-card">
          <div className="border-b border-base-border px-4 py-3">
            <p className="truncate text-sm text-ink">{email}</p>
            <p className="text-xs text-ink-faint">Free tier</p>
          </div>

          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted transition hover:bg-base-raised hover:text-ink"
          >
            <User size={15} />
            Profile
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted transition hover:bg-base-raised hover:text-ink"
          >
            <Settings size={15} />
            Settings
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2.5 border-t border-base-border px-4 py-2.5 text-sm text-alert transition hover:bg-alert/10 disabled:opacity-60"
          >
            <LogOut size={15} />
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-base-border bg-base-raised/60 px-3 py-2.5 text-left transition hover:bg-base-raised"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal/15 text-sm font-medium text-signal">
          {initial}
        </div>
        <span className="min-w-0 flex-1 truncate text-sm text-ink">{email}</span>
        <ChevronUp
          size={15}
          className={`shrink-0 text-ink-faint transition-transform ${open ? "" : "rotate-180"}`}
        />
      </button>
    </div>
  );
}

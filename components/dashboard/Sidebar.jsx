"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, LayoutGrid, Megaphone, Activity, Settings, Cpu,Sparkles  } from "lucide-react";
import UserMenu from "@/components/dashboard/UserMenu";

const navItems = [
  { label: "Overview", icon: LayoutGrid, href: "/dashboard" },
  { label: "Campaigns", icon: Megaphone, href: "/dashboard/campaigns" },
  { label: "Activity", icon: Activity, href: "/dashboard/activity" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  { label: "Memory", icon: Cpu , href: "/memory" },
  { label: "Farsight", icon: Sparkles , href: "/ai" },

];

// Pass the logged-in user down from a server component, e.g.
// app/dashboard/layout.js:
//   const { data: { user } } = await supabase.auth.getUser();
//   return <Sidebar user={user} />
export default function Sidebar({ user }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-base-border bg-base-surface/40 px-4 py-6 lg:flex">
      <div className="mb-9 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal/15 text-signal">
          <Radio size={17} strokeWidth={2.25} />
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
          DM Trigger Bot
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-signal/12 text-ink"
                  : "text-ink-muted hover:bg-base-raised hover:text-ink"
              }`}
            >
              <item.icon size={17} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-3 rounded-xl border border-base-border bg-base-raised/60 p-4">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          Free tier
        </p>
        <p className="text-sm text-ink-muted">
          Upgrade for unlimited DMs and priority delivery.
        </p>
      </div>

      <UserMenu user={user} />
    </aside>
  );
}
"use client";

import { Radio } from "lucide-react";
import SignalPulse from "@/components/SignalPulse";

export default function ActivityFeed({ items, isLoading }) {
  return (
    <div className="rounded-2xl border border-base-border bg-base-surface shadow-card">
      <div className="border-b border-base-border px-6 py-5">
        <h3 className="font-display text-base font-semibold text-ink">
          Live activity
        </h3>
        <p className="text-xs text-ink-faint">Your last 10 DMs sent</p>
      </div>

      <div className="divide-y divide-base-border">
        {isLoading && (
          <div className="space-y-3 p-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-base-raised" />
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-signal/12 text-signal">
              <Radio size={19} />
            </div>
            <p className="text-sm text-ink">No activity yet</p>
            <p className="max-w-xs text-xs text-ink-faint">
              Sent DMs will show up here the moment a trigger fires.
            </p>
          </div>
        )}

        {!isLoading &&
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-6 py-3.5">
              <SignalPulse size="sm" color="success" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">
                  <span className="text-ink-muted">@{item.username}</span> triggered{" "}
                  <span className="font-mono text-signal-soft">{item.trigger}</span>
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                {item.time}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import SignalPulse from "@/components/SignalPulse";
import { createClient } from "@/lib/supabaseClient";
const supabase = createClient();
const FALLBACK_GREETINGS = {
  morning: [
    "Good morning. Let's see who commented overnight.",
    "Morning. Your triggers never sleep — let's check the log.",
  ],
  afternoon: ["Good afternoon. Here's what's been happening."],
  evening: ["Good evening. Let's wrap up the day's activity."],
  night: ["Working late? Here's the latest activity."],
};

const REFRESH_INTERVAL_MS = 30 * 1000; // 1 minute

function getTimeBucket(hour) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

export default function Topbar({ onNewCampaign }) {
  const [greeting, setGreeting] = useState("Overview");

  useEffect(() => {
    const bucket = getTimeBucket(new Date().getHours());
    const options = FALLBACK_GREETINGS[bucket];
    setGreeting(options[Math.floor(Math.random() * options.length)]);

    let cancelled = false;

    async function fetchQuote() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mp`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && data?.quote) setGreeting(data.quote);
      } catch {
        // keep whatever greeting is already showing
      }
    }

    fetchQuote(); // first load
    const intervalId = setInterval(fetchQuote, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  // ... rest of your component (onNewCampaign button etc.) stays the same

  return (
    <div className="flex items-center justify-between border-b border-base-border px-6 py-5 lg:px-10">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
          {greeting}
        </h1>
        <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
          <SignalPulse size="sm" color="success" />
          Listening for comments in real time
        </div>
      </div>

      <button
        onClick={onNewCampaign}
        className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-signal-soft"
      >
        <Plus size={16} />
        New trigger
      </button>
    </div>
  );
}
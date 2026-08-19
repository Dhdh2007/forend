"use client";

import { useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend-7z7b.onrender.com";

/**
 * Fires a fire-and-forget GET /health on mount. This does NOT prevent the
 * very first visitor of the day from hitting a cold start — by the time
 * this runs, they're already waiting on THIS page load, which didn't need
 * the backend anyway. What it does do: every visitor's ping keeps Render's
 * free-tier instance from going fully idle, so the NEXT visitor within the
 * next ~15 minutes doesn't hit a cold start either.
 *
 * For a real fix to the very-first-visitor case, pair this with an
 * external cron pinger (cron-job.org / UptimeRobot) hitting /health every
 * 5 minutes — that's what actually stops Render from sleeping at all.
 */
export default function WarmupPing() {
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`, { cache: "no-store" }).catch(() => {
      // Silent on purpose — a failed warmup ping shouldn't show the user
      // anything or affect the page in any way.
    });
  }, []);

  return null;
}
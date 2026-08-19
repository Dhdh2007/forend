# DM Trigger Bot — Frontend

Next.js (App Router) UI for the DM Trigger Bot dashboard, built to pair
with the FastAPI backend.

## Design direction

The whole visual identity is built around one idea: **a trigger firing**.
The product's job is to *listen* for a word and *react* instantly, so the
signature element is a "signal pulse" — concentric rings expanding from a
dot — reused at three scales across the app (the hero, the "live" status
chip, and each row in the activity feed). Everything else (the deep
graphite-navy palette, the mono "readout" typeface for numbers, the
radar/signal iconography) supports that one idea rather than competing
with it.

- **Display type:** Space Grotesk — geometric, technical
- **Body type:** Inter
- **Data/numbers:** JetBrains Mono — gives stats a "live readout" feel
- **Palette:** deep graphite-navy (`#0D1117`) background, violet "signal"
  accent for the product's core action, amber reserved *only* for
  usage/limit warnings, emerald for successful sends

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in your real Supabase project values
npm run dev
```

Visit `http://localhost:3000` for the landing page, `/dashboard` for the
app itself.

## What's real vs. demo data

Everything is now live. Campaigns, the usage gauge, the weekly trend
chart, and the activity feed all come from the FastAPI backend's
`GET /api/campaigns` and `GET /api/analytics` endpoints, authenticated
with your Supabase session's JWT — see `lib/api.js`. There's no
placeholder data left in the dashboard.

## Requires

- The FastAPI backend running, with both `sql/schema.sql` **and**
  `sql/002_analytics.sql` applied to your Supabase project (the second
  migration adds the event log the analytics endpoint reads from).
- `NEXT_PUBLIC_API_BASE_URL` pointed at that backend.
- A Supabase project with email/password (or your preferred provider)
  enabled in Supabase Auth — this UI assumes `supabase.auth.getSession()`
  returns a valid session once a user logs in.

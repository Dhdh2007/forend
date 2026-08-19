"use client";
import { CreateClient } from "@/lib/supabaseClient";
import { useEffect, useRef, useState, useCallback } from "react";
import { animate, stagger, createTimeline } from "animejs";
import {
  Moon,
  Sparkles,
  Flame,
  Sun,
  Snowflake,
  HelpCircle,
  AlertCircle,
  Frown,
  Heart,
  TrendingUp,
  Zap,
  Lightbulb,
  Rocket,
  ShoppingBag,
  Activity,
  BarChart3,
  RefreshCw,
  Quote,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TSUKIKAMI — the moon's reading of your customers.
   Companion piece to the memory box: same palette, same signature
   (a moon that only ever shows you what's actually true), turned
   toward the AI-generated insights report + free-tier usage.

   ASSUMED ENDPOINTS — adjust ENDPOINTS below to match your real
   routes in app/routers/dash.py and app/routers/ab.py, I don't have
   those files so these are best-guess paths based on the router
   names/prefixes I've seen:
     GET  /analytics/{business_id}          -> AnalyticsOut
     GET  /insights/{business_id}/latest    -> InsightsResult | 404
     POST /insights/{business_id}/generate  -> InsightsResult (triggers
                                                generate_insights())
   ───────────────────────────────────────────────────────────── */

const supabase = CreateClient();
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

const ENDPOINTS = {
  analytics: (id) => `${API_BASE}/analytics/${id}`,
  latestInsights: (id) => `${API_BASE}/insights/${id}/latest`,
  generateInsights: (id) => `${API_BASE}/insights/${id}/generate`,
};

async function apiJson(url, options) {
  const res = await fetch(url, options);
  if (res.status === 404) return null;
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    throw new Error(body?.detail || `Server responded ${res.status}`);
  }
  return body;
}

/* Each reading lantern maps one InsightsResult field to an icon + label. */
const READING_CATEGORIES = [
  { key: "common_questions", label: "Common Questions", icon: HelpCircle, field: "common_questions" },
  { key: "objections", label: "Objections", icon: AlertCircle, field: "objections" },
  { key: "why_not_buying", label: "Why They Hesitate", icon: Frown, field: "why_customers_arent_buying" },
  { key: "what_they_want", label: "What They Want", icon: Heart, field: "what_customers_want" },
  { key: "trending", label: "Trending Topics", icon: TrendingUp, field: "trending_topics" },
  { key: "sales_ops", label: "Sales Opportunities", icon: Zap, field: "sales_opportunities" },
  { key: "actions", label: "Recommended Actions", icon: Lightbulb, field: "recommended_actions" },
  { key: "product_ops", label: "Product Opportunities", icon: Rocket, field: "product_opportunities" },
];

const INTENT_STYLE = {
  hot: { icon: Flame, color: "#e08a5c", label: "Hot" },
  warm: { icon: Sun, color: "#c9a876", label: "Warm" },
  cold: { icon: Snowflake, color: "#a5b4fc", label: "Cold" },
};

function EmptyNote({ text = "The moon has nothing to show here yet." }) {
  return <p className="text-sm italic text-[#6b7099]">{text}</p>;
}

/* ─── USAGE RING — "the moon's light spent" this billing cycle ─── */
function MoonUsageRing({ used, limit }) {
  const pct = limit > 0 ? Math.min(used / limit, 1) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct;
  const nearLimit = pct >= 0.85;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(165,180,252,0.12)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={nearLimit ? "#e08a5c" : "url(#moonRingGradient)"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 900ms ease" }}
        />
        <defs>
          <linearGradient id="moonRingGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f2ede0" />
            <stop offset="100%" stopColor="#c9a876" />
          </linearGradient>
        </defs>
        <text x="70" y="66" textAnchor="middle" fill="#f2ede0" style={{ fontSize: 24, fontFamily: "'Shippori Mincho', serif" }}>
          {used}
        </text>
        <text x="70" y="86" textAnchor="middle" fill="#6b7099" style={{ fontSize: 10 }}>
          of {limit} this cycle
        </text>
      </svg>
      {nearLimit && (
        <p className="mt-1 text-xs text-[#e08a5c]">Close to your free-tier limit</p>
      )}
    </div>
  );
}

/* ─── DAILY TREND — simple bar rhythm, no chart library needed ─── */
function DailyTrendBars({ points }) {
  if (!points?.length) return <EmptyNote text="No send activity yet." />;
  const max = Math.max(...points.map((p) => p.count), 1);
  return (
    <div className="flex h-24 items-end gap-1.5">
      {points.map((p) => (
        <div key={p.date} className="group relative flex-1" title={`${p.date}: ${p.count}`}>
          <div
            className="w-full rounded-t-sm bg-gradient-to-t from-[#c9a876]/40 to-[#f2ede0]/70 transition-all group-hover:from-[#c9a876]/60 group-hover:to-[#f2ede0]"
            style={{ height: `${Math.max((p.count / max) * 100, 4)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function RecentActivityList({ items }) {
  if (!items?.length) return <EmptyNote text="No DMs sent yet." />;
  return (
    <ul className="space-y-2.5">
      {items.map((a) => (
        <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[#f2ede0]">
            <span className="text-[#c9a876]">{a.trigger_word}</span> → @{a.commenter_username}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-[#6b7099]">
            {new Date(a.sent_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </span>
        </li>
      ))}
    </ul>
  );
}

function IntentList({ intents }) {
  if (!intents?.length) return <EmptyNote text="No customer conversations read yet." />;
  const order = { hot: 0, warm: 1, cold: 2 };
  const sorted = [...intents].sort((a, b) => (order[a.intent] ?? 3) - (order[b.intent] ?? 3) || b.lead_score - a.lead_score);
  return (
    <ul className="space-y-3">
      {sorted.map((c) => {
        const style = INTENT_STYLE[c.intent] || INTENT_STYLE.cold;
        const Icon = style.icon;
        return (
          <li key={c.customer_id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm text-[#f2ede0]">
                <Icon size={13} style={{ color: style.color }} />
                {c.customer_id}
              </span>
              <span className="font-mono text-[10px]" style={{ color: style.color }}>
                {style.label} · {c.lead_score}
              </span>
            </div>
            {c.reasoning && <p className="mt-1.5 text-xs text-[#8a8ec2]">{c.reasoning}</p>}
          </li>
        );
      })}
    </ul>
  );
}

function ProductMentionsList({ items }) {
  if (!items?.length) return <EmptyNote text="No products mentioned in conversations yet." />;
  const max = Math.max(...items.map((i) => i.mention_count), 1);
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.product_name} className="text-sm">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-[#f2ede0]">{i.product_name}</span>
            <span className="font-mono text-[#8a8ec2]">{i.mention_count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.05]">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-[#a5b4fc]/50 to-[#a5b4fc]"
              style={{ width: `${(i.mention_count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function MoonlitInsights() {
  const moonRef = useRef(null);
  const moonGlowRef = useRef(null);

  const [businessId, setBusinessId] = useState(null);
  const [authError, setAuthError] = useState(null);

  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [openReading, setOpenReading] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (!cancelled) setAuthError(userError?.message || "No signed-in user.");
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      if (profileError) {
        if (!cancelled) setAuthError(profileError.message || "Could not load profile.");
        return;
      }
      if (!cancelled) setBusinessId(profile.id);
    }
    loadProfile();
    return () => { cancelled = true; };
  }, []);

  const loadAll = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, insightsData] = await Promise.all([
        apiJson(ENDPOINTS.analytics(id)),
        apiJson(ENDPOINTS.latestInsights(id)),
      ]);
      setAnalytics(analyticsData);
      setInsights(insightsData);
    } catch (e) {
      setError(e.message || "Could not reach the insights service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!businessId) return;
    loadAll(businessId);
  }, [businessId, loadAll]);

  useEffect(() => {
    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(".tki-eyebrow", { opacity: [0, 1], translateY: [10, 0], duration: 600 })
      .add(".tki-title", { opacity: [0, 1], translateY: [24, 0], duration: 800 }, "-=350")
      .add(".tki-moon-wrap", { opacity: [0, 1], scale: [0.6, 1], duration: 1000, ease: "outElastic(1, .6)" }, "-=500")
      .add(".tki-card", { opacity: [0, 1], translateY: [24, 0], duration: 700, delay: stagger(80) }, "-=500");

    const breathe = animate(".tki-moon-glow", {
      opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1], duration: 4200, loop: true, ease: "inOutSine",
    });
    return () => breathe?.pause?.();
  }, []);

  useEffect(() => {
    if (!insights) return;
    animate(".tki-reading", {
      opacity: [0, 1], translateY: [20, 0], duration: 700, delay: stagger(70), ease: "outExpo",
    });
  }, [insights === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegenerate = async () => {
    if (!businessId || regenerating) return;
    setRegenerating(true);
    const glowEl = moonGlowRef.current;
    let pulse;
    if (glowEl) {
      pulse = animate(glowEl, {
        opacity: [0.5, 1, 0.5], scale: [1, 1.4, 1], duration: 1200, loop: true, ease: "inOutSine",
      });
    }
    try {
      const result = await apiJson(ENDPOINTS.generateInsights(businessId), { method: "POST" });
      setInsights(result);
      const analyticsData = await apiJson(ENDPOINTS.analytics(businessId));
      setAnalytics(analyticsData);
    } catch (e) {
      setError(e.message || "The moon couldn't complete a new reading.");
    } finally {
      pulse?.pause?.();
      setRegenerating(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-6 py-14 text-[#f2ede0] lg:px-10"
      style={{ background: "radial-gradient(120% 90% at 50% -10%, #171b3d 0%, #0b0d24 45%, #05050f 100%)" }}
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        {/* ═══════════ HERO ═══════════ */}
        <section className="flex flex-col items-center pb-12 pt-4 text-center">
          <p className="tki-eyebrow font-mono text-[11px] uppercase tracking-[0.3em] text-[#a5b4fc] opacity-0">
            Tsukikami · what the moon has seen
          </p>
          <h1
            className="tki-title mt-5 text-4xl font-medium tracking-tight opacity-0 sm:text-5xl"
            style={{ fontFamily: "'Shippori Mincho', serif" }}
          >
            A reading of your customers
          </h1>

          <div className="tki-moon-wrap relative mt-10 flex h-28 w-28 items-center justify-center opacity-0">
            <div ref={moonGlowRef} className="tki-moon-glow absolute h-24 w-24 rounded-full bg-[#f2ede0]/40 blur-3xl" />
            <div
              ref={moonRef}
              className="relative flex h-20 w-20 items-center justify-center rounded-full shadow-[0_0_50px_8px_rgba(242,237,224,0.3)]"
              style={{ background: "radial-gradient(circle at 35% 30%, #fffaf0, #f2ede0 55%, #cbc4dd 100%)" }}
            >
              <Moon size={22} className="text-[#3a3560]/50" strokeWidth={1.4} />
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={!businessId || regenerating}
            className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#c9a876] to-[#a5824a] px-5 py-2.5 text-sm font-semibold text-[#1a1730] shadow-[0_0_24px_-6px_rgba(201,168,118,0.6)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
            {regenerating ? "Reading the tides…" : "Take a new reading"}
          </button>
        </section>

        {authError && <p className="mb-4 text-center text-sm text-rose-300/80">{authError} — please sign in.</p>}
        {error && <p className="mb-4 text-center text-sm text-rose-300/80">{error} — expects the backend at {API_BASE}.</p>}
        {!businessId && !authError && <p className="text-center text-sm text-[#6b7099]">Checking who's signed in…</p>}
        {businessId && loading && <p className="text-center text-sm text-[#6b7099]">Reading the moon box…</p>}

        {/* ═══════════ USAGE / COST ═══════════ */}
        {analytics && (
          <section className="tki-card mb-10 grid grid-cols-1 gap-4 opacity-0 md:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8ec2]">
                <Moon size={13} /> DMs this cycle
              </div>
              <MoonUsageRing used={analytics.dms_sent_count} limit={analytics.free_tier_limit} />
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl md:col-span-1">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8ec2]">
                <BarChart3 size={13} /> Daily sends
              </div>
              <DailyTrendBars points={analytics.daily_trend} />
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl md:col-span-1">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8ec2]">
                <Activity size={13} /> Recent activity
              </div>
              <div className="max-h-32 overflow-y-auto pr-1">
                <RecentActivityList items={analytics.recent_activity} />
              </div>
            </div>
          </section>
        )}

        {/* ═══════════ THE READING ═══════════ */}
        {insights ? (
          <>
            <section className="tki-card mb-8 rounded-2xl border border-[#c9a876]/20 bg-[#c9a876]/[0.04] p-6 opacity-0">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a876]">
                <Quote size={13} /> Summary
              </div>
              <p className="text-sm leading-relaxed text-[#f2ede0]">{insights.summary}</p>
              <p className="mt-3 text-sm text-[#a5b4fc]/80">{insights.sentiment_overview}</p>
              <p className="mt-4 text-[10px] text-[#6b7099]">
                Read with {insights.model_used} · {new Date(insights.generated_at).toLocaleString()}
              </p>
            </section>

            <section className="tki-card mb-8 grid grid-cols-1 gap-4 opacity-0 md:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8ec2]">
                  <Flame size={13} /> Customer intent
                </div>
                <IntentList intents={insights.customer_intents} />
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8ec2]">
                  <ShoppingBag size={13} /> Product mentions
                </div>
                <ProductMentionsList items={insights.computed_product_mentions} />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {READING_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const items = insights[cat.field] || [];
                const isOpen = openReading === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setOpenReading(isOpen ? null : cat.key)}
                    aria-expanded={isOpen}
                    className={`tki-reading relative overflow-hidden rounded-2xl border p-5 text-left opacity-0 backdrop-blur-xl transition-colors ${
                      isOpen ? "border-[#c9a876]/40 bg-[#c9a876]/[0.06]" : "border-white/[0.07] bg-white/[0.025] hover:border-[#a5b4fc]/25"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a5b4fc]/[0.12] text-[#c3c6f5]">
                        <Icon size={16} />
                      </div>
                      <span className="rounded-full bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-[#8a8ec2]">
                        {items.length}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#f2ede0]">{cat.label}</p>
                    <p className="mt-1 text-xs text-[#6b7099]">
                      {items.length === 0 ? "Nothing seen" : isOpen ? "Tap to close" : "Tap to open"}
                    </p>
                    {isOpen && (
                      <div className="mt-4 border-t border-white/[0.07] pt-4">
                        {items.length ? (
                          <ul className="space-y-1.5 text-sm text-[#f2ede0]/90">
                            {items.map((i, idx) => <li key={idx}>{i}</li>)}
                          </ul>
                        ) : (
                          <EmptyNote />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </section>
          </>
        ) : (
          !loading && businessId && (
            <div className="rounded-2xl border border-dashed border-white/[0.1] p-10 text-center">
              <Sparkles size={20} className="mx-auto mb-3 text-[#c9a876]" />
              <p className="text-sm text-[#c7c9e8]">
                The moon hasn't read your customers yet.
              </p>
              <p className="mt-1 text-xs text-[#6b7099]">
                Take a reading above once you've had some DM conversations.
              </p>
            </div>
          )
        )}
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Inter:wght@400;500;600&display=swap");
        @media (prefers-reduced-motion: reduce) {
          .tki-eyebrow, .tki-title, .tki-moon-wrap, .tki-card, .tki-reading {
            opacity: 1 !important; transform: none !important;
          }
          .tki-moon-glow { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
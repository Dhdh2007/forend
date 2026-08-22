/* app/(dashboard)/ai-insights/page.jsx
 *
 * "Moonlit" AI Insights — redesign of the AI insights dashboard.
 * Theme: night-sky / moonlit fantasy — indigo-black sky, a glowing moon
 * core standing in for the old "brain" orb, drifting star particles
 * instead of a generic node network, gold accents instead of purple.
 *
 * FIX (this version): the fetch URLs now match the backend's real
 * route order — {business_id} comes right after the resource name,
 * then the action/sub-resource comes after that:
 *
 *   GET  /insights/{business_id}/dashboard   (was: /insights/{id})
 *   GET  /insights/{business_id}/leads       (was: /insights/leads/{id})
 *   POST /insights/{business_id}/analyze     (was: /insights/analyze/{id})
 *   POST /insights/{business_id}/ask         (was: /insights/ask/{id})
 *
 * Required frontend env:
 *   NEXT_PUBLIC_API_BASE=http://localhost:8000/api
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 *
 * business_id is NOT hardcoded — it's the id of whoever is currently
 * logged in (backend's verify_owner checks the JWT's `sub` against the
 * business_id in the URL, so they have to be the same value). Every
 * request also needs `Authorization: Bearer <access token>` from the
 * live Supabase session.
 *
 * Backend: see backend/app/routers/insights.py and
 * backend/supabase_schema.sql for the routes/tables this page expects.
 * Do NOT put Supabase service-role keys or Google/NVIDIA API keys in
 * this file — those live only in the FastAPI backend's env.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger, createTimeline } from "animejs";
import {
  Moon,
  Sparkles,
  Send,
  Check,
  MessageCircle,
  Users,
  UserCheck,
  Star,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { createClient } from "@/lib/supabaseClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://instabackend-m7wv.onrender.com/api";
const supabase = createClient();
/* ============================================================
   HELPERS
   ============================================================ */

function splitWords(text) {
  return text.split(" ").map((word, i) => (
    <span
      key={i}
      className="moon-title-word inline-block opacity-0"
      style={{ marginRight: "0.28em", transformStyle: "preserve-3d" }}
    >
      {word}
    </span>
  ));
}

function GlassTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-[#e9d9b8]/[0.12] bg-[#0a0a18]/95 px-3.5 py-2.5 text-xs shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <p className="mb-1.5 font-mono uppercase tracking-wider text-slate-500">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-slate-200">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-semibold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function confidenceColor(score) {
  if (score == null) return "text-slate-500 border-slate-600/40 bg-slate-600/10";
  if (score >= 70) return "text-emerald-300 border-emerald-400/40 bg-emerald-400/10";
  if (score >= 40) return "text-amber-300 border-amber-400/40 bg-amber-400/10";
  return "text-rose-300 border-rose-400/40 bg-rose-400/10";
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function AIInsightsPage() {
  const pageRef = useRef(null);
  const starsRef = useRef(null);
  const moonRef = useRef(null);
  const glowRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const [data, setData] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState("");
  const [businessId, setBusinessId] = useState(null);
  const [authHeader, setAuthHeader] = useState(null);

  const [messages, setMessages] = useState([
    { role: "ai", text: "Ask me about today's leads — who's actually interested, which trigger word is converting, anything." },
  ]);
  const [asking, setAsking] = useState(false);

  const stats = data?.stats || [];
  const engagementSeries = data?.engagement_series || [];
  const triggerPerformance = data?.trigger_performance || [];
  const recommendation = data?.recommendation;
  const confidence = data?.confidence ?? recommendation?.confidence ?? 0;
  const maxConversion = triggerPerformance.length
    ? Math.max(...triggerPerformance.map((t) => t.conversion))
    : 0;

  /* ---------- resolve who's logged in ---------- */

  async function getAuth() {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (sessionError || !session) {
      throw new Error("You need to be logged in to view AI Insights.");
    }

    // business_id is the logged-in user's own id — the backend's
    // verify_owner rejects any request where these don't match.
    return {
      businessId: session.user.id,
      authHeader: `Bearer ${session.access_token}`,
    };
  }

  /* ---------- fetch dashboard + leads ---------- */

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const { businessId: id, authHeader: header } = await getAuth();
      setBusinessId(id);
      setAuthHeader(header);

      const [insightsRes, leadsRes] = await Promise.all([
        fetch(`${API_BASE}/${id}/dashboard`, {
          headers: { Authorization: header },
          cache: "no-store",
        }),
        fetch(`${API_BASE}/${id}/leads`, {
          headers: { Authorization: header },
          cache: "no-store",
        }),
      ]);
      if (!insightsRes.ok) throw new Error(`Failed to load insights (${insightsRes.status})`);
      if (!leadsRes.ok) throw new Error(`Failed to load leads (${leadsRes.status})`);

      const insightsJson = await insightsRes.json();
      const leadsJson = await leadsRes.json();

      setData(insightsJson?.data ?? insightsJson);
      setLeads(leadsJson?.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load AI insights.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalysis() {
    if (!businessId || !authHeader || analyzing) return;
    setAnalyzing(true);
    setAnalyzeMsg("");
    try {
      const res = await fetch(`${API_BASE}/${businessId}/analyze`, {
        method: "POST",
        headers: { Authorization: authHeader },
      });
      if (!res.ok) throw new Error(`Analysis failed (${res.status})`);
      const json = await res.json();
      const scored = json?.data?.scored ?? 0;
      setAnalyzeMsg(scored > 0 ? `Scored ${scored} new lead${scored === 1 ? "" : "s"}.` : "Nothing new to score.");
      await loadAll();
    } catch (e) {
      setAnalyzeMsg(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  /* ---------- chatbox ---------- */

  async function handleAsk(e) {
    e.preventDefault();
    const question = chatInputRef.current?.value.trim();
    if (!question || asking || !businessId || !authHeader) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    if (chatInputRef.current) chatInputRef.current.value = "";
    setAsking(true);

    try {
      const res = await fetch(`${API_BASE}/${businessId}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`Ask failed (${res.status})`);
      const json = await res.json();
      const answer = json?.answer || "I couldn't find an answer for that.";
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: err instanceof Error ? err.message : "Something went wrong asking that." },
      ]);
    } finally {
      setAsking(false);
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- starfield background ---------- */

  useEffect(() => {
    const canvas = starsRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.005,
      drift: (Math.random() - 0.5) * 0.08,
    }));

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.twinkle += s.speed;
        s.y += s.drift * 0.3;
        if (s.y > canvas.height) s.y = 0;
        if (s.y < 0) s.y = canvas.height;
        const alpha = 0.35 + Math.abs(Math.sin(s.twinkle)) * 0.65;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233,217,184,${alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ---------- moon glow follows cursor ---------- */

  useEffect(() => {
    const page = pageRef.current;
    const glow = glowRef.current;
    if (!page || !glow) return;
    let raf = 0;
    const onMove = (e) => {
      const rect = page.getBoundingClientRect();
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${e.clientX - rect.left - 260}px, ${e.clientY - rect.top - 260}px, 0)`;
      });
    };
    page.addEventListener("mousemove", onMove);
    return () => {
      page.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* ---------- entrance timeline ---------- */

  useEffect(() => {
    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(".moon-eyebrow", { opacity: [0, 1], translateY: [10, 0], duration: 600 })
      .add(".moon-title-word", { opacity: [0, 1], translateY: [50, 0], rotateX: [80, 0], duration: 1000, delay: stagger(60) }, "-=400")
      .add(".moon-subtitle", { opacity: [0, 1], translateY: [20, 0], duration: 800 }, "-=500")
      .add(".moon-orb-wrap", { opacity: [0, 1], scale: [0.5, 1], duration: 1000, ease: "outElastic(1, .5)" }, "-=600")
      .add(".moon-ring", { opacity: [0, 1], scale: [0.4, 1], duration: 900, delay: stagger(100) }, "-=700")
      .add(".moon-stat", { opacity: [0, 1], translateY: [16, 0], duration: 600, delay: stagger(90) }, "-=500");

    const breathe = animate(".moon-core", { scale: [1, 1.07, 1], duration: 3200, loop: true, ease: "inOutSine" });
    const haze = animate(".moon-halo", { opacity: [0.35, 0.65, 0.35], scale: [1, 1.15, 1], duration: 3600, loop: true, ease: "inOutSine" });
    const rings = [];
    document.querySelectorAll(".moon-ring").forEach((el, i) => {
      rings.push(animate(el, { rotate: i % 2 === 0 ? "1turn" : "-1turn", duration: 9000 + i * 2000, loop: true, ease: "linear" }));
    });

    return () => [breathe, haze, ...rings].forEach((a) => a?.pause?.());
  }, []);

  useEffect(() => {
    if (!loading && (stats.length > 0 || leads.length > 0)) {
      animate(".moon-lead-row", { opacity: [0, 1], translateX: [-12, 0], duration: 500, delay: stagger(60) });
      animate(".moon-insight-card", { opacity: [0, 1], scale: [0.9, 1], duration: 700, delay: stagger(100), ease: "outExpo" });
      animate(".moon-confidence-fill", { width: ["0%", `${confidence}%`], duration: 1400, ease: "outExpo" });
    }
  }, [loading, stats.length, leads.length, confidence]);

  const leadsToday = data?.leadsToday ?? 0;
  const repliesToday = data?.repliesToday ?? 0;

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1c] via-[#0c0c22] to-[#050510] px-6 py-12 text-slate-200 lg:px-10"
    >
      <canvas ref={starsRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.9 }} />
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-[#c9a876]/[0.06] blur-[110px]"
        style={{ willChange: "transform" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl" style={{ perspective: "1400px" }}>
        {/* ============ HERO — the moon ============ */}
        <section className="relative flex flex-col items-center pb-14 pt-6 text-center">
          <p className="moon-eyebrow font-mono text-xs uppercase tracking-[0.3em] text-[#c9a876] opacity-0">
            Moonlit Insights Engine
          </p>
          <h1 className="mt-5 font-display text-5xl font-bold tracking-tight text-white sm:text-6xl" style={{ transformStyle: "preserve-3d" }}>
            {splitWords("Every lead, under one moon.")}
          </h1>
          <p className="moon-subtitle mt-5 max-w-xl text-base text-slate-400 opacity-0 sm:text-lg">
            Comments become leads, leads get scored for real interest, and the ones worth
            chasing rise to the surface — read them here or ask the moon directly.
          </p>

          <div className="moon-orb-wrap relative mt-12 flex h-56 w-56 items-center justify-center opacity-0" ref={moonRef}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="moon-ring absolute rounded-full border opacity-0"
                style={{
                  height: `${14 - i * 3}rem`,
                  width: `${14 - i * 3}rem`,
                  borderColor: `rgba(201,168,118,${0.3 - i * 0.08})`,
                }}
              >
                <span
                  className="absolute h-1.5 w-1.5 rounded-full"
                  style={{
                    background: i === 2 ? "#a78bfa" : "#e9d9b8",
                    boxShadow: i === 2 ? "0 0 10px 2px rgba(167,139,250,0.6)" : "0 0 10px 2px rgba(233,217,184,0.6)",
                    top: i % 2 === 0 ? "-3px" : "50%",
                    left: i % 2 === 0 ? "50%" : i === 1 ? "-3px" : "auto",
                    right: i === 2 ? "-3px" : "auto",
                    transform: i % 2 === 0 ? "translateX(-50%)" : "translateY(-50%)",
                  }}
                />
              </div>
            ))}
            <div className="moon-halo absolute h-32 w-32 rounded-full bg-[#e9d9b8]/25 blur-3xl" />
            <div className="moon-core relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#f3e6c8] via-[#e9d9b8] to-[#c9a876] text-[#0a0a18] shadow-[0_0_50px_10px_rgba(233,217,184,0.35)]">
              <Moon size={30} strokeWidth={1.5} />
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-xs text-slate-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {loading ? "Reading the sky…" : "Live — updated on your last analysis run"}
          </div>
        </section>

        {/* ============ TODAY STATS ============ */}
        <section className="grid grid-cols-2 gap-4 border-y border-white/[0.06] py-8 sm:grid-cols-4">
          <div className="moon-stat rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center opacity-0">
            <Users className="mx-auto mb-2 text-[#c9a876]" size={18} />
            <p className="font-display text-3xl font-bold text-white">{leadsToday}</p>
            <p className="mt-1 text-xs text-slate-500">Leads today</p>
          </div>
          <div className="moon-stat rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center opacity-0">
            <UserCheck className="mx-auto mb-2 text-emerald-300" size={18} />
            <p className="font-display text-3xl font-bold text-white">{repliesToday}</p>
            <p className="mt-1 text-xs text-slate-500">Replied today</p>
          </div>
          {stats.map((s) => (
            <div key={s.label} className="moon-stat rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center opacity-0">
              <Star className="mx-auto mb-2 text-[#a78bfa]" size={18} />
              <p className="font-display text-3xl font-bold text-white">
                {s.value}
                {s.suffix || ""}
              </p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/10 bg-red-400/5 px-5 py-4 text-sm text-red-300">
            <p className="font-semibold">Couldn&apos;t load your insights.</p>
            <p className="mt-1 text-red-300/70">{error}</p>
          </div>
        )}

        {/* ============ CONFIDENCE + RECOMMENDATION ============ */}
        <section className="pt-16">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-2xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c9a876]">
              <Sparkles size={12} />
              AI Confidence
            </p>
            <h3 className="mb-4 font-display text-xl font-bold text-white">
              {recommendation?.title || "Run an analysis to get your first recommendation"}
            </h3>
            <p className="mb-6 max-w-xl text-sm leading-relaxed text-slate-400">
              {recommendation?.body || "Score your leads and the AI will tell you which trigger word is working and who to follow up with."}
            </p>
            <div className="mb-6 max-w-sm">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Average lead confidence</span>
                <span className="font-mono text-[#c9a876]">{confidence}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="moon-confidence-fill h-full rounded-full bg-gradient-to-r from-[#c9a876] to-[#e9d9b8] shadow-[0_0_12px_2px_rgba(201,168,118,0.5)]"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c9a876] px-5 py-3 text-sm font-semibold text-[#0a0a18] shadow-[0_0_24px_-4px_rgba(201,168,118,0.5)] transition hover:bg-[#e9d9b8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {analyzing ? "Analyzing…" : "Run AI analysis on new leads"}
            </button>
            {analyzeMsg && <p className="mt-3 text-xs text-slate-500">{analyzeMsg}</p>}
          </div>
        </section>

        {/* ============ CHARTS ============ */}
        <section className="pt-16">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a876]/15 text-[#c9a876]">
              <TrendingUp size={16} />
            </div>
            <h2 className="font-display text-xl font-semibold text-white">Trends &amp; breakdown</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <div className="moon-insight-card rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 opacity-0 backdrop-blur-2xl lg:col-span-3">
              <h3 className="mb-1 font-display text-base font-semibold text-white">Comments vs. DMs sent</h3>
              <p className="mb-4 text-xs text-slate-500">Last 14 days</p>
              <div className="h-64 w-full">
                {engagementSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="commentsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c9a876" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#c9a876" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dmsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                      <Tooltip content={<GlassTooltip />} />
                      <Area type="monotone" dataKey="comments" name="Comments" stroke="#e9d9b8" strokeWidth={2} fill="url(#commentsFill)" />
                      <Area type="monotone" dataKey="dms" name="DMs sent" stroke="#a78bfa" strokeWidth={2} fill="url(#dmsFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-600">No engagement data yet.</div>
                )}
              </div>
            </div>

            <div className="moon-insight-card rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 opacity-0 backdrop-blur-2xl lg:col-span-2">
              <h3 className="mb-1 font-display text-base font-semibold text-white">Trigger word conversion</h3>
              <p className="mb-4 text-xs text-slate-500">% who replied, by word</p>
              <div className="h-64 w-full">
                {triggerPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={triggerPerformance} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                      <YAxis type="category" dataKey="word" tick={{ fill: "#cbd5e1", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} width={64} />
                      <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(201,168,118,0.06)" }} />
                      <Bar dataKey="conversion" name="Conversion" radius={[0, 6, 6, 0]}>
                        {triggerPerformance.map((entry) => (
                          <Cell key={entry.word} fill={entry.conversion === maxConversion ? "#c9a876" : "rgba(201,168,118,0.35)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-600">No trigger data yet.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============ LEADS TABLE ============ */}
        <section className="pt-16">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a876]/15 text-[#c9a876]">
              <Users size={16} />
            </div>
            <h2 className="font-display text-xl font-semibold text-white">Leads</h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl">
            <div className="grid grid-cols-[1.2fr_1fr_0.8fr_1.4fr] gap-3 border-b border-white/[0.06] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Username</span>
              <span>Trigger word</span>
              <span>Confidence</span>
              <span>AI read</span>
            </div>
            {loading && leads.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-600">Loading leads…</div>
            ) : leads.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-600">No leads yet — they&apos;ll show up here as comments come in.</div>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className="moon-lead-row grid grid-cols-[1.2fr_1fr_0.8fr_1.4fr] items-center gap-3 border-b border-white/[0.04] px-5 py-3 text-sm opacity-0 last:border-b-0"
                >
                  <span className="truncate font-medium text-white">@{lead.ig_username}</span>
                  <span className="truncate text-slate-400">{lead.trigger_word || "—"}</span>
                  <span>
                    {lead.confidence_score != null ? (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${confidenceColor(lead.confidence_score)}`}>
                        {lead.confidence_score}%{lead.is_interested && <Check size={11} className="ml-1" />}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">unscored</span>
                    )}
                  </span>
                  <span className="truncate text-xs text-slate-500">{lead.ai_reason || "—"}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ============ CHATBOX ============ */}
        <section className="py-16">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <MessageCircle size={12} />
              Ask about your leads
            </div>

            <div className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <p
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#c9a876] text-[#0a0a18]"
                        : "border border-white/[0.06] bg-white/[0.03] text-slate-300"
                    }`}
                  >
                    {m.text}
                  </p>
                </div>
              ))}
              {asking && (
                <div className="flex justify-start">
                  <p className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-500">
                    <Loader2 size={13} className="animate-spin" /> Thinking…
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleAsk} className="flex items-center gap-3">
              <input
                ref={chatInputRef}
                type="text"
                placeholder="e.g. Who replied today and seems ready to buy?"
                disabled={asking}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#c9a876] focus:outline-none focus:ring-1 focus:ring-[#c9a876]/30 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={asking}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-[#c9a876] px-5 py-3 text-sm font-semibold text-[#0a0a18] transition hover:bg-[#e9d9b8] disabled:opacity-60"
              >
                <Send size={14} />
                Ask
              </button>
            </form>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600&display=swap");
        .font-display {
          font-family: "Cinzel", "Inter", system-ui, serif !important;
          letter-spacing: -0.01em;
        }
        @media (prefers-reduced-motion: reduce) {
          .moon-title-word, .moon-eyebrow, .moon-subtitle, .moon-orb-wrap,
          .moon-ring, .moon-stat, .moon-insight-card, .moon-lead-row {
            opacity: 1 !important;
            transform: none !important;
          }
          .moon-core, .moon-halo { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
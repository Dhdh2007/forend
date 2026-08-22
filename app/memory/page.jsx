"use client";
import { createClient } from "lib/supabaseClient";
import { useEffect, useRef, useState, useCallback } from "react";
import { animate, stagger, createTimeline } from "animejs";
import {
  Moon,
  Send,
  Sparkles,
  Package,
  Tag,
  MessageCircleQuestion,
  Truck,
  ScrollText,
  Users,
  Target,
  Compass,
  Check,
  Loader2,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TSUKIKAMI — a moonlit memory keeper for the business owner.
   Write a fact to the moon; it remembers, forever, exactly as told.
   Wired to: PUT /memory-box/{id}, GET /memory-box/{id},
             POST /memory-box/{id}/message
   ───────────────────────────────────────────────────────────── */

// Client is created once at module load — this is safe outside the
// component because it's not a hook, just a plain object.
const supabase = createClient();

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://instabackend-m7wv.onrender.com/api";

/* Category lanterns — each maps a Memory Box field group to an icon + label */
const CATEGORIES = [
  { key: "products", label: "Products", icon: Package, kind: "products" },
  { key: "services", label: "Services", icon: Compass, kind: "products" },
  { key: "offers", label: "Offers & Discounts", icon: Tag, kind: "combo", fields: ["offers", "discounts", "promotions"] },
  { key: "faqs", label: "FAQs", icon: MessageCircleQuestion, kind: "faqs" },
  { key: "policies", label: "Shipping & Returns", icon: Truck, kind: "policy" },
  { key: "rules", label: "Business Rules", icon: ScrollText, kind: "list", field: "business_rules" },
  { key: "customers", label: "Who You Serve", icon: Users, kind: "text", field: "target_customers" },
  { key: "goals", label: "Goals", icon: Target, kind: "list", field: "goals" },
];

function splitWords(text) {
  return text.split(" ").map((word, i) => (
    <span
      key={i}
      className="tk-title-word inline-block opacity-0"
      style={{ marginRight: "0.3em", transformStyle: "preserve-3d" }}
    >
      {word}
    </span>
  ));
}

function entryCount(box, cat) {
  if (!box) return 0;
  if (cat.kind === "products") return (box[cat.key] || []).length;
  if (cat.kind === "combo") return cat.fields.reduce((n, f) => n + (box[f]?.length || 0), 0);
  if (cat.kind === "faqs") return (box.faqs || []).length;
  if (cat.kind === "policy") return [box.shipping_policy, box.return_policy].filter(Boolean).length;
  if (cat.kind === "list") return (box[cat.field] || []).length;
  if (cat.kind === "text") return box[cat.field] ? 1 : 0;
  return 0;
}

function CategoryDetail({ box, cat }) {
  if (cat.kind === "products") {
    const items = box[cat.key] || [];
    if (!items.length) return <EmptyNote />;
    return (
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.name} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-[#f2ede0]">
              {p.name}
              {p.is_best_seller && <span className="ml-2 text-[10px] text-[#c9a876]">★ best seller</span>}
            </span>
            <span className="font-mono text-xs text-[#a5b4fc]/70">{p.price || "no price on file"}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (cat.kind === "combo") {
    const items = cat.fields.flatMap((f) => box[f] || []);
    if (!items.length) return <EmptyNote />;
    return (
      <ul className="space-y-1.5 text-sm text-[#f2ede0]/90">
        {items.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    );
  }
  if (cat.kind === "faqs") {
    const items = box.faqs || [];
    if (!items.length) return <EmptyNote />;
    return (
      <ul className="space-y-3">
        {items.map((f, idx) => (
          <li key={idx} className="text-sm">
            <p className="text-[#f2ede0]">{f.question}</p>
            <p className="mt-0.5 text-[#a5b4fc]/70">{f.answer}</p>
          </li>
        ))}
      </ul>
    );
  }
  if (cat.kind === "policy") {
    if (!box.shipping_policy && !box.return_policy) return <EmptyNote />;
    return (
      <div className="space-y-2 text-sm text-[#f2ede0]/90">
        {box.shipping_policy && <p><span className="text-[#c9a876]">Shipping — </span>{box.shipping_policy}</p>}
        {box.return_policy && <p><span className="text-[#c9a876]">Returns — </span>{box.return_policy}</p>}
      </div>
    );
  }
  if (cat.kind === "list") {
    const items = box[cat.field] || [];
    if (!items.length) return <EmptyNote />;
    return (
      <ul className="space-y-1.5 text-sm text-[#f2ede0]/90">
        {items.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    );
  }
  if (cat.kind === "text") {
    return box[cat.field]
      ? <p className="text-sm text-[#f2ede0]/90">{box[cat.field]}</p>
      : <EmptyNote />;
  }
  return null;
}

function EmptyNote() {
  return <p className="text-sm italic text-[#6b7099]">Nothing told to the moon yet.</p>;
}

export default function MoonlitMemoryBox() {
  const pageRef = useRef(null);
  const moonRef = useRef(null);
  const moonGlowRef = useRef(null);
  const inputRef = useRef(null);
  const threadLayerRef = useRef(null);
  const starsCanvasRef = useRef(null);

  // The signed-in owner's business/profile uid — filled in once auth resolves.
  const [businessId, setBusinessId] = useState(null);
  const [authError, setAuthError] = useState(null);

  const [box, setBox] = useState(null);
  const [loadingBox, setLoadingBox] = useState(true);
  const [error, setError] = useState(null);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [lastLearned, setLastLearned] = useState(null); // { fields: {...} }
  const [openCategory, setOpenCategory] = useState(null);
  const [toast, setToast] = useState(null);

  /* ─── LOAD THE LOGGED-IN USER'S PROFILE UID ─── */
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

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
    return () => {
      cancelled = true;
    };
  }, []);

  /* ─── STARFIELD BACKDROP ─── */
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
      tw: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.tw += s.speed;
        const alpha = 0.35 + Math.sin(s.tw) * 0.35;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 220, 255, ${Math.max(0, alpha)})`;
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

  /* ─── LOAD MEMORY BOX FROM BACKEND (waits for businessId) ─── */
  const loadBox = useCallback(async (id) => {
    setLoadingBox(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/memory-box/${id}`);
      if (res.status === 404) {
        // First visit — create an empty box under a placeholder name.
        const created = await fetch(`${API_BASE}/memory-box/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business_name: "My Business" }),
        }).then((r) => r.json());
        setBox(created);
      } else if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      } else {
        setBox(await res.json());
      }
    } catch (e) {
      setError(e.message || "Could not reach the memory box.");
    } finally {
      setLoadingBox(false);
    }
  }, []);

  useEffect(() => {
    if (!businessId) return; // don't hit the API until we know who's logged in
    loadBox(businessId);
  }, [businessId, loadBox]);

  /* ─── ENTRANCE TIMELINE ─── */
  useEffect(() => {
    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(".tk-eyebrow", { opacity: [0, 1], translateY: [10, 0], duration: 600 })
      .add(
        ".tk-title-word",
        { opacity: [0, 1], translateY: [40, 0], rotateX: [70, 0], duration: 900, delay: stagger(70) },
        "-=350"
      )
      .add(".tk-subtitle", { opacity: [0, 1], translateY: [16, 0], duration: 700 }, "-=500")
      .add(".tk-moon-wrap", { opacity: [0, 1], scale: [0.6, 1], duration: 1100, ease: "outElastic(1, .6)" }, "-=500")
      .add(".tk-input-card", { opacity: [0, 1], translateY: [24, 0], duration: 700 }, "-=600");

    const moonBreathe = animate(".tk-moon-glow", {
      opacity: [0.35, 0.6, 0.35],
      scale: [1, 1.08, 1],
      duration: 4200,
      loop: true,
      ease: "inOutSine",
    });
    const moonDrift = animate(".tk-moon-body", {
      translateY: [0, -6, 0],
      duration: 6000,
      loop: true,
      ease: "inOutSine",
    });

    return () => {
      [moonBreathe, moonDrift].forEach((a) => a?.pause?.());
    };
  }, []);

  /* ─── CATEGORY LANTERNS REVEAL WHEN BOX LOADS ─── */
  useEffect(() => {
    if (!box) return;
    animate(".tk-lantern", {
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.85, 1],
      filter: ["blur(8px)", "blur(0px)"],
      duration: 800,
      delay: stagger(90),
      ease: "outExpo",
    });
    const sway = animate(".tk-lantern", {
      rotate: [-0.6, 0.6],
      duration: 3600,
      loop: true,
      alternate: true,
      delay: stagger(220),
      ease: "inOutSine",
    });
    return () => sway?.pause?.();
  }, [box === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2600);
  };

  /* ─── SEND A MEMORY (the signature moment) ─── */
  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending || !businessId) return;

    setSending(true);
    setLastLearned(null);

    // Launch the moonthread: a streak of light from the input up to the moon
    const layer = threadLayerRef.current;
    const inputEl = inputRef.current;
    const moonEl = moonRef.current;
    if (layer && inputEl && moonEl) {
      const inputRect = inputEl.getBoundingClientRect();
      const moonRect = moonEl.getBoundingClientRect();

      const thread = document.createElement("div");
      thread.className = "tk-thread";
      thread.style.position = "fixed";
      thread.style.left = `${inputRect.left + inputRect.width / 2}px`;
      thread.style.top = `${inputRect.top}px`;
      thread.style.width = "2px";
      thread.style.height = "2px";
      thread.style.borderRadius = "999px";
      thread.style.background = "radial-gradient(circle, #f2ede0, #c9a876 60%, transparent 70%)";
      thread.style.boxShadow = "0 0 12px 3px rgba(201,168,118,0.8)";
      thread.style.zIndex = "50";
      thread.style.pointerEvents = "none";
      document.body.appendChild(thread);

      animate(thread, {
        left: `${moonRect.left + moonRect.width / 2}px`,
        top: `${moonRect.top + moonRect.height / 2}px`,
        scale: [1, 0.4],
        opacity: [1, 0.9, 0],
        duration: 900,
        ease: "inQuad",
        onComplete: () => thread.remove(),
      });

      animate(moonEl, {
        scale: [1, 1.15, 1],
        duration: 700,
        delay: 750,
        ease: "outElastic(1, .5)",
      });
      animate(moonGlowRef.current, {
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.5, 1],
        duration: 900,
        delay: 750,
        ease: "outQuad",
      });
    }

    try {
      const res = await fetch(`${API_BASE}/memory-box/${businessId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.detail || `Server responded ${res.status}`);
      }
      const data = await res.json();
      setBox(data.memory_box);
      setLastLearned(data.extracted_fields);
      setDraft("");

      const learnedKeys = Object.keys(data.extracted_fields || {});
      showToast(
        learnedKeys.length
          ? `The moon remembers: ${learnedKeys.join(", ")}`
          : "Nothing new to remember in that note — try naming a fact directly."
      );
    } catch (err) {
      showToast(err.message || "Could not reach the memory box.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden px-6 py-14 text-[#f2ede0] lg:px-10"
      style={{
        background:
          "radial-gradient(120% 90% at 50% -10%, #171b3d 0%, #0b0d24 45%, #05050f 100%)",
      }}
    >
      <canvas ref={starsCanvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.9 }} />
      <div ref={threadLayerRef} className="pointer-events-none fixed inset-0 z-40" />

      {/* distant torii silhouette, pure CSS, sets the shrine mood */}
      <div className="pointer-events-none fixed bottom-0 left-1/2 z-0 h-40 w-full max-w-4xl -translate-x-1/2 opacity-[0.07]">
        <svg viewBox="0 0 400 140" className="h-full w-full">
          <rect x="40" y="20" width="320" height="14" fill="#e2dcff" />
          <rect x="20" y="46" width="360" height="10" fill="#e2dcff" />
          <rect x="70" y="30" width="16" height="110" fill="#e2dcff" />
          <rect x="314" y="30" width="16" height="110" fill="#e2dcff" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl" style={{ perspective: "1400px" }}>
        {/* ═══════════ HERO ═══════════ */}
        <section className="flex flex-col items-center pb-14 pt-4 text-center">
          <p className="tk-eyebrow font-mono text-[11px] uppercase tracking-[0.3em] text-[#a5b4fc] opacity-0">
            Tsukikami · the memory the moon keeps
          </p>
          <h1
            className="tk-title mt-5 text-5xl font-medium tracking-tight sm:text-6xl"
            style={{ fontFamily: "'Shippori Mincho', serif", transformStyle: "preserve-3d" }}
          >
            {splitWords("Tell it once. It remembers.")}
          </h1>
          <p className="tk-subtitle mt-5 max-w-lg text-sm text-[#c7c9e8]/80 opacity-0 sm:text-base">
            Write what your business is, sells, and believes. Nothing is ever guessed —
            only what you tell it is kept.
          </p>

          <div className="tk-moon-wrap relative mt-14 flex h-40 w-40 items-center justify-center opacity-0">
            <div
              ref={moonGlowRef}
              className="tk-moon-glow absolute h-32 w-32 rounded-full bg-[#f2ede0]/40 blur-3xl"
            />
            <div
              ref={moonRef}
              className="tk-moon-body relative flex h-24 w-24 items-center justify-center rounded-full shadow-[0_0_60px_10px_rgba(242,237,224,0.35)]"
              style={{
                background: "radial-gradient(circle at 35% 30%, #fffaf0, #f2ede0 55%, #cbc4dd 100%)",
              }}
            >
              <Moon size={26} className="text-[#3a3560]/50" strokeWidth={1.4} />
            </div>
          </div>
        </section>

        {authError && (
          <p className="mb-4 text-center text-sm text-rose-300/80">
            {authError} — please sign in to use your memory box.
          </p>
        )}

        {/* ═══════════ MESSAGE BOX — write a memory ═══════════ */}
        <section className="tk-input-card opacity-0">
          <form
            onSubmit={handleSend}
            className="relative rounded-2xl border border-[#a5b4fc]/[0.15] bg-[#0d0f2b]/70 p-6 backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
          >
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a876]">
              <Sparkles size={12} /> Write a memory
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) handleSend(e);
                }}
                rows={2}
                placeholder="e.g. Our Vitamin C Serum is $25 and our best seller. Returns are accepted within 30 days."
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-[#f2ede0] placeholder:text-[#6b7099] focus:border-[#a5b4fc]/50 focus:outline-none focus:ring-1 focus:ring-[#a5b4fc]/25"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim() || !businessId}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#c9a876] to-[#a5824a] px-5 py-3 text-sm font-semibold text-[#1a1730] shadow-[0_0_24px_-6px_rgba(201,168,118,0.6)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {sending ? "Sending" : "Send to the moon"}
              </button>
            </div>
            <p className="mt-3 text-xs text-[#6b7099]">
              Press Enter to send · Shift+Enter for a new line
            </p>

            {toast && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#c9a876]/25 bg-[#c9a876]/[0.06] px-3.5 py-2.5 text-xs text-[#e9d9b8]">
                <Check size={13} className="shrink-0 text-[#c9a876]" />
                {toast}
              </div>
            )}
          </form>
        </section>

        {/* ═══════════ MEMORY LANTERNS — what's stored, by category ═══════════ */}
        <section className="pt-16">
          <div className="mb-6 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a8ec2]">
            <ScrollText size={13} /> What the moon remembers
          </div>

          {!businessId && !authError && (
            <p className="text-sm text-[#6b7099]">Checking who's signed in…</p>
          )}
          {businessId && loadingBox && (
            <p className="text-sm text-[#6b7099]">Reading the memory box…</p>
          )}
          {error && (
            <p className="text-sm text-rose-300/80">
              {error} — Plz login with insta or Server error.
            </p>
          )}

          {box && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = entryCount(box, cat);
                const isOpen = openCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setOpenCategory(isOpen ? null : cat.key)}
                    className={`tk-lantern group relative overflow-hidden rounded-2xl border p-5 text-left opacity-0 backdrop-blur-xl transition-colors ${
                      isOpen
                        ? "border-[#c9a876]/40 bg-[#c9a876]/[0.06]"
                        : "border-white/[0.07] bg-white/[0.025] hover:border-[#a5b4fc]/25"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a5b4fc]/[0.12] text-[#c3c6f5]">
                        <Icon size={16} />
                      </div>
                      <span className="rounded-full bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-[#8a8ec2]">
                        {count}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#f2ede0]">{cat.label}</p>
                    <p className="mt-1 text-xs text-[#6b7099]">
                      {count === 0 ? "Not told yet" : isOpen ? "Tap to close" : "Tap to open"}
                    </p>

                    {isOpen && (
                      <div className="mt-4 border-t border-white/[0.07] pt-4">
                        <CategoryDetail box={box} cat={cat} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Inter:wght@400;500;600&display=swap");

        @media (prefers-reduced-motion: reduce) {
          .tk-title-word,
          .tk-eyebrow,
          .tk-subtitle,
          .tk-moon-wrap,
          .tk-input-card,
          .tk-lantern {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
          .tk-moon-glow,
          .tk-moon-body {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
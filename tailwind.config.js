/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // ---------------------------------------------------------------
      // DESIGN TOKENS
      // The palette is a deep graphite-navy (never pure black) with two
      // deliberately distinct accents: "signal" violet for the product's
      // core action (a trigger firing), and "alert" amber reserved ONLY
      // for usage/limit warnings, so amber always means "pay attention
      // to your quota" throughout the whole app.
      // ---------------------------------------------------------------
      colors: {
        base: {
          DEFAULT: "#0D1117",   // page background
          surface: "#151B26",   // cards
          raised: "#1C2432",    // hover/raised surfaces
          border: "#262E3D",
        },
        signal: {
          DEFAULT: "#8B7FFF",
          soft: "#A79BFF",
          dim: "#4B4494",
        },
        alert: {
          DEFAULT: "#F5A65B",
          soft: "#FFC98A",
        },
        success: {
          DEFAULT: "#3ECF8E",
          soft: "#6EE0AB",
        },
        ink: {
          DEFAULT: "#EDEFF5",
          muted: "#8B93A7",
          faint: "#5B6478",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "ping-ring": {
          "0%": { transform: "scale(0.6)", opacity: "0.7" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "drift": {
          "0%, 100%": { transform: "translate(0px, 0px)" },
          "33%": { transform: "translate(18px, -22px)" },
          "66%": { transform: "translate(-14px, 16px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "ping-ring": "ping-ring 2.4s cubic-bezier(0,0,0.2,1) infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "drift": "drift 14s ease-in-out infinite",
        "fade-up": "fade-up 0.7s ease-out both",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(139, 127, 255, 0.45)",
        card: "0 8px 30px -8px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};

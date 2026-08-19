"use client";

/**
 * SignalPulse
 * -----------------------------------------------------------------------
 * The one recurring visual motif of this app: concentric rings expanding
 * outward from a solid dot, representing the exact moment a comment
 * matches a trigger word and a DM fires. It shows up three places:
 *   1. Large, in the landing hero, around the trigger word itself
 *   2. Small, as the "live" indicator in the dashboard topbar
 *   3. Tiny, next to each row in the live activity feed
 * Reusing one idea at three scales is what makes it read as a signature
 * rather than a random decoration.
 * -----------------------------------------------------------------------
 */
export default function SignalPulse({ size = "md", color = "signal" }) {
  const sizes = {
    sm: { dot: "w-1.5 h-1.5", ring: "w-1.5 h-1.5" },
    md: { dot: "w-2.5 h-2.5", ring: "w-2.5 h-2.5" },
    lg: { dot: "w-4 h-4", ring: "w-4 h-4" },
  };

  const colors = {
    signal: { dot: "bg-signal", ring: "bg-signal" },
    success: { dot: "bg-success", ring: "bg-success" },
    alert: { dot: "bg-alert", ring: "bg-alert" },
  };

  const s = sizes[size];
  const c = colors[color];

  return (
    <span className="relative inline-flex items-center justify-center">
      <span className={`absolute inline-flex rounded-full ${c.ring} ${s.ring} animate-ping-ring`} />
      <span className={`absolute inline-flex rounded-full ${c.ring} ${s.ring} animate-ping-ring [animation-delay:0.8s]`} />
      <span className={`relative inline-flex rounded-full ${c.dot} ${s.dot}`} />
    </span>
  );
}

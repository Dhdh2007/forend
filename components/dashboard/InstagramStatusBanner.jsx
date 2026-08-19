"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

// Maps the ?instagram=... redirect param (set by the OAuth callback) to a
// real message, since these were previously just sitting silently in the
// URL bar with nothing shown to the user.
const MESSAGES = {
  connected: {
    tone: "success",
    text: "Instagram connected successfully.",
  },
  already_connected: {
    tone: "alert",
    text: "That Instagram account is already connected to a different account. Disconnect it there first, or use a different Instagram account.",
  },
  no_page: {
    tone: "alert",
    text: "No Facebook Page found for your account. Create or link a Page to your Instagram account, then try again.",
  },
  not_business: {
    tone: "alert",
    text: "That Facebook Page isn't linked to an Instagram Business or Creator account yet.",
  },
  error: {
    tone: "alert",
    text: "Something went wrong connecting Instagram. Please try again.",
  },
};

export default function InstagramStatusBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const status = searchParams.get("instagram");
  const message = status ? MESSAGES[status] : null;

  useEffect(() => {
    // Strip the query param from the URL once we've read it, so a page
    // refresh doesn't keep re-showing an old status.
    if (status) {
      const url = new URL(window.location.href);
      url.searchParams.delete("instagram");
      router.replace(url.pathname + url.search, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!message || dismissed) return null;

  const isSuccess = message.tone === "success";

  return (
    <div
      className={`mb-6 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        isSuccess
          ? "border-success/30 bg-success/10 text-success"
          : "border-alert/30 bg-alert/10 text-alert"
      }`}
    >
      <div className="flex items-start gap-2">
        {isSuccess ? (
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        )}
        <span>{message.text}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 opacity-70 transition hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
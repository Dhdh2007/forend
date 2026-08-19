"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { deleteAccount } from "@/lib/api";

export default function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const canConfirm = confirmText.trim().toUpperCase() === "DELETE";

  async function handleDelete() {
    if (!canConfirm || isDeleting) return;
    setIsDeleting(true);
    setError(null);

    try {
      // Wipes dm_events, campaigns, the profile row, and the auth user
      // itself server-side — see DELETE /api/account in app/routers/dash.py.
      await deleteAccount();

      // The auth user no longer exists server-side, so just clear the
      // local session and send them somewhere that doesn't require login.
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong deleting your account.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-alert/30 bg-alert/5 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-alert" />
        <div>
          <p className="text-sm font-medium text-ink">Delete account</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Permanently deletes your account, all campaigns, your DM
            activity history, and your Instagram connection. This can't
            be undone.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-lg border border-alert/40 px-4 py-2 text-xs font-medium text-alert transition hover:bg-alert/10"
      >
        Delete my account
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => !isDeleting && setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-base-border bg-base-surface p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-alert">
                  <AlertTriangle size={18} />
                  <h2 className="font-display text-base font-semibold">
                    Delete your account?
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isDeleting}
                  className="text-ink-faint transition hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                This immediately and permanently deletes your account,
                campaigns, DM history, and Instagram connection. Type{" "}
                <span className="font-mono font-semibold text-ink">
                  DELETE
                </span>{" "}
                to confirm.
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoFocus
                className="mt-4 w-full rounded-lg border border-base-border bg-base px-3 py-2 text-sm text-ink outline-none focus:border-alert"
              />

              {error && <p className="mt-2 text-xs text-alert">{error}</p>}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isDeleting}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-ink-muted transition hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!canConfirm || isDeleting}
                  className="rounded-lg bg-alert px-4 py-2 text-xs font-medium text-white transition hover:bg-alert/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isDeleting ? "Deleting…" : "Permanently delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Link2, Pencil, Radio, Trash2 } from "lucide-react";
import { deleteCampaign } from "@/lib/api";

/**
 * CampaignsList
 * -----------------------------------------------------------------------
 * The one dashboard panel wired to REAL data — it renders whatever
 * campaigns[] the parent fetched from GET /api/campaigns. Loading and
 * empty states are handled explicitly rather than just "not showing
 * anything," per the product's own voice: an empty dashboard should tell
 * you what to do next, not just look broken.
 *
 * onDelete and onEdit are optional — pass them from the parent so this
 * list can update its local campaigns[] state after a successful
 * delete/edit, and so the parent can open its edit modal pre-filled with
 * the clicked campaign.
 * -----------------------------------------------------------------------
 */
export default function CampaignsList({ campaigns, isLoading, error, onDelete, onEdit }) {
  const [pendingId, setPendingId] = useState(null); // id awaiting confirm click
  const [deletingId, setDeletingId] = useState(null); // id currently being deleted
  const [deleteError, setDeleteError] = useState(null);

  async function handleConfirmDelete(id) {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteCampaign(id);
      onDelete?.(id);
    } catch (err) {
      setDeleteError(err.message || "Couldn't delete this trigger.");
    } finally {
      setDeletingId(null);
      setPendingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-base-border bg-base-surface shadow-card">
      <div className="flex items-center justify-between border-b border-base-border px-6 py-5">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            Your triggers
          </h3>
          <p className="text-xs text-ink-faint">Live from your account</p>
        </div>
      </div>

      <div className="divide-y divide-base-border">
        {isLoading && (
          <div className="space-y-3 p-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-base-raised" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="p-6 text-sm text-alert">
           Plzzz... Wait
          </div>
        )}

        {!isLoading && !error && deleteError && (
          <div className="px-6 pt-4 text-xs text-alert">{deleteError}</div>
        )}

        {!isLoading && !error && campaigns.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-signal/12 text-signal">
              <Radio size={19} />
            </div>
            <p className="text-sm text-ink">No triggers yet</p>
            <p className="max-w-xs text-xs text-ink-faint">
              Create one to start turning comments into automatic DMs.
            </p>
          </div>
        )}

        {!isLoading &&
          !error &&
          campaigns.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-6 py-4 transition hover:bg-base-raised/60"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-signal/12 px-2 py-1 font-mono text-xs font-medium text-signal-soft">
                  {c.trigger_word}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-ink-faint">
                  <Link2 size={12} />
                  <span className="max-w-[220px] truncate">
                    {c.destination_link}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    c.is_active
                      ? "bg-success/12 text-success"
                      : "bg-base-raised text-ink-faint"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      c.is_active ? "bg-success" : "bg-ink-faint"
                    }`}
                  />
                  {c.is_active ? "Active" : "Paused"}
                </span>

                {pendingId === c.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="rounded-md bg-alert px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-alert/90 disabled:opacity-50"
                    >
                      {deletingId === c.id ? "Deleting…" : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingId(null)}
                      disabled={deletingId === c.id}
                      className="rounded-md px-2 py-1 text-[11px] text-ink-faint transition hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit?.(c)}
                      aria-label={`Edit trigger word ${c.trigger_word}`}
                      className="rounded-md p-1.5 text-ink-faint transition hover:bg-signal/10 hover:text-signal"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingId(c.id)}
                      aria-label={`Delete trigger word ${c.trigger_word}`}
                      className="rounded-md p-1.5 text-ink-faint transition hover:bg-alert/10 hover:text-alert"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
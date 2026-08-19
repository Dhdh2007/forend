"use client";

import { useEffect, useState } from "react";
import CampaignsList from "@/components/dashboard/CampaignsList";
import NewCampaignModal from "@/components/dashboard/NewCampaignModal";
import { fetchCampaigns } from "@/lib/api";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null); // null = create mode

  useEffect(() => {
    fetchCampaigns()
      .then(setCampaigns)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  function handleSaved(saved) {
    setCampaigns((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [saved, ...prev];
    });
  }

  function handleDeleted(campaignId) {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
  }

  function openCreateModal() {
    setEditingCampaign(null);
    setModalOpen(true);
  }

  function openEditModal(campaign) {
    setEditingCampaign(campaign);
    setModalOpen(true);
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">Campaigns</h1>
        <button
          onClick={openCreateModal}
          className="rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white hover:bg-signal-soft"
        >
          + New trigger
        </button>
      </div>

      <CampaignsList
        campaigns={campaigns}
        isLoading={isLoading}
        error={error}
        onDelete={handleDeleted}
        onEdit={openEditModal}
      />

      <NewCampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        campaign={editingCampaign}
      />
    </div>
  );
}
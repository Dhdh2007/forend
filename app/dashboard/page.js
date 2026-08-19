"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, Megaphone, TrendingUp } from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
import StatCard from "@/components/dashboard/StatCard";
import UsageGauge from "@/components/dashboard/UsageGauge";
import DMTrendChart from "@/components/dashboard/DMTrendChart";
import CampaignsList from "@/components/dashboard/CampaignsList";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import NewCampaignModal from "@/components/dashboard/NewCampaignModal";

import { fetchCampaigns, fetchAnalytics } from "@/lib/api";
import { toWeekdayLabel, toRelativeTime } from "@/lib/format";

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null); // null = create mode

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchCampaigns(), fetchAnalytics()])
      .then(([campaignsData, analyticsData]) => {
        if (cancelled) return;
        setCampaigns(campaignsData);
        setAnalytics(analyticsData);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.is_active).length;

  const chartData =
    analytics?.daily_trend.map((point) => ({
      day: toWeekdayLabel(point.date),
      sent: point.count,
    })) ?? [];

  const feedItems =
    analytics?.recent_activity.map((event) => ({
      id: event.id,
      username: event.commenter_username,
      trigger: event.trigger_word,
      time: toRelativeTime(event.sent_at),
    })) ?? [];

  const dmsSentThisCycle = analytics?.dms_sent_count ?? 0;
  const freeTierLimit = analytics?.free_tier_limit ?? 100;
  const weeklyTotal = chartData.reduce((sum, d) => sum + d.sent, 0);

  function handleSaved(saved) {
    setCampaigns((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [saved, ...prev];
    });
  }

  return (
    <>
      <Topbar
        onNewCampaign={() => {
          setEditingCampaign(null);
          setModalOpen(true);
        }}
      />

      <div className="space-y-6 px-6 py-8 lg:px-10">
        {error && (
          <div className="rounded-xl border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-alert">
            Server is in cold start — {error}. Wait a moment.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard
            icon={MessageSquareText}
            label="DMs sent this cycle"
            value={isLoading ? "—" : dmsSentThisCycle}
            accent="signal"
          />
          <StatCard
            icon={Megaphone}
            label="Active triggers"
            value={isLoading ? "—" : activeCampaigns}
            accent="success"
          />
          <StatCard
            icon={TrendingUp}
            label="Comments matched (7d)"
            value={isLoading ? "—" : weeklyTotal}
            accent="alert"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <DMTrendChart data={chartData} />
          <UsageGauge used={dmsSentThisCycle} limit={freeTierLimit} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <CampaignsList
            campaigns={campaigns}
            isLoading={isLoading}
            error={error}
            onDelete={(campaignId) =>
              setCampaigns((prev) => prev.filter((c) => c.id !== campaignId))
            }
            onEdit={(campaign) => {
              setEditingCampaign(campaign);
              setModalOpen(true);
            }}
          />
          <ActivityFeed items={feedItems} isLoading={isLoading} />
        </div>
      </div>

      <NewCampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        campaign={editingCampaign}
      />
    </>
  );
}
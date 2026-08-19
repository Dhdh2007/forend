"use client";

import { useEffect, useState } from "react";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { fetchActivity } from "@/lib/api";

export default function ActivityPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
   fetchActivity()
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="mb-6 font-display text-xl font-semibold text-ink">Activity</h1>
      <ActivityFeed items={items} isLoading={isLoading} />
    </div>
  );
}
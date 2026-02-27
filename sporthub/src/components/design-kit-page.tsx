"use client";

import { useState } from "react";
import { BottomNav, type Tab } from "@/components/bottom-nav";
import { DiscoverView } from "@/components/discover-view";
import { BookingsView } from "@/components/bookings-view";
import { ProfileView } from "@/components/profile-view";
import { ActivityDetailSheet } from "@/components/activity-detail-sheet";
import type { Activity } from "@/lib/data";

export default function DesignKitPage() {
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleActivityClick(activity: Activity) {
    setSelectedActivity(activity);
    setSheetOpen(true);
  }

  return (
    <main className="min-h-dvh bg-background">
      {activeTab === "discover" && (
        <DiscoverView onActivityClick={handleActivityClick} />
      )}
      {activeTab === "bookings" && (
        <BookingsView onActivityClick={handleActivityClick} />
      )}
      {activeTab === "profile" && <ProfileView />}

      <ActivityDetailSheet
        activity={selectedActivity}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}

"use client"

import { cn } from "@/lib/utils"
import { Compass, CalendarCheck, User } from "lucide-react"
import { useBookings } from "@/lib/use-bookings"

export type Tab = "discover" | "bookings" | "profile"

type BottomNavProps = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { bookings } = useBookings()
  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length

  const tabs: { id: Tab; label: string; icon: typeof Compass }[] = [
    { id: "discover", label: "Discover", icon: Compass },
    { id: "bookings", label: "Bookings", icon: CalendarCheck },
    { id: "profile", label: "Profile", icon: User },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "size-5 transition-all",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {tab.id === "bookings" && upcomingCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex size-4 items-center justify-center rounded-full bg-sport-coral text-[9px] font-bold text-white">
                    {upcomingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

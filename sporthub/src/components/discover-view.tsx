"use client"

import { useState, useMemo } from "react"
import { HeroSection } from "@/components/hero-section"
import { CategoryPills } from "@/components/category-pills"
import { ActivityCard } from "@/components/activity-card"
import { activities } from "@/lib/data"
import type { Activity, ActivityType } from "@/lib/data"
import { cn } from "@/lib/utils"

const typeFilters: { id: ActivityType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "group-class", label: "Group Classes" },
  { id: "individual", label: "1-on-1 Training" },
  { id: "bootcamp", label: "Bootcamps" },
  { id: "tournament", label: "Tournaments" },
]

type DiscoverViewProps = {
  onActivityClick: (activity: Activity) => void
}

export function DiscoverView({ onActivityClick }: DiscoverViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState<ActivityType | "all">("all")

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchesSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.instructor.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === "all" || a.sport === selectedCategory

      const matchesType = selectedType === "all" || a.type === selectedType

      return matchesSearch && matchesCategory && matchesType
    })
  }, [searchQuery, selectedCategory, selectedType])

  return (
    <div className="flex flex-col pb-20">
      <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Categories */}
      <div className="sticky top-0 z-20 bg-background pt-4 pb-1 shadow-sm shadow-background">
        <CategoryPills
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {typeFilters.map((tf) => (
          <button
            key={tf.id}
            onClick={() => setSelectedType(tf.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              selectedType === tf.id
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-base font-semibold text-foreground">
          {filtered.length} {filtered.length === 1 ? "activity" : "activities"}{" "}
          found
        </h2>
      </div>

      {/* Activity grid */}
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onClick={onActivityClick}
          />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
            <span className="text-2xl text-muted-foreground" aria-hidden="true">
              ?
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            No activities found
          </p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your filters or search term
          </p>
        </div>
      )}
    </div>
  )
}

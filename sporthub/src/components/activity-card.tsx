"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Activity } from "@/lib/data"
import { MapPin, Clock, Users, Star } from "lucide-react"

const typeLabels: Record<string, string> = {
  "group-class": "Group Class",
  individual: "1-on-1",
  bootcamp: "Bootcamp",
  tournament: "Tournament",
}

const typeColors: Record<string, string> = {
  "group-class": "bg-sport-teal text-white",
  individual: "bg-sport-coral text-white",
  bootcamp: "bg-sport-navy text-white",
  tournament: "bg-sport-yellow text-sport-navy",
}

type ActivityCardProps = {
  activity: Activity
  onClick: (activity: Activity) => void
}

export function ActivityCard({ activity, onClick }: ActivityCardProps) {
  const spotsPercent =
    ((activity.totalSpots - activity.spotsLeft) / activity.totalSpots) * 100
  const isAlmostFull = activity.spotsLeft <= 4

  return (
    <button
      onClick={() => onClick(activity)}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-label={`${activity.title} - ${typeLabels[activity.type]} with ${activity.instructor}`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              typeColors[activity.type]
            )}
          >
            {typeLabels[activity.type]}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-xs font-semibold text-card-foreground backdrop-blur-sm">
            <Star className="size-3 fill-sport-yellow text-sport-yellow" />
            {activity.rating}
          </span>
        </div>
        {/* Date pill */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-card-foreground backdrop-blur-sm">
            {activity.date} at {activity.time}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight text-card-foreground text-balance">
            {activity.title}
          </h3>
          <span className="shrink-0 text-lg font-bold text-primary">
            €{activity.price}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{activity.location}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {activity.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {activity.spotsLeft} spots left
            </span>
          </div>
        </div>

        {/* Spots bar */}
        <div className="flex flex-col gap-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isAlmostFull ? "bg-sport-coral" : "bg-sport-teal"
              )}
              style={{ width: `${spotsPercent}%` }}
            />
          </div>
          {isAlmostFull && (
            <span className="text-[10px] font-medium text-sport-coral">
              Almost full!
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {activity.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            >
              {tag}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          >
            {activity.level}
          </Badge>
        </div>
      </div>
    </button>
  )
}

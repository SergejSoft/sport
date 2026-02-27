"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Activity } from "@/lib/data"
import { useBookings } from "@/lib/use-bookings"
import {
  MapPin,
  Clock,
  Users,
  Star,
  Calendar,
  ChevronRight,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const typeLabels: Record<string, string> = {
  "group-class": "Group Class",
  individual: "1-on-1",
  bootcamp: "Bootcamp",
  tournament: "Tournament",
}

type ActivityDetailSheetProps = {
  activity: Activity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivityDetailSheet({
  activity,
  open,
  onOpenChange,
}: ActivityDetailSheetProps) {
  const { addBooking, isBooked } = useBookings()
  const [justBooked, setJustBooked] = useState(false)

  if (!activity) return null

  const alreadyBooked = isBooked(activity.id)
  const spotsPercent =
    ((activity.totalSpots - activity.spotsLeft) / activity.totalSpots) * 100

  function handleBook() {
    addBooking(activity!)
    setJustBooked(true)
    setTimeout(() => {
      setJustBooked(false)
    }, 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92vh] overflow-y-auto rounded-t-3xl border-0 p-0"
      >
        {/* Hero image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={activity.image}
            alt={activity.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {typeLabels[activity.type]}
            </span>
            <SheetHeader className="p-0">
              <SheetTitle className="text-xl font-bold text-white text-left text-balance">
                {activity.title}
              </SheetTitle>
            </SheetHeader>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 px-5 py-5 pb-32">
          {/* Instructor row */}
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {activity.instructorAvatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {activity.instructor}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3 fill-sport-yellow text-sport-yellow" />
                <span className="font-medium text-foreground">
                  {activity.rating}
                </span>
                <span>({activity.reviewCount} reviews)</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              Profile
              <ChevronRight className="size-3.5" />
            </Button>
          </div>

          <Separator />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoTile
              icon={<Calendar className="size-4 text-sport-coral" />}
              label="Date"
              value={`${activity.date}, ${activity.time}`}
            />
            <InfoTile
              icon={<Clock className="size-4 text-sport-teal" />}
              label="Duration"
              value={activity.duration}
            />
            <InfoTile
              icon={<MapPin className="size-4 text-sport-coral" />}
              label="Location"
              value={activity.location}
            />
            <InfoTile
              icon={<Users className="size-4 text-sport-teal" />}
              label="Capacity"
              value={`${activity.spotsLeft} of ${activity.totalSpots} left`}
            />
          </div>

          {/* Spots bar */}
          <div className="flex flex-col gap-2 rounded-xl bg-secondary p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">Availability</span>
              <span className="text-muted-foreground">
                {activity.totalSpots - activity.spotsLeft}/{activity.totalSpots}{" "}
                booked
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-background">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  activity.spotsLeft <= 4 ? "bg-sport-coral" : "bg-sport-teal"
                )}
                style={{ width: `${spotsPercent}%` }}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
            >
              {activity.level}
            </Badge>
            {activity.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              About this activity
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {activity.description}
            </p>
          </div>

          {/* What to bring */}
          <div className="rounded-xl bg-sport-cream p-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">
              What to bring
            </h4>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-sport-teal" />
                Comfortable activewear
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-sport-teal" />
                Water bottle
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-sport-teal" />
                Towel
              </li>
            </ul>
          </div>
        </div>

        {/* Fixed bottom booking bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 px-5 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground">
                €{activity.price}
              </p>
              <p className="text-xs text-muted-foreground">per session</p>
            </div>
            <Button
              size="lg"
              onClick={handleBook}
              disabled={alreadyBooked || justBooked}
              className={cn(
                "flex-1 rounded-xl text-base font-semibold shadow-lg transition-all",
                alreadyBooked || justBooked
                  ? "bg-sport-teal text-white shadow-sport-teal/25"
                  : "bg-primary text-primary-foreground shadow-primary/25 hover:shadow-primary/40"
              )}
            >
              {alreadyBooked || justBooked ? (
                <>
                  <Check className="size-5" />
                  Booked!
                </>
              ) : (
                "Book Now"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-secondary p-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-xs font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

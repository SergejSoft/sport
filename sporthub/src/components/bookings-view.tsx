"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useBookings } from "@/lib/use-bookings"
import { cn } from "@/lib/utils"
import { MapPin, Clock, Calendar, X } from "lucide-react"
import type { Activity } from "@/lib/data"

type BookingsViewProps = {
  onActivityClick: (activity: Activity) => void
}

export function BookingsView({ onActivityClick }: BookingsViewProps) {
  const { bookings, cancelBooking } = useBookings()

  const upcoming = bookings.filter((b) => b.status === "upcoming")
  const past = bookings.filter((b) => b.status !== "upcoming")

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-14">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
        <p className="text-sm text-muted-foreground">
          {upcoming.length} upcoming{" "}
          {upcoming.length === 1 ? "session" : "sessions"}
        </p>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming
          </h2>
          <div className="flex flex-col gap-3">
            {upcoming.map((booking) => (
              <div
                key={booking.id}
                className="group flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
              >
                <button
                  onClick={() => onActivityClick(booking.activity)}
                  className="relative size-20 shrink-0 overflow-hidden rounded-xl"
                >
                  <Image
                    src={booking.activity.image}
                    alt={booking.activity.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
                <div className="flex flex-1 flex-col gap-1.5">
                  <button
                    onClick={() => onActivityClick(booking.activity)}
                    className="text-left"
                  >
                    <h3 className="text-sm font-semibold leading-tight text-card-foreground">
                      {booking.activity.title}
                    </h3>
                  </button>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    {booking.activity.date} at {booking.activity.time}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {booking.activity.location}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      className="rounded-full bg-sport-teal/10 text-sport-teal border-0 px-2 py-0.5 text-[10px]"
                    >
                      Confirmed
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto rounded-full px-2 py-0.5 text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => cancelBooking(booking.id)}
                    >
                      <X className="size-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="size-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              No upcoming bookings
            </p>
            <p className="text-xs text-muted-foreground">
              Discover activities and book your first session!
            </p>
          </div>
        </div>
      )}

      {/* Past / Cancelled */}
      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Past & Cancelled
          </h2>
          <div className="flex flex-col gap-3">
            {past.map((booking) => (
              <div
                key={booking.id}
                className="flex gap-3 rounded-2xl border border-border bg-card p-3 opacity-60"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={booking.activity.image}
                    alt={booking.activity.title}
                    fill
                    className="object-cover grayscale"
                    sizes="64px"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <h3 className="text-sm font-semibold text-card-foreground">
                    {booking.activity.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {booking.activity.date} at {booking.activity.time}
                  </div>
                  <Badge
                    variant="outline"
                    className="mt-1 w-fit rounded-full px-2 py-0.5 text-[10px]"
                  >
                    {booking.status === "cancelled" ? "Cancelled" : "Completed"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

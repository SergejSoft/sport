"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useBookings } from "@/lib/use-bookings"
import {
  ChevronRight,
  Settings,
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  Trophy,
  Flame,
  Target,
} from "lucide-react"

export function ProfileView() {
  const { bookings } = useBookings()
  const completedCount = bookings.filter((b) => b.status === "completed").length
  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-14">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <Avatar className="size-20 border-4 border-primary/20">
          <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
            AK
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">Alex Kim</h1>
          <p className="text-sm text-muted-foreground">
            Active since Jan 2026
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-secondary p-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-sport-coral/10">
            <Flame className="size-4 text-sport-coral" />
          </div>
          <p className="text-lg font-bold text-foreground">12</p>
          <p className="text-[10px] text-muted-foreground">Day Streak</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-secondary p-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-sport-teal/10">
            <Target className="size-4 text-sport-teal" />
          </div>
          <p className="text-lg font-bold text-foreground">{upcomingCount + completedCount}</p>
          <p className="text-[10px] text-muted-foreground">Sessions</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-secondary p-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-sport-yellow/10">
            <Trophy className="size-4 text-sport-yellow" />
          </div>
          <p className="text-lg font-bold text-foreground">3</p>
          <p className="text-[10px] text-muted-foreground">Sports</p>
        </div>
      </div>

      <Separator />

      {/* Menu items */}
      <div className="flex flex-col gap-1">
        {[
          { icon: Settings, label: "Account Settings" },
          { icon: Bell, label: "Notifications" },
          { icon: CreditCard, label: "Payment Methods" },
          { icon: HelpCircle, label: "Help & Support" },
        ].map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <item.icon className="size-5 text-muted-foreground" />
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <Separator />

      <Button
        variant="ghost"
        className="justify-start gap-3 rounded-xl px-3 py-3.5 text-sm font-medium text-destructive hover:bg-destructive/5 hover:text-destructive"
      >
        <LogOut className="size-5" />
        Log Out
      </Button>
    </div>
  )
}

"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { SPORT_TYPE_LABELS } from "@/lib/sport-types";
import type { SportType } from "@prisma/client";

export function OrganiserBookingsOverview({ organisationId }: { organisationId?: string }) {
  const { data: classes, isLoading } = trpc.organiser.getClassesWithBookings.useQuery(
    organisationId ? { organisationId } : undefined
  );

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!classes?.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-700">No classes yet. Create a class and get it published to see bookings here.</p>
        <Link href="/organiser/classes" className="mt-2 inline-block text-sm font-medium text-gray-900 hover:underline">
          Classes →
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-6">
      {classes.map((c) => {
        const bookedCount = c.bookings.length;
        const spotsLeft = Math.max(0, c.capacity - bookedCount);
        return (
          <li
            key={c.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link href={`/organiser/classes/${c.id}/edit`} className="font-medium text-gray-900 hover:underline">
                  {c.title}
                </Link>
                <p className="text-sm text-gray-500">
                  {SPORT_TYPE_LABELS[c.sportType as SportType] ?? c.sportType} · {c.location.name}
                  {c.location.city ? `, ${c.location.city}` : ""}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(c.startTime).toLocaleString()} · {c.status}
                </p>
              </div>
              <div className="text-right text-sm">
                <span className="font-medium text-gray-900">{bookedCount} booked</span>
                <span className="text-gray-500"> · </span>
                <span className="text-gray-700">{spotsLeft} available</span>
                <span className="text-gray-500"> (of {c.capacity})</span>
              </div>
            </div>
            {c.bookings.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs font-medium uppercase text-gray-500">Participants</p>
                <ul className="mt-1 space-y-1 text-sm text-gray-700">
                  {c.bookings.map((b) => (
                    <li key={b.id}>
                      {[b.account.name, b.account.surname].filter(Boolean).join(" ") || b.account.email}
                      <span className="text-gray-500"> ({b.account.email})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { SPORT_TYPE_LABELS } from "@/lib/sport-types";
import type { SportType } from "@prisma/client";

export function MyBookingsList() {
  const { data: bookings, isLoading } = trpc.booking.getMyBookings.useQuery();
  const utils = trpc.useUtils();
  const cancel = trpc.booking.cancel.useMutation({
    onSuccess: () => utils.booking.getMyBookings.invalidate(),
  });

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;

  const active = (bookings ?? []).filter((b) => b.status === "CONFIRMED");

  if (active.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-700">You have no upcoming bookings.</p>
        <Link href="/" className="mt-2 inline-block text-sm font-medium text-gray-900 hover:underline">
          Discover classes →
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4" data-testid="my-bookings-list">
      {active.map((b) => (
        <li
          key={b.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-4"
        >
          <div>
            <Link href={`/class/${b.class.id}`} className="font-medium text-gray-900 hover:underline">
              {b.class.title}
            </Link>
            <p className="text-sm text-gray-500">
              {SPORT_TYPE_LABELS[b.class.sportType as SportType]} · {b.class.location.name}
              {b.class.location.city ? `, ${b.class.location.city}` : ""}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(b.class.startTime).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => cancel.mutate({ bookingId: b.id })}
            disabled={cancel.isPending}
            className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            data-testid={`cancel-booking-${b.id}`}
          >
            Cancel booking
          </button>
        </li>
      ))}
    </ul>
  );
}

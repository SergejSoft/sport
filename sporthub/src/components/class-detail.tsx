"use client";

import Link from "next/link";
import { getSportVisual } from "@/lib/sport-visual-tokens";
import { SportCardImage } from "@/components/sport-card-image";

type ClassWithRelations = {
  id: string;
  title: string;
  description: string | null;
  sportType: string;
  startTime: Date | string;
  endTime: Date | string;
  capacity: number;
  priceCents: number | null;
  location: { name: string; address: string; city: string; postalCode: string | null };
  organiser: {
    account: { id: string; name: string | null; email: string };
    organisation: { name: string };
  };
  bookings?: { id: string }[];
};

export function ClassDetail({
  class: c,
  currentUserId,
}: {
  class: ClassWithRelations;
  currentUserId: string | null;
}) {
  const start = typeof c.startTime === "string" ? new Date(c.startTime) : c.startTime;
  const end = typeof c.endTime === "string" ? new Date(c.endTime) : c.endTime;
  const bookedCount = c.bookings?.length ?? 0;
  const spotsLeft = Math.max(0, c.capacity - bookedCount);
  const token = getSportVisual(c.sportType);

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="aspect-[16/10] w-full bg-gray-100">
        <SportCardImage
          sportType={c.sportType}
          classImageUrl={null}
          alt=""
          className="h-full w-full"
        />
      </div>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900" data-testid="class-detail-title">
          {c.title}
        </h1>
        <p className="mt-1 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${token.bgClass} ${token.textClass} ${token.borderClass} border`}
          >
            {token.label}
          </span>
          <span className="text-sm text-gray-500">{c.organiser.organisation.name}</span>
        </p>
      {c.description && (
        <p className="mt-4 text-gray-700">{c.description}</p>
      )}
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-medium text-gray-500">When</dt>
          <dd>{start.toLocaleString()} – {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Where</dt>
          <dd>
            {c.location.name}<br />
            {c.location.address}, {c.location.city}
            {c.location.postalCode ? ` ${c.location.postalCode}` : ""}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Capacity</dt>
          <dd>{c.capacity} spots · {spotsLeft} available</dd>
        </div>
        {c.priceCents != null && c.priceCents > 0 && (
          <div>
            <dt className="font-medium text-gray-500">Price</dt>
            <dd>€{Math.round(c.priceCents / 100)}</dd>
          </div>
        )}
      </dl>
      <div className="mt-6">
        {currentUserId ? (
          spotsLeft > 0 ? (
            <Link
              href={`/class/${c.id}/book`}
              className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              data-testid="class-detail-book-cta"
            >
              Book this class
            </Link>
          ) : (
            <p className="text-sm text-gray-500">Fully booked</p>
          )
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(`/class/${c.id}`)}`}
            className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            data-testid="class-detail-signin-to-book"
          >
            Sign in to book
          </Link>
        )}
      </div>
      </div>
    </article>
  );
}

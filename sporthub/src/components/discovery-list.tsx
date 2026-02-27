"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { getSportVisual } from "@/lib/sport-visual-tokens";
import { SportCardImage } from "@/components/sport-card-image";

export function DiscoveryList() {
  const { data, isLoading, error } = trpc.discovery.listClasses.useQuery(
    { limit: 50 }
  );

  if (isLoading) {
    return (
      <p className="text-sm text-gray-500" data-testid="discovery-loading">
        Loading…
      </p>
    );
  }
  if (error) {
    return (
      <p className="text-sm text-red-600" data-testid="discovery-error" role="alert">
        Failed to load classes. Please try again.
      </p>
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center"
        data-testid="discovery-empty"
      >
        <h2 className="text-lg font-medium text-gray-900">No classes in your area yet</h2>
        <p className="mt-1 text-sm text-gray-600">
          Be the first to list your club or request a class.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/become-organiser"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            data-testid="discovery-cta-become-organiser"
          >
            Become an organiser
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="discovery-class-list"
    >
      {items.map((c) => {
        const bookedCount = (c as { bookings?: { id: string }[] }).bookings?.length ?? 0;
        const spotsLeft = Math.max(0, c.capacity - bookedCount);
        const token = getSportVisual(c.sportType);
        return (
          <li key={c.id}>
            <Link
              href={`/class/${c.id}`}
              className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow"
              data-testid={`discovery-class-${c.id}`}
            >
              <div className="aspect-[16/10] w-full bg-gray-100">
                <SportCardImage
                  sportType={c.sportType}
                  classImageUrl={null}
                  alt=""
                  className="h-full w-full"
                />
              </div>
              <div className="p-4">
                <span className="font-medium text-gray-900">{c.title}</span>
                <span
                  className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${token.bgClass} ${token.textClass} ${token.borderClass} border`}
                >
                  {token.label}
                </span>
                <p className="mt-1 text-sm text-gray-600">
                  {c.location.name}
                  {c.location.city ? ` · ${c.location.city}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {new Date(c.startTime).toLocaleString()}
                  {c.priceCents != null && c.priceCents > 0 && (
                    <span> · €{Math.round(c.priceCents / 100)}</span>
                  )}
                  <span> · {spotsLeft} available</span>
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";

export function OrganiserDashboard() {
  const { data: clubs, isLoading, error } = trpc.organiser.getMyClubs.useQuery();

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Failed to load. Please try again.
      </p>
    );
  }
  if (!clubs?.length) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">You don&apos;t have a club yet.</p>
        <Link
          href="/become-organiser"
          className="mt-2 inline-block text-sm font-medium text-amber-900 underline hover:no-underline"
        >
          Request to become an organiser →
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {clubs.map((club) => (
        <li
          key={club.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900">{club.name}</h2>
          {club.description && (
            <p className="mt-1 text-sm text-gray-600">{club.description}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            {club.locationCount} location{club.locationCount !== 1 ? "s" : ""} · {club.classCount} class
            {club.classCount !== 1 ? "es" : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href={`/organiser/locations?org=${club.id}`}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              Locations →
            </Link>
            <Link
              href={`/organiser/classes?org=${club.id}`}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              Classes →
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

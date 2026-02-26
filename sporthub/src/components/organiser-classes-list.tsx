"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { SPORT_TYPE_LABELS } from "@/lib/sport-types";
import type { SportType } from "@prisma/client";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export function OrganiserClassesList({ organisationId }: { organisationId: string }) {
  const { data: classes, isLoading } = trpc.organiser.listMyClasses.useQuery({
    organisationId,
  });
  const utils = trpc.useUtils();
  const cancel = trpc.organiser.cancelClass.useMutation({
    onSuccess: () => utils.organiser.listMyClasses.invalidate(),
  });

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/organiser/classes/new?org=${organisationId}`}
          className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New class
        </Link>
        <Link
          href={`/organiser/bookings?org=${organisationId}`}
          className="inline-block rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Bookings overview
        </Link>
      </div>

      {!classes?.length ? (
        <p className="text-sm text-gray-500">No classes yet. Create one to get started.</p>
      ) : (
        <ul className="space-y-3">
          {classes.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div>
                <span className="font-medium text-gray-900">{c.title}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {SPORT_TYPE_LABELS[c.sportType as SportType]} · {c.location.name}
                  {c.location.city ? `, ${c.location.city}` : ""}
                </span>
                <p className="mt-0.5 text-xs text-gray-500">
                  {new Date(c.startTime).toLocaleString()} · {STATUS_LABELS[c.status] ?? c.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/organiser/classes/${c.id}/edit`}
                  className="text-sm font-medium text-gray-900 hover:underline"
                >
                  Edit
                </Link>
                {(c.status === "DRAFT" || c.status === "PUBLISHED") && (
                  <button
                    type="button"
                    onClick={() => cancel.mutate({ id: c.id })}
                    disabled={cancel.isPending}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Cancel class
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

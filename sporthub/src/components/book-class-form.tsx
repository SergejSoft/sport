"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export function BookClassForm({
  classId,
  classTitle,
}: {
  classId: string;
  classTitle: string;
}) {
  const router = useRouter();
  const create = trpc.booking.create.useMutation({
    onSuccess: () => router.push("/bookings"),
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {create.isSuccess ? null : (
        <>
          <p className="text-sm text-gray-600">Confirm your booking for this class.</p>
          {create.isError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {create.error.message}
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => create.mutate({ classId })}
              disabled={create.isPending}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              data-testid="book-class-confirm"
            >
              {create.isPending ? "Booking…" : "Confirm booking"}
            </button>
            <Link
              href={`/class/${classId}`}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

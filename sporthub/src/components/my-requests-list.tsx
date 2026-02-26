"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Pending review",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function MyRequestsList() {
  const { data: applications, isLoading, error } = trpc.organiserApplication.getMyApplications.useQuery();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Failed to load requests. Please try again.
      </p>
    );
  }
  if (!applications?.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-700">You haven&apos;t submitted any organiser requests yet.</p>
        <Link
          href="/become-organiser"
          className="mt-2 inline-block text-sm font-medium text-gray-900 underline hover:no-underline"
        >
          Become an organiser →
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {applications.map((app) => (
        <li
          key={app.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-gray-900">{app.organisationName}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                app.status === "APPROVED"
                  ? "bg-green-100 text-green-800"
                  : app.status === "REJECTED"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {STATUS_LABELS[app.status] ?? app.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Submitted {new Date(app.createdAt).toLocaleDateString()}
            {app.reviewedAt && ` · Reviewed ${new Date(app.reviewedAt).toLocaleDateString()}`}
          </p>
          {app.status === "REJECTED" && app.rejectionReason && (
            <p className="mt-2 text-sm text-gray-600">{app.rejectionReason}</p>
          )}
          {app.status === "APPROVED" && (
            <Link
              href="/organiser"
              className="mt-2 inline-block text-sm font-medium text-green-700 hover:underline"
            >
              Go to Your club →
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

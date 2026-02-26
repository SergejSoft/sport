"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

type Filter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

export function AdminOrganiserRequests() {
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: applications, isLoading } = trpc.admin.listOrganiserApplications.useQuery({
    status: filter === "ALL" ? undefined : filter,
  });
  const utils = trpc.useUtils();
  const approve = trpc.admin.approveOrganiserApplication.useMutation({
    onSuccess: () => {
      utils.admin.listOrganiserApplications.invalidate();
    },
  });
  const reject = trpc.admin.rejectOrganiserApplication.useMutation({
    onSuccess: () => {
      setRejectingId(null);
      setRejectionReason("");
      utils.admin.listOrganiserApplications.invalidate();
    },
  });

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold">Organiser requests</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading…</p>
        ) : !applications?.length ? (
          <p className="p-4 text-sm text-gray-500">No applications in this filter.</p>
        ) : (
          <>
          {(approve.isError || reject.isError) && (
            <p className="mx-4 mt-2 text-sm text-red-600" role="alert">
              {approve.error?.message ?? reject.error?.message}
            </p>
          )}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Applicant
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Organisation
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="bg-white">
                  <td className="px-4 py-2 text-sm text-gray-900">{app.account.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{app.organisationName}</td>
                  <td className="max-w-xs truncate px-4 py-2 text-sm text-gray-500" title={app.description}>
                    {app.description}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
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
                  </td>
                  <td className="px-4 py-2 text-right">
                    {rejectingId === app.id ? (
                      <div className="flex flex-col items-end gap-2">
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Rejection reason (optional)"
                          className="w-48 rounded border border-gray-300 px-2 py-1 text-sm"
                          maxLength={500}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              reject.mutate({ applicationId: app.id, rejectionReason: rejectionReason || undefined });
                            }}
                            disabled={reject.isPending}
                            className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            Confirm reject
                          </button>
                          <button
                            type="button"
                            onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                            className="text-sm text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (app.status === "SUBMITTED" || app.status === "IN_REVIEW") ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => approve.mutate({ applicationId: app.id })}
                          disabled={approve.isPending}
                          className="text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingId(app.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}
      </div>
    </div>
  );
}

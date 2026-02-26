"use client";

import { trpc } from "@/lib/trpc";
import { SPORT_TYPE_LABELS } from "@/lib/sport-types";
import type { SportType } from "@prisma/client";

export function AdminDraftClasses() {
  const { data: classes, isLoading } = trpc.admin.listDraftClasses.useQuery();
  const utils = trpc.useUtils();
  const publish = trpc.admin.publishClass.useMutation({
    onSuccess: () => {
      utils.admin.listDraftClasses.invalidate();
    },
  });

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold">Draft classes</h2>
      <p className="mt-1 text-sm text-gray-500">
        Approve drafts to make them visible on the public site (status → Published).
      </p>
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading…</p>
        ) : !classes?.length ? (
          <p className="p-4 text-sm text-gray-500">No draft classes.</p>
        ) : (
          <>
            {publish.isError && (
              <p className="mx-4 mt-2 text-sm text-red-600" role="alert">
                {publish.error.message}
              </p>
            )}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Class
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Sport
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Organiser / Org
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Start
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.map((c) => (
                  <tr key={c.id} className="bg-white">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{c.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {SPORT_TYPE_LABELS[c.sportType as SportType] ?? c.sportType}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {c.organiser.account.email}
                      <span className="block text-xs text-gray-500">{c.organiser.organisation.name}</span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {c.location.name}
                      {c.location.city ? `, ${c.location.city}` : ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                      {new Date(c.startTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => publish.mutate({ classId: c.id })}
                        disabled={publish.isPending}
                        className="text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50"
                      >
                        Publish
                      </button>
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

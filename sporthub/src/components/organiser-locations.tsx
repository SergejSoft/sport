"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export function OrganiserLocations({ organisationId }: { organisationId: string }) {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = trpc.organiser.getOrgWithLocations.useQuery(
    { organisationId },
    { enabled: !!organisationId }
  );
  const utils = trpc.useUtils();
  const addLocation = trpc.organiser.addLocation.useMutation({
    onSuccess: () => {
      utils.organiser.getOrgWithLocations.invalidate({ organisationId });
      setShowForm(false);
      setForm({ name: "", address: "", city: "", postalCode: "", country: "DE" });
    },
  });

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "DE",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addLocation.mutate({
      organisationId,
      name: form.name,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode || undefined,
      country: form.country,
    });
  }

  if (isLoading || !data) return <p className="text-sm text-gray-500">Loading…</p>;

  const { organisation, myMemberId } = data;
  const locations = organisation.locations;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">{organisation.name}</h2>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add location
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 max-w-md space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <label htmlFor="loc-name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                id="loc-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. Main court"
              />
            </div>
            <div>
              <label htmlFor="loc-address" className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <input
                id="loc-address"
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Street and number"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="loc-city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  id="loc-city"
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="loc-postal" className="block text-sm font-medium text-gray-700">
                  Postal code
                </label>
                <input
                  id="loc-postal"
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            {addLocation.isError && (
              <p className="text-sm text-red-600">{addLocation.error.message}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addLocation.isPending}
                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {addLocation.isPending ? "Adding…" : "Add location"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {locations.length === 0 ? (
        <p className="text-sm text-gray-500">No locations yet. Add one above to create classes.</p>
      ) : (
        <ul className="space-y-2">
          {locations.map((loc) => (
            <li
              key={loc.id}
              className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
            >
              <span className="font-medium text-gray-900">{loc.name}</span>
              <span className="text-gray-500"> — {loc.address}, {loc.city}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-gray-500">
        <Link
          href={`/organiser/classes?org=${organisationId}`}
          className="font-medium text-gray-900 hover:underline"
        >
          Classes →
        </Link>
      </p>
    </div>
  );
}

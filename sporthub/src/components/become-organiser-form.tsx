"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export function BecomeOrganiserForm() {
  const { data: pending, isLoading: loadingPending } = trpc.organiserApplication.getPendingForAccount.useQuery();
  const utils = trpc.useUtils();
  const submit = trpc.organiserApplication.submitApplication.useMutation({
    onSuccess: () => {
      utils.organiserApplication.getPendingForAccount.invalidate();
      utils.organiserApplication.getMyApplications.invalidate();
      setSuccess(true);
    },
  });

  const [organisationName, setOrganisationName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: account } = trpc.account.getMe.useQuery();
  useEffect(() => {
    if (account?.email) setContactEmail(account.email);
  }, [account?.email]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit.mutate({
      organisationName: organisationName.trim(),
      description: description.trim(),
      contactEmail: contactEmail.trim(),
      website: website.trim() || undefined,
      city: city.trim() || undefined,
    });
  }

  if (loadingPending) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  if (pending) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="font-medium text-amber-900">You already have a pending request.</p>
        <p className="mt-1 text-sm text-amber-800">
          We&apos;ll review it shortly. You can check the status in My requests.
        </p>
        <Link
          href="/my-requests"
          className="mt-3 inline-block text-sm font-medium text-amber-900 underline hover:no-underline"
        >
          View status →
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="font-medium text-green-900">Request received.</p>
        <p className="mt-1 text-sm text-green-800">We&apos;ll review it shortly.</p>
        <Link
          href="/my-requests"
          className="mt-3 inline-block text-sm font-medium text-green-900 underline hover:no-underline"
        >
          View status in My requests →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="organisationName" className="block text-sm font-medium text-gray-700">
          Organisation name <span className="text-red-600">*</span>
        </label>
        <input
          id="organisationName"
          type="text"
          value={organisationName}
          onChange={(e) => setOrganisationName(e.target.value)}
          required
          maxLength={200}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="e.g. City Padel Club"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Short description <span className="text-red-600">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={2000}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="What your club or organisation offers"
        />
        <p className="mt-0.5 text-xs text-gray-500">{description.length}/2000</p>
      </div>
      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
          Contact email <span className="text-red-600">*</span>
        </label>
        <input
          id="contactEmail"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Website (optional)
        </label>
        <input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          City (optional)
        </label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          maxLength={100}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="e.g. Berlin"
        />
      </div>

      {submit.isError && (
        <p className="text-sm text-red-600" role="alert">
          {submit.error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={submit.isPending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {submit.isPending ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

const GENDER_OPTIONS = [
  { value: "", label: "—" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

export function AccountForm() {
  const { data: account, isLoading, error } = trpc.account.getMe.useQuery();
  const utils = trpc.useUtils();
  const updateMe = trpc.account.updateMe.useMutation({
    onSuccess: () => {
      utils.account.getMe.invalidate();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (account) {
      setName(account.name ?? "");
      setSurname(account.surname ?? "");
      setPhone(account.phone ?? "");
      setGender(account.gender ?? "");
    }
  }, [account]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMe.mutate({
      name: name.trim(),
      surname: surname.trim(),
      phone: phone.trim(),
      gender: gender.trim(),
    });
  }

  if (isLoading) {
    return (
      <p className="text-sm text-gray-500">Loading your account…</p>
    );
  }
  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Failed to load account. Please try again.
      </p>
    );
  }
  if (!account) {
    return null;
  }

  return (
    <div className="space-y-6">
      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="font-medium text-gray-500">Email</dt>
          <dd className="text-gray-900">{account.email}</dd>
          <p className="mt-0.5 text-xs text-gray-500">Email cannot be changed here.</p>
        </div>
      </dl>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name (optional)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            autoComplete="given-name"
          />
        </div>
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
            Surname (optional)
          </label>
          <input
            id="surname"
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            autoComplete="family-name"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone number (optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender (optional)
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt.value || "empty"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {updateMe.isError && (
          <p className="text-sm text-red-600" role="alert">
            {updateMe.error.message}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600" role="status">
            Saved.
          </p>
        )}

        <button
          type="submit"
          disabled={updateMe.isPending}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {updateMe.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>

      <p className="text-sm text-gray-500">
        <Link href="/" className="font-medium text-gray-900 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}

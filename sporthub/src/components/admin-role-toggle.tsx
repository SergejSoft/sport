"use client";

import { useState } from "react";
import { setPlatformAdmin } from "@/app/actions/set-platform-admin";

export function AdminRoleToggle({
  accountId,
  currentAdmin,
  isSelf,
}: {
  accountId: string;
  currentAdmin: boolean;
  isSelf: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(currentAdmin);

  async function handleToggle() {
    setLoading(true);
    const res = await setPlatformAdmin(accountId, !admin);
    setLoading(false);
    if (res.ok) setAdmin(!admin);
  }

  if (isSelf) {
    return (
      <span className="text-sm text-gray-500">
        {admin ? "Yes (you)" : "—"}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className="text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
    >
      {loading ? "…" : admin ? "Remove admin" : "Make admin"}
    </button>
  );
}

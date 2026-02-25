"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "@/app/actions/send-password-reset";

export function AdminSendReset({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleClick() {
    setResult(null);
    setLoading(true);
    const res = await sendPasswordResetEmail(email);
    setLoading(false);
    setResult(res.ok ? { ok: true, message: res.message } : { ok: false, message: res.error });
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send reset"}
      </button>
      {result && (
        <span className={`text-xs ${result.ok ? "text-green-600" : "text-red-600"}`} role="status">
          {result.message}
        </span>
      )}
    </span>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/update-password`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-sm text-gray-600">
            We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
          </p>
          <p className="text-sm text-gray-500">
            Didn’t get it? Check spam or{" "}
            <Link href="/forgot-password" className="font-medium text-gray-900 hover:underline">
              try again
            </Link>
            .
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="text-sm text-gray-600">
          Enter your email and we’ll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              autoComplete="email"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="font-medium text-gray-900 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

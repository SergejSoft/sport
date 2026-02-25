"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * When the user lands with ?code= (e.g. from email confirmation link),
 * exchange the code for a session and remove the code from the URL.
 */
export function AuthCodeExchange() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) return;
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(() => {
      const next = searchParams.get("next") ?? "/";
      router.replace(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when code is present
  }, [code]);

  return null;
}

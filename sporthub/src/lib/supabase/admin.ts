import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side only. Use for admin actions (e.g. generate password reset link).
 * Requires SUPABASE_SERVICE_ROLE_KEY in env. Never expose this client to the browser.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) required for admin client");
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

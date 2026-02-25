import type { User } from "@supabase/supabase-js";
import type { Account } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Get or create an Account from the Supabase auth user.
 * Uses Supabase user.id as Account.id for 1:1 linking.
 */
export async function getOrCreateAccount(supabaseUser: User): Promise<Account> {
  const existing = await prisma.account.findUnique({
    where: { id: supabaseUser.id },
  });
  if (existing) return existing;

  return prisma.account.create({
    data: {
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      name: supabaseUser.user_metadata?.name ?? supabaseUser.user_metadata?.full_name ?? null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
      isPlatformAdmin: false,
    },
  });
}

export const IMPERSONATE_COOKIE_NAME = "sporthub_impersonate";

export function getImpersonateCookieFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${IMPERSONATE_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1].trim()) : null;
}

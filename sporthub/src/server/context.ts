import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount, getImpersonateCookieFromRequest } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";

export type Context = {
  userId: string | null;
  realUserId: string | null;
  isPlatformAdmin: boolean;
  isImpersonating: boolean;
};

export async function createContext(opts: FetchCreateContextFnOptions): Promise<Context> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      realUserId: null,
      isPlatformAdmin: false,
      isImpersonating: false,
    };
  }

  const account = await getOrCreateAccount(user);
  const impersonateId = getImpersonateCookieFromRequest(opts.req);
  // Only use impersonation if cookie targets an existing account (avoid stale/invalid cookie)
  const impersonateTarget =
    account.isPlatformAdmin && impersonateId && impersonateId !== account.id
      ? await prisma.account.findUnique({ where: { id: impersonateId }, select: { id: true } })
      : null;
  const effectiveUserId = impersonateTarget ? impersonateTarget.id : account.id;
  const isImpersonating = Boolean(impersonateTarget);

  return {
    userId: effectiveUserId,
    realUserId: account.id,
    isPlatformAdmin: account.isPlatformAdmin,
    isImpersonating,
  };
}

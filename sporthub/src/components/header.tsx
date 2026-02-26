import Link from "next/link";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount, IMPERSONATE_COOKIE_NAME } from "@/lib/auth-account";
import { getAccountTypes } from "@/lib/user-types";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/actions/auth";
import { stopImpersonation } from "@/app/actions/impersonation";

export async function Header() {
  let user: User | null = null;
  let account: Awaited<ReturnType<typeof getOrCreateAccount>> | null = null;
  let userTypes: Awaited<ReturnType<typeof getAccountTypes>> | null = null;
  let impersonatingAccount: { id: string; email: string } | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;

    if (user) {
      account = await getOrCreateAccount(user);
      userTypes = await getAccountTypes(account.id);
      const cookieStore = await cookies();
      const impersonateId = cookieStore.get(IMPERSONATE_COOKIE_NAME)?.value;
      if (impersonateId && account.isPlatformAdmin) {
        const target = await prisma.account.findUnique({
          where: { id: impersonateId },
          select: { id: true, email: true },
        });
        if (target) impersonatingAccount = target;
      }
    }
  } catch {
    // DB or Supabase unreachable: show unauthenticated header so the app still renders
    user = null;
    account = null;
    userTypes = null;
    impersonatingAccount = null;
  }

  return (
    <>
      {impersonatingAccount && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <span className="text-sm text-amber-900">
              Impersonating <strong>{impersonatingAccount.email}</strong>
            </span>
            <form action={stopImpersonation}>
              <button
                type="submit"
                className="text-sm font-medium text-amber-900 underline hover:no-underline"
              >
                Stop impersonating
              </button>
            </form>
          </div>
        </div>
      )}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold">
            SportHub
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {account?.isPlatformAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/account"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Account
                </Link>
                <Link
                  href="/update-password"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Password
                </Link>
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  {impersonatingAccount ? impersonatingAccount.email : user.email}
                  <span className="text-gray-500">
                    ({userTypes?.label ?? "Participant"})
                  </span>
                </span>
                <form action={logout} className="inline">
                  <button
                    type="submit"
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

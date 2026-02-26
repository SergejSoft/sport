import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";
import { startImpersonation } from "@/app/actions/impersonation";
import { AdminSendReset } from "@/components/admin-send-reset";
import { AdminRoleToggle } from "@/components/admin-role-toggle";
import { AdminOrganiserRequests } from "@/components/admin-organiser-requests";
import { AdminDraftClasses } from "@/components/admin-draft-classes";
import type { UserType } from "@/lib/user-types";

function getRoleLabel(
  isPlatformAdmin: boolean,
  memberships: { role: string }[]
): UserType {
  if (isPlatformAdmin) return "Admin";
  const isClubOwner = memberships.some(
    (m) => m.role === "OWNER" || m.role === "ADMIN"
  );
  if (isClubOwner) return "Club owner";
  return "Participant";
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const account = await getOrCreateAccount(user);
  if (!account.isPlatformAdmin) redirect("/");

  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      phone: true,
      isPlatformAdmin: true,
      createdAt: true,
      orgMemberships: { select: { role: true } },
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const supabaseUsersUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/auth/users`
    : null;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Admin — Users</h1>
          <div className="flex items-center gap-4">
            {supabaseUsersUrl && (
              <a
                href={supabaseUsersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Manage in Supabase →
              </a>
            )}
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Back to home
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Admin
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.map((a) => {
                const role = getRoleLabel(a.isPlatformAdmin, a.orgMemberships);
                return (
                  <tr key={a.id} className="bg-white">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{a.email}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {[a.name, a.surname].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{a.phone ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      <span
                        className={
                          role === "Admin"
                            ? "rounded bg-violet-100 px-1.5 py-0.5 text-violet-800"
                            : role === "Club owner"
                              ? "rounded bg-sky-100 px-1.5 py-0.5 text-sky-800"
                              : "text-gray-500"
                        }
                      >
                        {role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <AdminRoleToggle
                        accountId={a.id}
                        currentAdmin={a.isPlatformAdmin}
                        isSelf={a.id === account.id}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <AdminSendReset email={a.email} />
                        {a.id !== account.id && (
                          <form action={startImpersonation} className="inline">
                            <input type="hidden" name="accountId" value={a.id} />
                            <button
                              type="submit"
                              className="font-medium text-gray-700 hover:text-gray-900"
                            >
                              Impersonate
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <AdminOrganiserRequests />
        <AdminDraftClasses />
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";
import { startImpersonation } from "@/app/actions/impersonation";

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
    select: { id: true, email: true, name: true, isPlatformAdmin: true, createdAt: true },
  });

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin — Users</h1>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            Back to home
          </Link>
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
                  Admin
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.map((a) => (
                <tr key={a.id} className="bg-white">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{a.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{a.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {a.isPlatformAdmin ? "Yes" : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

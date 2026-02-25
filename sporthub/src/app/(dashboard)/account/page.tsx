import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { AccountForm } from "@/components/account-form";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await getOrCreateAccount(user);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="mt-1 text-sm text-gray-600">
        View and edit your profile. All fields below are optional.
      </p>
      <div className="mt-6">
        <AccountForm />
      </div>
      <div className="mt-6 border-t border-gray-200 pt-4">
        <Link
          href="/update-password"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Change password →
        </Link>
      </div>
    </main>
  );
}

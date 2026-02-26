import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { BecomeOrganiserForm } from "@/components/become-organiser-form";

export default async function BecomeOrganiserPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    await getOrCreateAccount(user);
  } catch {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Become an organiser</h1>
      <p className="mt-1 text-sm text-gray-600">
        Request to list your club or organisation and create classes. We&apos;ll review your request and get back to you.
      </p>
      <div className="mt-6">
        <BecomeOrganiserForm />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        <Link href="/my-requests" className="font-medium text-gray-900 hover:underline">
          My requests →
        </Link>
      </p>
    </main>
  );
}

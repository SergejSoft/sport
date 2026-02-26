import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { MyRequestsList } from "@/components/my-requests-list";

export default async function MyRequestsPage() {
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
      <h1 className="text-2xl font-semibold">My requests</h1>
      <p className="mt-1 text-sm text-gray-600">
        Status of your &quot;Become organiser&quot; requests.
      </p>
      <div className="mt-6">
        <MyRequestsList />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        <Link href="/become-organiser" className="font-medium text-gray-900 hover:underline">
          Submit a new request →
        </Link>
      </p>
    </main>
  );
}

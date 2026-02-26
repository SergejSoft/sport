import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { MyBookingsList } from "@/components/my-bookings-list";

export default async function BookingsPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    await getOrCreateAccount(user);
  } catch {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">My bookings</h1>
      <p className="mt-1 text-sm text-gray-600">
        Classes you have booked. You can cancel up to the start time.
      </p>
      <div className="mt-6">
        <MyBookingsList />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        <Link href="/" className="font-medium text-gray-900 hover:underline">
          Discover more classes →
        </Link>
      </p>
    </main>
  );
}

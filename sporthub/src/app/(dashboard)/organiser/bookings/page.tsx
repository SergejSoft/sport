import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";
import { OrganiserBookingsOverview } from "@/components/organiser-bookings-overview";

export default async function OrganiserBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    await getOrCreateAccount(user);
    const params = await searchParams;
    const orgId = params.org;
    if (orgId) {
      const membership = await prisma.organisationMember.findFirst({
        where: { accountId: user.id, organisationId: orgId },
      });
      if (!membership) redirect("/organiser");
    }
  } catch {
    redirect("/login");
  }

  const params = await searchParams;
  const orgId = params.org ?? undefined;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Bookings overview</h1>
      <p className="mt-1 text-sm text-gray-600">
        Who booked your classes. Available spots update when participants cancel.
      </p>
      <div className="mt-6">
        <OrganiserBookingsOverview organisationId={orgId} />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        <Link href="/organiser" className="font-medium text-gray-900 hover:underline">
          ← Back to Your club
        </Link>
      </p>
    </main>
  );
}

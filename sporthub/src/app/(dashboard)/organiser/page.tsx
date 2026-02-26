import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";
import { OrganiserDashboard } from "@/components/organiser-dashboard";

export default async function OrganiserPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    await getOrCreateAccount(user);
    const memberships = await prisma.organisationMember.findMany({
      where: { accountId: user.id },
      select: { organisationId: true },
    });
    if (memberships.length === 0) {
      redirect("/become-organiser");
    }
  } catch {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Your club</h1>
      <p className="mt-1 text-sm text-gray-600">
        Manage locations and classes for your organisation.
      </p>
      <div className="mt-6">
        <OrganiserDashboard />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        <Link href="/" className="font-medium text-gray-900 hover:underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";
import { OrganiserClassesList } from "@/components/organiser-classes-list";

export default async function OrganiserClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  let orgId: string;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    await getOrCreateAccount(user);
    const params = await searchParams;
    const queryOrg = params.org;
    if (queryOrg) {
      const membership = await prisma.organisationMember.findFirst({
        where: { accountId: user.id, organisationId: queryOrg },
      });
      if (!membership) redirect("/organiser");
      orgId = queryOrg;
    } else {
      const first = await prisma.organisationMember.findFirst({
        where: { accountId: user.id },
        select: { organisationId: true },
      });
      if (!first) redirect("/organiser");
      orgId = first.organisationId;
    }
  } catch {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Classes</h1>
      <p className="mt-1 text-sm text-gray-600">
        Create and manage classes. New classes are saved as drafts; an admin will review them for publishing.
      </p>
      <div className="mt-6">
        <OrganiserClassesList organisationId={orgId} />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        <Link href="/organiser" className="font-medium text-gray-900 hover:underline">
          ← Back to Your club
        </Link>
      </p>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";
import { ClassForm } from "@/components/class-form";

export default async function NewClassPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    await getOrCreateAccount(user);
    const params = await searchParams;
    const orgId = params.org;
    if (!orgId) redirect("/organiser/classes");

    const membership = await prisma.organisationMember.findFirst({
      where: { accountId: user.id, organisationId: orgId },
    });
    if (!membership) redirect("/organiser");
  } catch {
    redirect("/login");
  }

  const params = await searchParams;
  const orgId = params.org ?? "";

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">New class</h1>
      <p className="mt-1 text-sm text-gray-600">
        Classes are saved as drafts. An admin will review them for publishing.
      </p>
      <div className="mt-6">
        <ClassForm organisationId={orgId} />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        <Link href={`/organiser/classes?org=${orgId}`} className="font-medium text-gray-900 hover:underline">
          ← Back to Classes
        </Link>
      </p>
    </main>
  );
}

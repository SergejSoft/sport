import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";
import { ClassDetail } from "@/components/class-detail";

export default async function ClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.class.findFirst({
    where: { id, status: "PUBLISHED" },
    include: {
      location: true,
      organiser: { include: { account: true, organisation: true } },
      bookings: { where: { status: "CONFIRMED" }, select: { id: true } },
    },
  });
  if (!c) notFound();

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await getOrCreateAccount(user);
      userId = user.id;
    }
  } catch {
    userId = null;
  }

  return (
    <main className="mx-auto max-w-2xl p-6" data-testid="class-detail-page">
      <p className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">← Discover</Link>
      </p>
      <ClassDetail class={c} currentUserId={userId} />
    </main>
  );
}

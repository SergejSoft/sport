import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";
import { BookClassForm } from "@/components/book-class-form";

export default async function BookClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: classId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/class/${classId}/book`)}`);

  await getOrCreateAccount(user);
  const c = await prisma.class.findFirst({
    where: { id: classId, status: "PUBLISHED" },
    include: {
      location: true,
      organiser: { include: { account: true, organisation: true } },
    },
  });
  if (!c) redirect("/");

  return (
    <main className="mx-auto max-w-2xl p-6" data-testid="book-class-page">
      <p className="mb-4 text-sm text-gray-500">
        <Link href={`/class/${classId}`} className="hover:underline">← Back to class</Link>
      </p>
      <h1 className="text-xl font-semibold">Book: {c.title}</h1>
      <p className="mt-1 text-sm text-gray-600">
        {c.location.name} · {new Date(c.startTime).toLocaleString()}
      </p>
      <div className="mt-6">
        <BookClassForm classId={classId} classTitle={c.title} />
      </div>
    </main>
  );
}

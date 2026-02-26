import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { ClassForm } from "@/components/class-form";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Edit class</h1>
      <p className="mt-1 text-sm text-gray-600">
        Changes are saved as draft. Only an admin can publish the class.
      </p>
      <div className="mt-6">
        <ClassForm classId={id} />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        <Link href="/organiser/classes" className="font-medium text-gray-900 hover:underline">
          ← Back to Classes
        </Link>
      </p>
    </main>
  );
}

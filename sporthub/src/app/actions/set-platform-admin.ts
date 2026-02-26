"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";

export type SetPlatformAdminResult =
  | { ok: true }
  | { ok: false; error: string };

export async function setPlatformAdmin(
  accountId: string,
  isPlatformAdmin: boolean
): Promise<SetPlatformAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const current = await getOrCreateAccount(user);
  if (!current.isPlatformAdmin) return { ok: false, error: "Forbidden" };

  if (accountId === current.id && !isPlatformAdmin) {
    return { ok: false, error: "You cannot remove your own admin flag." };
  }

  const target = await prisma.account.findUnique({ where: { id: accountId } });
  if (!target) return { ok: false, error: "User not found" };

  await prisma.account.update({
    where: { id: accountId },
    data: { isPlatformAdmin },
  });
  revalidatePath("/admin");
  return { ok: true };
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";
import { IMPERSONATE_COOKIE_NAME } from "@/lib/auth-account";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 8, // 8 hours
  path: "/",
};

export async function startImpersonation(formData: FormData): Promise<never> {
  const raw = formData.get("accountId");
  const targetAccountId = typeof raw === "string" ? raw : null;
  if (!targetAccountId) redirect("/admin");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const account = await getOrCreateAccount(user);
  if (!account.isPlatformAdmin) {
    redirect("/");
  }

  const target = await prisma.account.findUnique({
    where: { id: targetAccountId },
  });
  if (!target) {
    redirect("/admin");
  }

  await prisma.auditLog.create({
    data: {
      action: "impersonation.start",
      accountId: account.id,
      impersonatingId: target.id,
      targetType: "Account",
      targetId: target.id,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATE_COOKIE_NAME, targetAccountId, COOKIE_OPTIONS);
  redirect("/");
}

export async function stopImpersonation(): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const account = await getOrCreateAccount(user);
  const cookieStore = await cookies();
  const wasImpersonating = cookieStore.get(IMPERSONATE_COOKIE_NAME)?.value;

  cookieStore.delete(IMPERSONATE_COOKIE_NAME);

  if (wasImpersonating && account.isPlatformAdmin) {
    await prisma.auditLog.create({
      data: {
        action: "impersonation.stop",
        accountId: account.id,
        impersonatingId: wasImpersonating,
        targetType: "Account",
        targetId: wasImpersonating,
      },
    });
  }

  redirect("/");
}

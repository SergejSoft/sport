"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/auth-account";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export type SendResetResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/** Resend API error response shape (subset we use) */
interface ResendErrorBody {
  message?: string;
}

export async function sendPasswordResetEmail(userEmail: string): Promise<SendResetResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const account = await getOrCreateAccount(user);
  if (!account.isPlatformAdmin) return { ok: false, error: "Forbidden" };

  const target = await prisma.account.findFirst({
    where: { email: userEmail },
    select: { email: true },
  });
  if (!target) return { ok: false, error: "User not found" };

  try {
    const admin = createAdminClient();
    const origin =
      process.env.APP_ORIGIN ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
      process.env.NEXT_PUBLIC_APP_ORIGIN ??
      "http://localhost:3000";
    const redirectTo = `${origin}/auth/callback?next=/update-password`;
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: target.email,
      options: { redirectTo },
    });
    if (error) return { ok: false, error: error.message };
    const link = data?.properties?.action_link;
    if (!link) return { ok: false, error: "No link generated" };

    // Optional: send via Resend if configured
    const resendKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;
    if (resendKey && emailFrom) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [target.email],
            subject: "Reset your SportHub password",
            html: `<!DOCTYPE html><html><body><p>Click the link below to set a new password:</p><p><a href="${link}">Reset password</a></p><p>If you didn’t request this, ignore this email.</p></body></html>`,
          }),
        });
        if (!res.ok) {
          const body: ResendErrorBody = await res.json().catch((): ResendErrorBody => ({}));
          return { ok: false, error: body.message ?? "Failed to send email" };
        }
        return { ok: true, message: "Reset email sent" };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Failed to send email" };
      }
    }

    return { ok: true, message: "Reset link generated. Add RESEND_API_KEY and EMAIL_FROM to send it by email. Meanwhile use Supabase Dashboard → Authentication → Users to send reset." };
  } catch (e) {
    if (e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return { ok: false, error: "Admin reset not configured. Set SUPABASE_SERVICE_ROLE_KEY in env. Use Supabase Dashboard → Auth → Users to send reset." };
    }
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

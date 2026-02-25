import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  // #region agent log
  const errorParam = requestUrl.searchParams.get("error");
  const errorCode = requestUrl.searchParams.get("error_code");
  fetch("http://127.0.0.1:7531/ingest/01062b9c-97dd-469a-b284-d310050c7c07", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "2e534c" }, body: JSON.stringify({ sessionId: "2e534c", location: "auth/callback/route.ts:GET", message: "callback entry", data: { hasCode: !!code, errorParam, errorCode }, timestamp: Date.now(), hypothesisId: "C" }) }).catch(() => {});
  // #endregion

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

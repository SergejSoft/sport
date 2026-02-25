import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Redirect OAuth error params to login so we never render pages with them (avoids server exception on Vercel).
  const errorParam = request.nextUrl.searchParams.get("error");
  const errorCode = request.nextUrl.searchParams.get("error_code");
  const errorDescription = request.nextUrl.searchParams.get("error_description");
  if (errorParam || errorCode) {
    const message = errorDescription ?? errorParam ?? "Sign-in was cancelled or failed.";
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", message);
    return NextResponse.redirect(loginUrl);
  }

  // #region agent log
  const hasOAuthError = request.nextUrl.searchParams.has("error") || request.nextUrl.searchParams.has("error_code");
  fetch("http://127.0.0.1:7531/ingest/01062b9c-97dd-469a-b284-d310050c7c07", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "2e534c" }, body: JSON.stringify({ sessionId: "2e534c", location: "middleware.ts:updateSession", message: "middleware entry", data: { path: request.nextUrl.pathname, hasOAuthError, query: request.nextUrl.search }, timestamp: Date.now(), hypothesisId: "A" }) }).catch(() => {});
  // #endregion
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // #region agent log
  let getUserDone = false;
  let getUserErr: unknown = null;
  try {
    await supabase.auth.getUser();
    getUserDone = true;
  } catch (e) {
    getUserErr = e;
  }
  fetch("http://127.0.0.1:7531/ingest/01062b9c-97dd-469a-b284-d310050c7c07", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "2e534c" }, body: JSON.stringify({ sessionId: "2e534c", location: "middleware.ts:afterGetUser", message: "after getUser", data: { getUserDone, getUserErr: getUserErr != null ? String(getUserErr) : null }, timestamp: Date.now(), hypothesisId: "A" }) }).catch(() => {});
  if (getUserErr) throw getUserErr;
  // #endregion
  return response;
}

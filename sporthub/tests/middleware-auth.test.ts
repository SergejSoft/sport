import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

describe("middleware: OAuth error redirect scope", () => {
  it("redirects to /login when path is /auth/callback and error param present", async () => {
    const req = new NextRequest("http://localhost:3000/auth/callback?error=bad_oauth_state&error_code=42");
    const res = await updateSession(req);
    expect([302, 307]).toContain(res.status);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/login");
    expect(location).toContain("error=");
  });

  it("does not redirect when path is not /auth/callback even with error param", async () => {
    const req = new NextRequest("http://localhost:3000/api/foo?error=something&error_code=123");
    const res = await updateSession(req);
    const location = res.headers.get("location");
    expect(location).toBeNull();
  });

  it("does not redirect when path is / with error param (scoped to callback only)", async () => {
    const req = new NextRequest("http://localhost:3000/?error=bad_oauth_state");
    const res = await updateSession(req);
    const location = res.headers.get("location");
    expect(location).toBeNull();
  });
});

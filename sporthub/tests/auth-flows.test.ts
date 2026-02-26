import { describe, it, expect } from "vitest";
import {
  getImpersonateCookieFromRequest,
  IMPERSONATE_COOKIE_NAME,
} from "@/lib/auth-account";

describe("auth flows: impersonation cookie", () => {
  it("exports correct cookie name", () => {
    expect(IMPERSONATE_COOKIE_NAME).toBe("sporthub_impersonate");
  });

  it("returns null when no cookie header", () => {
    const req = new Request("https://example.com", {
      headers: {},
    });
    expect(getImpersonateCookieFromRequest(req)).toBeNull();
  });

  it("returns null when cookie header does not contain impersonate cookie", () => {
    const req = new Request("https://example.com", {
      headers: { cookie: "other=value; foo=bar" },
    });
    expect(getImpersonateCookieFromRequest(req)).toBeNull();
  });

  it("returns account id when cookie is present", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const req = new Request("https://example.com", {
      headers: { cookie: `${IMPERSONATE_COOKIE_NAME}=${id}` },
    });
    expect(getImpersonateCookieFromRequest(req)).toBe(id);
  });

  it("returns account id when cookie is among others", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const req = new Request("https://example.com", {
      headers: {
        cookie: `session=abc; ${IMPERSONATE_COOKIE_NAME}=${id}; other=xyz`,
      },
    });
    expect(getImpersonateCookieFromRequest(req)).toBe(id);
  });

  it("decodes URI-encoded cookie value", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const encoded = encodeURIComponent(id);
    const req = new Request("https://example.com", {
      headers: { cookie: `${IMPERSONATE_COOKIE_NAME}=${encoded}` },
    });
    expect(getImpersonateCookieFromRequest(req)).toBe(id);
  });

  it("trims whitespace around value", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const req = new Request("https://example.com", {
      headers: { cookie: `${IMPERSONATE_COOKIE_NAME}=  ${id}  ` },
    });
    expect(getImpersonateCookieFromRequest(req)).toBe(id);
  });

  it("returns null for similarly named cookie (exact key match)", () => {
    const req = new Request("https://example.com", {
      headers: { cookie: "sporthub_impersonate_other=550e8400-e29b-41d4-a716-446655440000" },
    });
    expect(getImpersonateCookieFromRequest(req)).toBeNull();
  });

  it("returns null when cookie value has malformed encoding", () => {
    const req = new Request("https://example.com", {
      headers: { cookie: `${IMPERSONATE_COOKIE_NAME}=%` },
    });
    expect(getImpersonateCookieFromRequest(req)).toBeNull();
  });

  it("returns empty string when cookie value is empty (no crash)", () => {
    const req = new Request("https://example.com", {
      headers: { cookie: `${IMPERSONATE_COOKIE_NAME}=` },
    });
    expect(getImpersonateCookieFromRequest(req)).toBe("");
  });

  it("handles value containing semicolon (exact key match, first value wins)", () => {
    const req = new Request("https://example.com", {
      headers: { cookie: `${IMPERSONATE_COOKIE_NAME}=id-with;semicolon; other=value` },
    });
    expect(getImpersonateCookieFromRequest(req)).toBe("id-with");
  });
});

describe("auth flows: auth callback redirect safety (behavior)", () => {
  it("callback route GET redirects to same-origin path, never external URL", async () => {
    const { GET } = await import("@/app/auth/callback/route");
    const origin = "http://localhost:3000";
    const req = new Request(`${origin}/auth/callback?next=//evil.example.com/path`);
    const res = await GET(req);
    expect(res.status).toBeGreaterThanOrEqual(302);
    expect(res.status).toBeLessThan(400);
    const location = res.headers.get("location") ?? "";
    expect(location).toMatch(new RegExp(`^${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?`));
    expect(location).not.toContain("evil.example.com");
    expect(location).toBe(`${origin}/`);
  });

  it("callback route GET with valid internal next redirects to that path", async () => {
    const { GET } = await import("@/app/auth/callback/route");
    const origin = "http://localhost:3000";
    const req = new Request(`${origin}/auth/callback?next=/account`);
    const res = await GET(req);
    const location = res.headers.get("location") ?? "";
    expect(location).toBe(`${origin}/account`);
  });

  it("callback route GET with no code and absolute URL in next falls back to /", async () => {
    const { GET } = await import("@/app/auth/callback/route");
    const origin = "https://app.sporthub.example";
    const req = new Request(`${origin}/auth/callback?next=https://evil.com`);
    const res = await GET(req);
    const location = res.headers.get("location") ?? "";
    expect(location).toBe(`${origin}/`);
  });
});

describe("auth flows: forgot-password and update-password routes", () => {
  it("forgot-password page module exists", async () => {
    const mod = await import("@/app/(auth)/forgot-password/page");
    expect(mod.default).toBeDefined();
  });

  it("update-password page module exists", async () => {
    const mod = await import("@/app/(dashboard)/update-password/page");
    expect(mod.default).toBeDefined();
  });
});

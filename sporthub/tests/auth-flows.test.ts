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
});

describe("auth flows: auth callback redirect", () => {
  it("auth callback route exists and can be imported", async () => {
    const mod = await import("@/app/auth/callback/route");
    expect(typeof mod.GET).toBe("function");
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

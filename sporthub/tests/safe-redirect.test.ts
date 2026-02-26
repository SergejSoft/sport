import { describe, it, expect } from "vitest";
import { sanitizeNextPath } from "@/lib/safe-redirect";

describe("safe-redirect: sanitizeNextPath", () => {
  it("returns / for empty or whitespace", () => {
    expect(sanitizeNextPath("")).toBe("/");
    expect(sanitizeNextPath("   ")).toBe("/");
    expect(sanitizeNextPath(null)).toBe("/");
    expect(sanitizeNextPath(undefined)).toBe("/");
  });

  it("allows internal paths", () => {
    expect(sanitizeNextPath("/")).toBe("/");
    expect(sanitizeNextPath("/account")).toBe("/account");
    expect(sanitizeNextPath("/update-password")).toBe("/update-password");
    expect(sanitizeNextPath("/admin")).toBe("/admin");
    expect(sanitizeNextPath("/foo/bar")).toBe("/foo/bar");
  });

  it("trims whitespace", () => {
    expect(sanitizeNextPath("  /account  ")).toBe("/account");
  });

  it("strips query string and returns path only", () => {
    expect(sanitizeNextPath("/account?foo=bar")).toBe("/account");
  });

  it("rejects protocol-relative URL", () => {
    expect(sanitizeNextPath("//evil.example.com")).toBe("/");
    expect(sanitizeNextPath("//evil.example.com/path")).toBe("/");
  });

  it("rejects absolute URL", () => {
    expect(sanitizeNextPath("https://evil.example.com")).toBe("/");
    expect(sanitizeNextPath("https://evil.example.com/path")).toBe("/");
    expect(sanitizeNextPath("javascript:alert(1)")).toBe("/");
  });

  it("rejects path with colon (protocol-like)", () => {
    expect(sanitizeNextPath("/path:with:colons")).toBe("/");
  });
});

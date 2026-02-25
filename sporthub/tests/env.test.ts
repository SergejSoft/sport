import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { assertServerEnv, getDatabaseUrl } from "@/lib/env";

describe("foundation: env", () => {
  const required = ["DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  let saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    required.forEach((key) => {
      saved[key] = process.env[key];
    });
  });

  afterEach(() => {
    required.forEach((key) => {
      if (saved[key] !== undefined) process.env[key] = saved[key];
      else delete process.env[key];
    });
  });

  it("assertServerEnv throws when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "key";
    expect(assertServerEnv).toThrow(/DATABASE_URL/);
  });

  it("assertServerEnv throws when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    process.env.DATABASE_URL = "postgresql://localhost/db";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "key";
    expect(assertServerEnv).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("assertServerEnv throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", () => {
    process.env.DATABASE_URL = "postgresql://localhost/db";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(assertServerEnv).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it("assertServerEnv does not throw when all required vars are set", () => {
    process.env.DATABASE_URL = "postgresql://localhost/db";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "key";
    expect(assertServerEnv).not.toThrow();
  });

  it("getDatabaseUrl throws when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    expect(getDatabaseUrl).toThrow(/DATABASE_URL/);
  });

  it("getDatabaseUrl returns non-empty string when set", () => {
    process.env.DATABASE_URL = "postgresql://localhost/db";
    const url = getDatabaseUrl();
    expect(url).toBe("postgresql://localhost/db");
  });
});

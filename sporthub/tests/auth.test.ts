import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("foundation: Supabase Auth env", () => {
  let savedUrl: string | undefined;
  let savedKey: string | undefined;

  beforeEach(() => {
    savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    savedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedKey;
  });

  it("createClient throws when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "key";
    const { createClient } = await import("@/lib/supabase/client");
    expect(createClient).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("createClient throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { createClient } = await import("@/lib/supabase/client");
    expect(createClient).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it("createClient returns a client when both vars are set", async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return; // skip when .env.local not loaded (e.g. CI without env)
    }
    const { createClient } = await import("@/lib/supabase/client");
    const client = createClient();
    expect(client).toBeDefined();
    expect(typeof client.auth.getSession).toBe("function");
  });
});

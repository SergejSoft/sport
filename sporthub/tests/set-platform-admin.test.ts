import { describe, it, expect, vi, beforeEach } from "vitest";

const meId = "current-admin-id-123";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: () =>
          Promise.resolve({
            data: { user: { id: meId } },
          }),
      },
    })
  ),
}));

vi.mock("@/lib/auth-account", () => ({
  getOrCreateAccount: vi.fn(() =>
    Promise.resolve({
      id: meId,
      isPlatformAdmin: true,
    })
  ),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn(() => {
  throw new Error("REDIRECT");
}) }));

describe("setPlatformAdmin: self-demotion guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when current admin tries to remove own admin flag", async () => {
    const { setPlatformAdmin } = await import("@/app/actions/set-platform-admin");
    const result = await setPlatformAdmin(meId, false);
    expect(result).toEqual({ ok: false, error: "You cannot remove your own admin flag." });
  });
});

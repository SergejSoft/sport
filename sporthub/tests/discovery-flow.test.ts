import { describe, it, expect, vi, beforeEach } from "vitest";

const mockContext = {
  userId: null,
  realUserId: null,
  isPlatformAdmin: false,
  isImpersonating: false,
};

vi.mock("@/server/context", () => ({
  createContext: vi.fn(() => Promise.resolve(mockContext)),
}));

describe("discovery flow: home page", () => {
  it("home page module exports a default function (server component)", async () => {
    const mod = await import("@/app/page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("discovery list component exists", async () => {
    const mod = await import("@/components/discovery-list");
    expect(mod.DiscoveryList).toBeDefined();
  });
});

describe("discovery flow: discovery API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET discovery.listClasses returns 200 and result with items array", async () => {
    const { GET } = await import("@/app/api/trpc/[trpc]/route");
    const inputEnc = encodeURIComponent(JSON.stringify({}));
    const url = `http://localhost:3000/api/trpc/discovery.listClasses?input=${inputEnc}&batch=1`;
    const res = await GET(new Request(url));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toBeDefined();
    const result = Array.isArray(data) ? data[0] : data;
    const payload = result?.result?.data?.json ?? result?.result?.data;
    expect(payload).toBeDefined();
    expect(Array.isArray(payload?.items)).toBe(true);
  });

  it("GET discovery.getClass returns null or error for non-existent class id", async () => {
    const { GET } = await import("@/app/api/trpc/[trpc]/route");
    const inputEnc = encodeURIComponent(JSON.stringify({ id: "00000000-0000-0000-0000-000000000000" }));
    const url = `http://localhost:3000/api/trpc/discovery.getClass?input=${inputEnc}&batch=1`;
    const res = await GET(new Request(url));
    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      const data = await res.json();
      const result = Array.isArray(data) ? data[0] : data;
      const payload = result?.result?.data?.json ?? result?.result?.data;
      expect(payload).toBeNull();
    }
  });
});

describe("discovery flow: class detail page", () => {
  it("class detail page module exists", async () => {
    const mod = await import("@/app/class/[id]/page");
    expect(mod.default).toBeDefined();
  });

  it("class detail component exists", async () => {
    const mod = await import("@/components/class-detail");
    expect(mod.ClassDetail).toBeDefined();
  });
});

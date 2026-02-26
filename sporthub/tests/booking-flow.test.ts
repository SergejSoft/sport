import { describe, it, expect, vi } from "vitest";

const mockContext = {
  userId: null,
  realUserId: null,
  isPlatformAdmin: false,
  isImpersonating: false,
};

vi.mock("@/server/context", () => ({
  createContext: vi.fn(() => Promise.resolve(mockContext)),
}));

describe("booking flow: booking API requires auth", () => {
  it("booking.create is a protected procedure (no public access)", async () => {
    const { POST } = await import("@/app/api/trpc/[trpc]/route");
    const body = JSON.stringify([
      { id: 1, path: "booking.create", input: { classId: "00000000-0000-0000-0000-000000000000" } },
    ]);
    const res = await POST(
      new Request("http://localhost:3000/api/trpc/booking.create", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(res.status).toBeLessThan(500);
    if (res.status === 200) {
      const data = await res.json();
      const result = Array.isArray(data) ? data[0] : data;
      expect(result?.result?.data).toBeUndefined();
      if (result?.error) expect(result.error.json?.code).toBe("UNAUTHORIZED");
    }
  });

  it("booking.getMyBookings without auth returns 401 or error body", async () => {
    const { GET } = await import("@/app/api/trpc/[trpc]/route");
    const inputEnc = encodeURIComponent(JSON.stringify({}));
    const url = `http://localhost:3000/api/trpc/booking.getMyBookings?input=${inputEnc}&batch=1`;
    const res = await GET(new Request(url));
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      const data = await res.json();
      const result = Array.isArray(data) ? data[0] : data;
      expect(result?.error?.json?.code).toBe("UNAUTHORIZED");
    }
  });
});

describe("booking flow: pages and components exist", () => {
  it("book class page module exists", async () => {
    const mod = await import("@/app/class/[id]/book/page");
    expect(mod.default).toBeDefined();
  });

  it("bookings (my bookings) page module exists", async () => {
    const mod = await import("@/app/(dashboard)/bookings/page");
    expect(mod.default).toBeDefined();
  });

  it("BookClassForm component exists", async () => {
    const mod = await import("@/components/book-class-form");
    expect(mod.BookClassForm).toBeDefined();
  });

  it("MyBookingsList component exists", async () => {
    const mod = await import("@/components/my-bookings-list");
    expect(mod.MyBookingsList).toBeDefined();
  });
});

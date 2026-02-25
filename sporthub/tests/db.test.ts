import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

describe("foundation: database connection", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("connects to the database", async () => {
    await expect(prisma.$queryRaw`SELECT 1`).resolves.toEqual([{ "?column?": 1 }]);
  });

  it("can access Account model (schema synced)", async () => {
    const count = await prisma.account.count();
    expect(typeof count).toBe("number");
  });
});

import { router, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const adminRouter = router({
  listAccounts: adminProcedure.query(async () => {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, isPlatformAdmin: true, createdAt: true },
    });
    return accounts;
  }),
});

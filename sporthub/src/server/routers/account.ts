import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

const updateAccountSchema = z.object({
  name: z.string().min(0).max(200).optional(),
  surname: z.string().min(0).max(200).optional(),
  phone: z.string().min(0).max(50).optional(),
  gender: z.string().min(0).max(50).optional(),
});

export const accountRouter = router({
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const id = ctx.realUserId ?? ctx.userId;
    const account = await prisma.account.findUnique({
      where: { id: id! },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        phone: true,
        gender: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    return account;
  }),

  updateMe: protectedProcedure
    .input(updateAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const id = ctx.realUserId ?? ctx.userId;
      const account = await prisma.account.update({
        where: { id: id! },
        data: {
          ...(input.name !== undefined && { name: input.name || null }),
          ...(input.surname !== undefined && { surname: input.surname || null }),
          ...(input.phone !== undefined && { phone: input.phone || null }),
          ...(input.gender !== undefined && { gender: input.gender || null }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          phone: true,
          gender: true,
          avatarUrl: true,
        },
      });
      return account;
    }),
});

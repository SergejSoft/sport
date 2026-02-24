import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { SportType } from "@prisma/client";

const sportTypeEnum = z.nativeEnum(SportType);

export const discoveryRouter = router({
  listClasses: publicProcedure
    .input(
      z
        .object({
          sportType: sportTypeEnum.optional(),
          from: z.date().optional(),
          to: z.date().optional(),
          city: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const where = {
        status: "PUBLISHED" as const,
        ...(input?.sportType && { sportType: input.sportType }),
        ...(input?.from && { startTime: { gte: input.from } }),
        ...(input?.to && { endTime: { lte: input.to } }),
        ...(input?.city && { location: { city: input.city } }),
      };
      const items = await prisma.class.findMany({
        where,
        take: (input?.limit ?? 20) + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { startTime: "asc" },
        include: {
          location: true,
          organiser: { include: { account: true, organisation: true } },
        },
      });
      let nextCursor: string | undefined;
      if (items.length > (input?.limit ?? 20)) {
        const next = items.pop();
        nextCursor = next?.id;
      }
      return { items, nextCursor };
    }),

  getClass: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const c = await prisma.class.findFirst({
      where: { id: input.id, status: "PUBLISHED" },
      include: {
        location: true,
        organiser: { include: { account: true, organisation: true } },
      },
    });
    return c;
  }),
});

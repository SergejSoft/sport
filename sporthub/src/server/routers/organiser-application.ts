import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { OrganiserApplicationStatus } from "@prisma/client";

const submitApplicationSchema = z.object({
  organisationName: z.string().min(1, "Organisation name is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  contactEmail: z.string().email("Invalid email"),
  website: z.union([z.string().url(), z.literal("")]).optional(),
  city: z.string().max(100).optional(),
});

export const organiserApplicationRouter = router({
  submitApplication: protectedProcedure
    .input(submitApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const accountId = ctx.userId!;

      const pending = await prisma.organiserApplication.findFirst({
        where: {
          accountId,
          status: { in: [OrganiserApplicationStatus.SUBMITTED, OrganiserApplicationStatus.IN_REVIEW] },
        },
      });

      if (pending) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a pending request. View status in My requests.",
        });
      }

      const application = await prisma.organiserApplication.create({
        data: {
          accountId,
          organisationName: input.organisationName.trim(),
          description: input.description.trim(),
          contactEmail: input.contactEmail.trim().toLowerCase(),
          website: input.website?.trim() || null,
          city: input.city?.trim() || null,
          status: OrganiserApplicationStatus.SUBMITTED,
        },
      });

      return application;
    }),

  getMyApplications: protectedProcedure.query(async ({ ctx }) => {
    const accountId = ctx.userId!;
    return prisma.organiserApplication.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        organisationName: true,
        status: true,
        reviewedAt: true,
        rejectionReason: true,
        createdAt: true,
      },
    });
  }),

  getPendingForAccount: protectedProcedure.query(async ({ ctx }) => {
    const accountId = ctx.userId!;
    return prisma.organiserApplication.findFirst({
      where: {
        accountId,
        status: { in: [OrganiserApplicationStatus.SUBMITTED, OrganiserApplicationStatus.IN_REVIEW] },
      },
    });
  }),
});

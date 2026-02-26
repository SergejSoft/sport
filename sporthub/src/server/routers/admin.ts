import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { OrganiserApplicationStatus, ClassStatus } from "@prisma/client";

export const adminRouter = router({
  listAccounts: adminProcedure.query(async () => {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, isPlatformAdmin: true, createdAt: true },
    });
    return accounts;
  }),

  listOrganiserApplications: adminProcedure
    .input(
      z
        .object({
          status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const statusFilter =
        input?.status === "PENDING"
          ? { in: [OrganiserApplicationStatus.SUBMITTED, OrganiserApplicationStatus.IN_REVIEW] as const }
          : input?.status === "APPROVED"
            ? OrganiserApplicationStatus.APPROVED
            : input?.status === "REJECTED"
              ? OrganiserApplicationStatus.REJECTED
              : undefined;

      const applications = await prisma.organiserApplication.findMany({
        where: statusFilter ? { status: statusFilter } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          account: { select: { id: true, email: true } },
        },
      });
      return applications;
    }),

  approveOrganiserApplication: adminProcedure
    .input(z.object({ applicationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const application = await prisma.organiserApplication.findUnique({
        where: { id: input.applicationId },
      });
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }
      if (application.status !== OrganiserApplicationStatus.SUBMITTED && application.status !== OrganiserApplicationStatus.IN_REVIEW) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Application is not pending" });
      }

      const organisation = await prisma.organisation.create({
        data: {
          name: application.organisationName,
          description: application.description,
        },
      });

      const orgMember = await prisma.organisationMember.create({
        data: {
          accountId: application.accountId,
          organisationId: organisation.id,
          role: "OWNER",
        },
      });

      await prisma.$transaction([
        prisma.organiserApplication.update({
          where: { id: input.applicationId },
          data: {
            status: OrganiserApplicationStatus.APPROVED,
            reviewedById: ctx.userId!,
            reviewedAt: new Date(),
          },
        }),
        prisma.auditLog.create({
          data: {
            action: "organiser_application_approved",
            accountId: ctx.realUserId ?? ctx.userId!,
            targetType: "OrganiserApplication",
            targetId: input.applicationId,
            metadata: {
              applicantId: application.accountId,
              organisationId: organisation.id,
              ...(ctx.realUserId !== ctx.userId && { effectiveUserId: ctx.userId }),
            },
          },
        }),
      ]);

      return { organisation, organisationMember: orgMember };
    }),

  rejectOrganiserApplication: adminProcedure
    .input(
      z.object({
        applicationId: z.string().uuid(),
        rejectionReason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const application = await prisma.organiserApplication.findUnique({
        where: { id: input.applicationId },
      });
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }
      if (application.status !== OrganiserApplicationStatus.SUBMITTED && application.status !== OrganiserApplicationStatus.IN_REVIEW) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Application is not pending" });
      }

      await prisma.$transaction([
        prisma.organiserApplication.update({
          where: { id: input.applicationId },
          data: {
            status: OrganiserApplicationStatus.REJECTED,
            reviewedById: ctx.userId!,
            reviewedAt: new Date(),
            rejectionReason: input.rejectionReason?.trim() || null,
          },
        }),
        prisma.auditLog.create({
          data: {
            action: "organiser_application_rejected",
            accountId: ctx.realUserId ?? ctx.userId!,
            targetType: "OrganiserApplication",
            targetId: input.applicationId,
            metadata: {
              applicantId: application.accountId,
              ...(input.rejectionReason && { reason: input.rejectionReason }),
              ...(ctx.realUserId !== ctx.userId && { effectiveUserId: ctx.userId }),
            },
          },
        }),
      ]);

      return { ok: true };
    }),

  listDraftClasses: adminProcedure.query(async () => {
    return prisma.class.findMany({
      where: { status: ClassStatus.DRAFT },
      orderBy: { createdAt: "desc" },
      include: {
        location: { select: { id: true, name: true, city: true } },
        organiser: {
          include: {
            account: { select: { id: true, email: true } },
            organisation: { select: { name: true } },
          },
        },
      },
    });
  }),

  publishClass: adminProcedure
    .input(z.object({ classId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const c = await prisma.class.findUnique({
        where: { id: input.classId },
        include: { organiser: { include: { organisation: true } } },
      });
      if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "Class not found" });
      if (c.status !== ClassStatus.DRAFT) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only draft classes can be published" });
      }

      await prisma.$transaction([
        prisma.class.update({
          where: { id: input.classId },
          data: { status: ClassStatus.PUBLISHED },
        }),
        prisma.auditLog.create({
          data: {
            action: "class_published",
            accountId: ctx.realUserId ?? ctx.userId!,
            targetType: "Class",
            targetId: input.classId,
            metadata: {
              classTitle: c.title,
              organiserId: c.organiserId,
              organisationId: c.organiser.organisationId,
              ...(ctx.realUserId !== ctx.userId && { effectiveUserId: ctx.userId }),
            },
          },
        }),
      ]);

      return { ok: true };
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { SportType, ClassStatus } from "@prisma/client";

const sportTypeEnum = z.nativeEnum(SportType);

/** Get organisation IDs where the current user is a member (any role). */
async function getOrganiserOrgIds(accountId: string): Promise<string[]> {
  const memberships = await prisma.organisationMember.findMany({
    where: { accountId },
    select: { organisationId: true },
  });
  return memberships.map((m) => m.organisationId);
}

/** Get the OrganisationMember id for the current user in the given org. */
async function getOrganiserMemberId(accountId: string, organisationId: string): Promise<string | null> {
  const m = await prisma.organisationMember.findFirst({
    where: { accountId, organisationId },
    select: { id: true },
  });
  return m?.id ?? null;
}

export const organiserRouter = router({
  getMyClubs: protectedProcedure.query(async ({ ctx }) => {
    const accountId = ctx.userId!;
    const orgIds = await getOrganiserOrgIds(accountId);
    if (orgIds.length === 0) return [];

    const orgs = await prisma.organisation.findMany({
      where: { id: { in: orgIds } },
      include: {
        locations: { select: { id: true } },
        members: { where: { accountId }, select: { id: true, role: true } },
      },
    });

    const classCounts = await prisma.class.groupBy({
      by: ["organiserId"],
      where: {
        organiser: { accountId, organisationId: { in: orgIds } },
      },
      _count: true,
    });
    const memberIdsToOrgId = new Map<string, string>();
    for (const org of orgs) {
      for (const m of org.members) {
        memberIdsToOrgId.set(m.id, org.id);
      }
    }
    const countByOrgId = new Map<string, number>();
    for (const row of classCounts) {
      const orgId = memberIdsToOrgId.get(row.organiserId);
      if (orgId) countByOrgId.set(orgId, (countByOrgId.get(orgId) ?? 0) + row._count);
    }

    return orgs.map((org) => ({
      id: org.id,
      name: org.name,
      description: org.description,
      locationCount: org.locations.length,
      classCount: countByOrgId.get(org.id) ?? 0,
      myMemberId: org.members[0]?.id,
    }));
  }),

  getOrgWithLocations: protectedProcedure
    .input(z.object({ organisationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const memberId = await getOrganiserMemberId(ctx.userId!, input.organisationId);
      if (!memberId) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this organisation" });

      const org = await prisma.organisation.findUnique({
        where: { id: input.organisationId },
        include: { locations: true },
      });
      if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organisation not found" });
      return { organisation: org, myMemberId: memberId };
    }),

  addLocation: protectedProcedure
    .input(
      z.object({
        organisationId: z.string().uuid(),
        name: z.string().min(1).max(200),
        address: z.string().min(1).max(500),
        city: z.string().min(1).max(100),
        postalCode: z.string().max(20).optional(),
        country: z.string().max(2).default("DE"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const memberId = await getOrganiserMemberId(ctx.userId!, input.organisationId);
      if (!memberId) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this organisation" });

      return prisma.location.create({
        data: {
          organisationId: input.organisationId,
          name: input.name.trim(),
          address: input.address.trim(),
          city: input.city.trim(),
          postalCode: input.postalCode?.trim() || null,
          country: input.country.trim(),
        },
      });
    }),

  listMyClasses: protectedProcedure
    .input(
      z
        .object({
          organisationId: z.string().uuid().optional(),
          status: z.nativeEnum(ClassStatus).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const accountId = ctx.userId!;
      const orgIds = await getOrganiserOrgIds(accountId);
      if (orgIds.length === 0) return [];

      const where = {
        organiser: { accountId, organisationId: input?.organisationId ? { in: [input.organisationId] } : { in: orgIds } },
        ...(input?.status && { status: input.status }),
      };

      return prisma.class.findMany({
        where,
        orderBy: { startTime: "desc" },
        include: {
          location: { select: { id: true, name: true, city: true } },
          organiser: { include: { organisation: { select: { name: true } } } },
        },
      });
    }),

  getClassesWithBookings: protectedProcedure
    .input(z.object({ organisationId: z.string().uuid().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const accountId = ctx.userId!;
      const orgIds = await getOrganiserOrgIds(accountId);
      if (orgIds.length === 0) return [];

      const where = {
        organiser: {
          accountId,
          organisationId: input?.organisationId ? { in: [input.organisationId] } : { in: orgIds },
        },
      };

      return prisma.class.findMany({
        where,
        orderBy: { startTime: "desc" },
        include: {
          location: { select: { name: true, city: true } },
          organiser: { include: { organisation: { select: { name: true } } } },
          bookings: {
            where: { status: "CONFIRMED" },
            include: { account: { select: { id: true, email: true, name: true, surname: true } } },
          },
        },
      });
    }),

  createClass: protectedProcedure
    .input(
      z.object({
        organisationId: z.string().uuid(),
        locationId: z.string().uuid(),
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        sportType: sportTypeEnum,
        startTime: z.date(),
        endTime: z.date(),
        capacity: z.number().int().min(1).max(1000),
        priceCents: z.number().int().min(0).optional(),
        paymentRequired: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const memberId = await getOrganiserMemberId(ctx.userId!, input.organisationId);
      if (!memberId) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this organisation" });

      const location = await prisma.location.findFirst({
        where: { id: input.locationId, organisationId: input.organisationId },
      });
      if (!location) throw new TRPCError({ code: "BAD_REQUEST", message: "Location not in this organisation" });

      if (input.endTime <= input.startTime) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "End time must be after start time" });
      }

      return prisma.class.create({
        data: {
          title: input.title.trim(),
          description: input.description?.trim() || null,
          sportType: input.sportType,
          startTime: input.startTime,
          endTime: input.endTime,
          capacity: input.capacity,
          priceCents: input.priceCents ?? null,
          paymentRequired: input.paymentRequired,
          status: ClassStatus.DRAFT,
          locationId: input.locationId,
          organiserId: memberId,
        },
      });
    }),

  getClassForEdit: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const accountId = ctx.userId!;
      const c = await prisma.class.findUnique({
        where: { id: input.id },
        include: {
          location: true,
          organiser: { include: { organisation: true } },
        },
      });
      if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "Class not found" });
      if (c.organiser.accountId !== accountId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own classes" });
      }
      return c;
    }),

  updateClass: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        locationId: z.string().uuid(),
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        sportType: sportTypeEnum,
        startTime: z.date(),
        endTime: z.date(),
        capacity: z.number().int().min(1).max(1000),
        priceCents: z.number().int().min(0).optional(),
        paymentRequired: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const accountId = ctx.userId!;
      const existing = await prisma.class.findUnique({
        where: { id: input.id },
        include: { organiser: true, location: true },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Class not found" });
      if (existing.organiser.accountId !== accountId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own classes" });
      }
      const location = await prisma.location.findFirst({
        where: { id: input.locationId, organisationId: existing.organiser.organisationId },
      });
      if (!location) throw new TRPCError({ code: "BAD_REQUEST", message: "Location not in your organisation" });
      if (input.endTime <= input.startTime) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "End time must be after start time" });
      }

      return prisma.class.update({
        where: { id: input.id },
        data: {
          title: input.title.trim(),
          description: input.description?.trim() || null,
          sportType: input.sportType,
          startTime: input.startTime,
          endTime: input.endTime,
          capacity: input.capacity,
          priceCents: input.priceCents ?? null,
          paymentRequired: input.paymentRequired,
          locationId: input.locationId,
        },
      });
    }),

  cancelClass: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const accountId = ctx.userId!;
      const existing = await prisma.class.findUnique({
        where: { id: input.id },
        include: { organiser: true },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Class not found" });
      if (existing.organiser.accountId !== accountId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only cancel your own classes" });
      }
      return prisma.class.update({
        where: { id: input.id },
        data: { status: ClassStatus.CANCELLED },
      });
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const bookingRouter = router({
  getMyBookings: protectedProcedure.query(async ({ ctx }) => {
    const accountId = ctx.userId!;
    return prisma.booking.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      include: {
        class: {
          include: {
            location: { select: { name: true, city: true } },
            organiser: { include: { organisation: { select: { name: true } } } },
          },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(z.object({ classId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const accountId = ctx.userId!;
      const c = await prisma.class.findFirst({
        where: { id: input.classId, status: "PUBLISHED" },
        include: { _count: { select: { bookings: true } } },
      });
      if (!c) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Class not found or not published" });
      }
      if (c._count.bookings >= c.capacity) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Class is full" });
      }
      const existing = await prisma.booking.findUnique({
        where: { accountId_classId: { accountId, classId: input.classId } },
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You are already booked for this class" });
      }
      return prisma.booking.create({
        data: { accountId, classId: input.classId },
        include: {
          class: {
            include: {
              location: { select: { name: true, city: true } },
              organiser: { include: { organisation: { select: { name: true } } } },
            },
          },
        },
      });
    }),

  cancel: protectedProcedure
    .input(z.object({ bookingId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const accountId = ctx.userId!;
      const b = await prisma.booking.findUnique({
        where: { id: input.bookingId },
      });
      if (!b) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      if (b.accountId !== accountId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only cancel your own bookings" });
      }
      return prisma.booking.update({
        where: { id: input.bookingId },
        data: { status: "CANCELLED" },
      });
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const featureRequestRouter = createTRPCRouter({
  createFeatureRequest: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user) {
        const { title, description } = input;
        return await ctx.prisma.featureRequest.create({
          data: {
            title,
            description,
            userId: ctx.session.user.id,
          },
        });
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to create a feature request",
      });
    }),

  getFeatureRequests: protectedProcedure
    .input(
      z.object({
        showApproved: z.boolean().nullish(),
        status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const featureRequests = await ctx.prisma.featureRequest.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          approved: {
            equals: input.showApproved ?? false,
          },
          status: {
            equals: input.status ?? "NOT_STARTED",
          },
        },
      });

      return featureRequests;
    }),

  approveFeatureRequest: protectedProcedure
    .input(
      z.object({
        featureRequestId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user?.role === "ADMIN") {
        return await ctx.prisma.featureRequest.update({
          where: {
            id: input.featureRequestId,
          },
          data: {
            approved: true,
          },
        });
      }
    }),
});

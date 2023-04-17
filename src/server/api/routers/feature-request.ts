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

  // Get all feature requests with cursor-based pagination
  // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
  getFeatureRequests: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        showApproved: z.boolean().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      /**
       * For pagination docs you can have a look here
       * @see https://trpc.io/docs/useInfiniteQuery
       * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
       */

      const limit = input.limit ?? 10;
      const { cursor } = input;

      const featureRequests = await ctx.prisma.featureRequest.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          approved: {
            equals: input.showApproved ?? false,
          }
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (featureRequests.length > limit) {
        // Remove the last item and use it as next cursor

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = featureRequests.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        featureRequests: featureRequests.reverse(),
        nextCursor,
      };
    }),

  approveFeatureRequest: protectedProcedure.input(z.object({
    featureRequestId: z.string(),
  })).mutation(async ({ ctx, input }) => {
    if (ctx.session.user?.role === "ADMIN") {
      return await ctx.prisma.featureRequest.update({
        where: {
          id: input.featureRequestId,
        },
        data: {
          approved: true,
        }
      })
    }
  }),
});

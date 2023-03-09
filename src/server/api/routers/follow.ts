import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const followRouter = createTRPCRouter({
  followUser: protectedProcedure
    .input(
      z.object({
        followerId: z.string(),
        followingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { followerId, followingId } = input;

      if (followerId === followingId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot follow yourself",
        });
      }

      const follow = await ctx.prisma.follows.create({
        data: {
          follower: {
            connect: {
              id: followerId,
            },
          },
          following: {
            connect: {
              id: followingId,
            },
          },
        },
      });

      return follow;
    }),

  unfollowUser: protectedProcedure
    .input(
      z.object({
        followerId: z.string(),
        followingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { followerId, followingId } = input;

      if (followerId === followingId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot unfollow yourself",
        });
      }

      const follow = await ctx.prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      return follow;
    }),
});

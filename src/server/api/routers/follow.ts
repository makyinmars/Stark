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

  getFollowers: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No userId provided",
        });
      }

      const followers = await ctx.prisma.follows.findMany({
        where: {
          followingId: input.userId,
        },
      });

      if (!followers) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No followers found",
        });
      }

      // Get the followers Ids and fetch the users
      const followersIds = followers.map((follower) => follower.followerId);

      const users = await ctx.prisma.user.findMany({
        where: {
          id: {
            in: followersIds,
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      });

      return users;
    }),

  getFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No userId provided",
        });
      }

      const following = await ctx.prisma.follows.findMany({
        where: {
          followerId: input.userId,
        },
      });

      if (!following) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No following found",
        });
      }

      // Get the following Ids and fetch the users
      const followingIds = following.map((follow) => follow.followingId);

      const users = await ctx.prisma.user.findMany({
        where: {
          id: {
            in: followingIds,
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      });

      return users;
    }),
});

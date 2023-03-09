import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getTimeOfDay } from "src/utils/date";

const getWorkoutById = Prisma.validator<Prisma.WorkoutSelect>()({
  id: true,
  name: true,
  description: true,
  copyCount: true,
  notes: true,
  exercises: true,
  userId: true,
});

const quickWorkoutId = Prisma.validator<Prisma.WorkoutSelect>()({
  id: true,
});

export const workoutRouter = createTRPCRouter({
  getWorkoutById: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const workout = await ctx.prisma.workout.findUnique({
        where: {
          id: input.workoutId,
        },
        select: getWorkoutById,
      });

      if (!workout) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not find workout",
        });
      }

      return workout;
    }),

  createQuickWorkout: protectedProcedure
    .input(
      z.object({
        name: z.string().default(`${getTimeOfDay()} Workout`),
        description: z.string().nullable().default(null),
        copyCount: z.number().default(0),
        notes: z.string().nullable().default(null),
        userId: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newQuickWorkout = await ctx.prisma.workout.create({
        data: {
          name: input.name,
          description: input.description,
          copyCount: input.copyCount,
          notes: input.notes,
          userId: input.userId,
        },
      });

      return newQuickWorkout;
    }),

  updateQuickWorkout: protectedProcedure
    .input(
      z.object({
        name: z.string().default(`${getTimeOfDay()} Workout`),
        description: z.string().nullable().default(null),
        copyCount: z.number().default(0),
        notes: z.string().nullable().default(null),
        userId: z.string(),
        exercises: z.array(
          z.object({
            name: z.string(),
            instructions: z.string(),
            type: z.string(),
            muscle: z.string(),
            equipment: z.string(),
            equipmentNeeded: z.boolean(),
            difficulty: z.string(),
            time: z.number().nullable().default(null),
            image: z.string().nullable().default(null),
            sets: z.array(
              z.object({
                reps: z.number().default(10),
                weight: z.number().default(20),
                time: z.number().nullable().default(null),
                rest: z.number().nullable().default(null),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newWorkout = await ctx.prisma.workout.create({
        data: {
          name: input.name,
          description: input.description,
          copyCount: input.copyCount,
          notes: input.notes,
          userId: input.userId,
        },
        select: quickWorkoutId,
      });

      if (!newWorkout) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create workout",
        });
      }

      if (newWorkout) {
        for (const exercise of input.exercises) {
          const newExercise = await ctx.prisma.exercise.create({
            data: {
              name: exercise.name,
              instructions: exercise.instructions,
              type: exercise.type,
              muscle: exercise.muscle,
              equipment: exercise.equipment,
              equipmentNeeded: exercise.equipmentNeeded,
              difficulty: exercise.difficulty,
              time: exercise.time,
              image: exercise.image,
              workoutId: newWorkout.id,
            },
            select: {
              id: true,
            },
          });

          if (!newExercise) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Could not create exercise",
            });
          }

          if (newExercise) {
            for (const set of exercise.sets) {
              const newSet = await ctx.prisma.set.create({
                data: {
                  reps: set.reps,
                  weight: set.weight,
                  time: set.time,
                  rest: set.rest,
                  exerciseId: newExercise.id,
                },
              });

              if (!newSet) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: "Could not create set",
                });
              }
            }
          }
          if (!newExercise) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Could not create exercise",
            });
          }
        }
      }

      return newWorkout;
    }),
});

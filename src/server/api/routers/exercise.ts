import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { exercises, yogaExercises } from "src/data/exercises";

const exerciseType = Prisma.validator<Prisma.ExerciseSelect>()({
  type: true,
});

const exerciseMuscle = Prisma.validator<Prisma.ExerciseSelect>()({
  muscle: true,
});

export const exerciseRouter = createTRPCRouter({
  createExercises: protectedProcedure.mutation(async ({ ctx }) => {
    // Create exercises with the data from src/data/exercises.ts
    // Use ctx.prisma.exercise.createMany to create multiple exercises at once
    for (const exercise of exercises) {
      const newExercise = await ctx.prisma.exercise.createMany({
        data: {
          name: exercise.name,
          instructions: exercise.instructions,
          type: exercise.type,
          muscle: exercise.muscle,
          equipment: exercise.equipment,
          equipmentNeeded: exercise.equipmentNeeded,
          difficulty: exercise.difficulty,
        },
      });

      console.log(newExercise);

      if (!newExercise) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create exercise",
        });
      }
    }
  }),

  getExercises: protectedProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.prisma.exercise.findMany({
      where: {
        workoutId: {
          equals: null,
        },
      },
    });

    if (exercises) {
      return exercises;
    }

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No exercises found",
    });
  }),

  getExercisesByTypes: protectedProcedure.query(async ({ ctx }) => {
    const exercisesTypes = await ctx.prisma.exercise.findMany({
      select: exerciseType,
    });

    if (exercisesTypes.length > 0) {
      // Return unique exercise types from the exercises with a O(1) lookup
      return [...new Set(exercisesTypes.map((exercise) => exercise.type))];
    }

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No exercises found",
    });
  }),

  getExercisesByMuscles: protectedProcedure.query(async ({ ctx }) => {
    const exercisesMuscles = await ctx.prisma.exercise.findMany({
      select: exerciseMuscle,
    });

    if (exercisesMuscles.length > 0) {
      return [...new Set(exercisesMuscles.map((exercise) => exercise.muscle))];
    }

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No exercises found",
    });
  }),

  getExercisesByMuscle: protectedProcedure
    .input(z.object({ muscle: z.string() }))
    .query(async ({ ctx, input }) => {
      const exercises = await ctx.prisma.exercise.findMany({
        where: {
          muscle: {
            equals: input.muscle,
          },
        },
        select: {
          name: true,
        },
      });

      if (exercises) {
        return exercises.map((exercise) => exercise.name);
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No exercises found",
      });
    }),
});

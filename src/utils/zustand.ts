import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Workout, Exercise } from "@prisma/client";

interface WorkoutState {
  workout: Workout;
  exercises: Exercise[];
  createWorkout: (workout: Workout) => void;
  addExercise: (exercise: Exercise) => void;
  getWorkout: () => Workout;
  getExercises: () => Exercise[];
}

export const useWorkoutStore = create<WorkoutState>()(
  devtools(
    persist(
      (set, get) => ({
        workout: {
          id: "",
          name: "",
          description: "",
          notes: "",
          timer: 0,
          copyCount: 0,
          userId: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        exercises: [],
        createWorkout: (workout: Workout) =>
          set({
            workout,
            exercises: [],
          }),
        addExercise: (exercise: Exercise) =>
          set((state) => ({ exercises: [...state.exercises, exercise] })),
        getWorkout: () => get().workout,
        getExercises: () => get().exercises,
      }),
      {
        name: "workout",
        getStorage: () => localStorage,
      }
    )
  )
);

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Exercise } from "@prisma/client";

interface ExerciseState {
  exercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exercise: Exercise) => void;
  getExercises: () => Exercise[];
  reset: () => void;
}

export const useExerciseState = create<ExerciseState>()(
  devtools(
    persist(
      (set, get) => ({
        exercises: [],
        addExercise: (exercise: Exercise) =>
          set((state) => ({ exercises: [...state.exercises, exercise] })),
        removeExercise: (exercise: Exercise) =>
          set((state) => ({
            exercises: state.exercises.filter((e) => e.id !== exercise.id),
          })),
        getExercises: () => get().exercises,
        reset: () => set({ exercises: [] }),
      }),
      {
        name: "exercises",
      }
    )
  )
);

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Exercise, Set } from "@prisma/client";

interface ExerciseState {
  exercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exercise: Exercise) => void;
  getExercises: () => Exercise[];
  reset: () => void;
}

export const useExerciseStore = create<ExerciseState>()(
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

interface SetState {
  sets: Set[];
  addSet: (setX: Set) => void;
  removeSet: (setId: string) => void;
  removeSets: (exerciseId: string) => void;
  getSets: () => Set[];
  reset: () => void;
}

export const useSetStore = create<SetState>()(
  devtools(
    persist(
      (set, get) => ({
        sets: [],
        addSet: (setX: Set) =>
          // Only add set if it doesn't already exist
          set((state) => ({
            sets: state.sets.find((s) => s.id === setX.id)
              ? state.sets
              : [...state.sets, setX],
          })),
        removeSet: (setId: string) =>
          set((state) => ({
            sets: state.sets.filter((s) => s.id !== setId),
          })),
        removeSets: (exerciseId: string) =>
          set((state) => ({
            sets: state.sets.filter((s) => s.exerciseId !== exerciseId),
          })),
        getSets: () => get().sets,
        reset: () => set({ sets: [] }),
      }),
      {
        name: "sets",
      }
    )
  )
);

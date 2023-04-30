import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Exercise, Set } from "@prisma/client";

type ExerciseSet = Exercise & {
  sets?: Set[];
};

interface ExerciseSetState {
  exerciseSets: ExerciseSet[];
  addExerciseSet: (exerciseSet: ExerciseSet) => void;
  addSetsToExerciseSet: (exerciseId: string, sets: Set[]) => void;
  removeExerciseSet: (exerciseSet: ExerciseSet) => void;
  getExerciseSets: () => ExerciseSet[];
  resetExerciseSet: () => void;
}

export const useExerciseSetStore = create<ExerciseSetState>()(
  devtools(
    persist(
      (set, get) => ({
        exerciseSets: [],
        addExerciseSet: (exerciseSet: ExerciseSet) => {
          set((state) => ({
            exerciseSets: state.exerciseSets.find(
              (e) => e.id === exerciseSet.id
            )
              ? state.exerciseSets
              : [...state.exerciseSets, exerciseSet],
          }));
        },
        addSetsToExerciseSet: (exerciseId: string, sets: Set[]) => {
          set((state) => ({
            exerciseSets: state.exerciseSets.map((e) =>
              e.id === exerciseId ? { ...e, sets } : e
            ),
          }));
        },
        removeExerciseSet: (exerciseSet: ExerciseSet) =>
          set((state) => ({
            exerciseSets: state.exerciseSets.filter(
              (e) => e.id !== exerciseSet.id
            ),
          })),
        getExerciseSets: () => get().exerciseSets,
        resetExerciseSet: () => set({ exerciseSets: [] }),
      }),
      {
        name: "exerciseSets-state",
      }
    )
  )
);

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
        addExercise: (exercise: Exercise) => {
          set((state) => ({
            exercises: state.exercises.find((e) => e.id === exercise.id)
              ? state.exercises
              : [...state.exercises, exercise],
          }));
        },
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
  reset: () => void;
}

export const useSetStore = create<SetState>()(
  devtools(
    persist(
      (set) => ({
        sets: [],
        addSet: (setX: Set) => {
          // Only add the set if it doesn't already exist
          set((state) => ({
            sets: state.sets.find((s) => s.id === setX.id)
              ? state.sets
              : [...state.sets, setX],
          }));
        },
        removeSet: (setId: string) =>
          set((state) => ({
            sets: state.sets.filter((s) => s.id !== setId),
          })),
        removeSets: (exerciseId: string) =>
          set((state) => ({
            sets: state.sets.filter((s) => s.exerciseId !== exerciseId),
          })),
        reset: () => set({ sets: [] }),
      }),
      {
        name: "sets",
      }
    )
  )
);

import Head from "next/head";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { XCircle } from "lucide-react";
import { useForm } from "react-hook-form";

import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "src/components/ui/dialog";
import Exercises from "src/components/common/exercises";
import { ssgHelper } from "src/utils/ssg";
import { useExerciseState } from "src/utils/zustand";
import { api } from "src/utils/api";
import { Input } from "src/components/ui/input";
import { Textarea } from "src/components/ui/textarea";
import { workerData } from "worker_threads";

type CreateWorkoutInput = {
  name: string;
};

const NewWorkout = ({
  workoutId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { register, watch } = useForm<CreateWorkoutInput>();
  const router = useRouter();

  const utils = api.useContext();

  const updateQuickWorkout = api.workout.updateQuickWorkout.useMutation();
  const deleteWorkout = api.workout.deleteWorkoutById.useMutation();
  const user = utils.auth.getUserSession.getData();

  const { data: workoutData } = api.workout.getWorkoutById.useQuery({
    workoutId: workoutId as string,
  });

  const { exercises, removeExercise, reset } = useExerciseState();

  const exerciseSets = [
    { reps: 10, weight: 10 },
    { reps: 10, weight: 10 },
    { reps: 10, weight: 10 },
  ];

  const onUpdateQuickWorkout = async () => {
    try {
      if (user && workoutData) {
        const updatedWorkout = await updateQuickWorkout.mutateAsync({
          name: workoutData.name,
          notes: "Quick Workout Notes",
          userId: user.id,
          exercises: exercises.map((exercise) => ({
            name: exercise.name,
            instructions: exercise.instructions,
            type: exercise.type,
            muscle: exercise.muscle,
            equipment: exercise.equipment,
            equipmentNeeded: exercise.equipmentNeeded,
            difficulty: exercise.difficulty,
            time: exercise.time,
            image: exercise.image,
            sets: exerciseSets,
          })),
        });

        if (updatedWorkout) {
          reset();
          await router.push("/dashboard");
        }
      }
    } catch { }
  };

  const onDeleteWorkout = async (workoutId: string | null) => {
    try {
      if (!workoutId) return;
      const deletedWorkout = await deleteWorkout.mutateAsync({ workoutId });
      if (deletedWorkout) {
        console.log("Workout deleted");
        await router.push("/dashboard");
      }
    } catch { }
  };

  return (
    <>
      <Head>
        <title>Create Workout</title>
      </Head>
      <UserMenu>
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            variant="destructive"
            onClick={() => void onUpdateQuickWorkout()}
          >
            Complete Workout
          </Button>
          <Input
            className="custom-h3 flex items-center gap-2"
            type="text"
            defaultValue={workoutData && workoutData.name}
          />
          <Textarea
            className="custom-subtle"
            placeholder="Notes"
            defaultValue={(workoutData && workoutData.notes) ?? "Notes"}
          />
        </div>
        {exercises.length > 0 &&
          exercises.map((exercise, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded border border-slate-800 p-2"
            >
              <div className="flex items-center justify-between">
                <p className="custom-p font-semibold">{exercise.name}</p>
                <Button
                  variant="ghost"
                  className="w-10 rounded-full p-0"
                  onClick={() => removeExercise(exercise)}
                >
                  <XCircle />
                </Button>
              </div>
              <div className="flex justify-around">
                <p>Set #</p>
                <p>Reps #</p>
                <p>Weight</p>
              </div>
              {exerciseSets.map((set, i) => (
                <div className="flex justify-around" key={i}>
                  <div>{i + 1}</div>
                  <div>{set.reps}</div>
                  <div>{set.weight} lb</div>
                </div>
              ))}
            </div>
          ))}
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Exercise</Button>
          </DialogTrigger>
          <DialogContent className="py-10">
            <Exercises />
          </DialogContent>
        </Dialog>
        <Button
          className="w-full"
          onClick={() => void onDeleteWorkout(workoutId)}
        >
          Cancel Workout
        </Button>
      </UserMenu>
    </>
  );
};

export default NewWorkout;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const workoutId = context.params?.workoutId as string;
  const { ssg, session } = await ssgHelper(context);

  if (session && session.user) {
    await ssg.auth.getUserSession.prefetch();
    await ssg.workout.getWorkoutById.prefetch({ workoutId });
    await ssg.exercise.getExercises.prefetch();
    await ssg.exercise.getExercisesByTypes.prefetch();
    await ssg.exercise.getExercisesByMuscles.prefetch();
    return {
      props: {
        trpcState: ssg.dehydrate(),
        workoutId,
      },
    };
  } else {
    return {
      props: {
        trpcState: ssg.dehydrate(),
        workoutId: null,
      },
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

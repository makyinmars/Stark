import Head from "next/head";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { getTimeOfDay } from "src/utils/date";
import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "src/components/ui/dialog";
import Exercises from "src/components/common/exercises";
import { ssgHelper } from "src/utils/ssg";
import { useExerciseState } from "src/utils/zustand";
import { api } from "src/utils/api";

const CreateWorkout = () => {
  const utils = api.useContext();

  const createQuickWorkout = api.workout.createQuickWorkout.useMutation();
  const user = utils.auth.getUserSession.getData();

  const { exercises, removeExercise, reset } = useExerciseState();

  console.log(exercises);

  const onCreateQuickWorkout = async () => {
    try {
      const exerciseSets = [
        { reps: 10, weight: 10 },
        { reps: 10, weight: 10 },
        { reps: 10, weight: 10 },
      ];

      if (user) {
        const newWorkout = await createQuickWorkout.mutateAsync({
          name: "Quick Workout",
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

        if (newWorkout) {
          reset();
        }
      }
    } catch {}
  };

  return (
    <>
      <Head>
        <title>Create Workout</title>
      </Head>
      <UserMenu>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="custom-h3 flex items-center gap-2">
              {getTimeOfDay()} Workout
              <MoreHorizontal size={16} />
            </h2>
            <p className="custom-subtle">Notes</p>
          </div>
          <Button
            className="h-8 self-start"
            variant="destructive"
            onClick={() => void onCreateQuickWorkout()}
          >
            Finish
          </Button>
        </div>
        {exercises.length > 0 &&
          exercises.map((exercise, i) => (
            <div key={i} className="flex items-center justify-between">
              <p className="custom-p font-semibold">{exercise.name}</p>
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
        <Link href="/dashboard">
          <Button className="w-full">Cancel Workout</Button>
        </Link>
      </UserMenu>
    </>
  );
};

export default CreateWorkout;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssgHelper(context);

  if (session && session.user) {
    await ssg.auth.getUserSession.prefetch();
    await ssg.exercise.getExercises.prefetch();
    await ssg.exercise.getExercisesByTypes.prefetch();
    await ssg.exercise.getExercisesByMuscles.prefetch();
    return {
      props: {
        trpcState: ssg.dehydrate(),
      },
    };
  } else {
    return {
      props: {
        trpcState: ssg.dehydrate(),
      },
      redirect: {
        destination: "/",
        permanent: "false",
      },
    };
  }
};

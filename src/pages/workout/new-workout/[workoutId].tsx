import Head from "next/head";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useRouter } from "next/router";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import type { Exercise } from "@prisma/client";

import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "src/components/ui/dialog";
import Exercises from "src/components/common/exercises";
import { ssgHelper } from "src/utils/ssg";
import { useExerciseState, useSetState } from "src/utils/zustand";
import { api } from "src/utils/api";
import { Input } from "src/components/ui/input";
import { Textarea } from "src/components/ui/textarea";
import CreateSet from "src/components/common/create-set";
import { useToast } from "src/hooks/useToast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";

type UpdateWorkoutInput = {
  name: string;
  description: string;
  copyCount: number;
  notes: string;
  exerciseSets: {
    weight: number;
    reps: number;
    time: number;
  }[];
};

const NewWorkout = ({
  workoutId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { toast } = useToast();

  const { sets, reset: resetSet, removeSets } = useSetState();

  const utils = api.useContext();

  const user = api.auth.getUserSession.useQuery();

  const deleteWorkout = api.workout.deleteWorkoutById.useMutation({
    onMutate: () => {
      toast({
        title: "Deleting Workout",
        description: "Please wait...",
      });
    },
    onSettled: () => {
      toast({
        title: "Workout Deleted",
      });
    },
    onSuccess: async () => {
      resetExercise();
      resetSet();
      await utils.workout.getWorkoutsByUserId.invalidate({
        userId: user?.data && user?.data?.id,
      });
      await router.push("/dashboard");
    },
  });

  const updateQuickWorkout = api.workout.updateQuickWorkout.useMutation({
    onMutate: ({ name }) => {
      if (name) {
        toast({
          title: `Saving ${name} Workout`,
          description: "Please wait...",
        });
      }
    },
    onSettled: () => {
      toast({
        title: "Workout Saved",
      });
    },
    onSuccess: async () => {
      resetExercise();
      resetSet();
      await utils.workout.getWorkoutsByUserId.invalidate({
        userId: user?.data && user?.data?.id,
      });
      await router.push("/dashboard");
    },
  });

  const { data: workoutData } = api.workout.getWorkoutById.useQuery({
    workoutId: workoutId as string,
  });

  const { register, watch } = useForm<UpdateWorkoutInput>({
    defaultValues: {
      name: workoutData ? workoutData.name : "",
    },
  });

  const {
    exercises,
    removeExercise,
    reset: resetExercise,
  } = useExerciseState();

  const onUpdateQuickWorkout = async () => {
    try {
      if (user && workoutId) {
        await updateQuickWorkout.mutateAsync({
          workoutId,
          name: watch("name"),
          notes: watch("notes"),
          description: watch("description"),
          userId: user.data?.id as string,
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
            sets: sets,
          })),
        });
      }
    } catch {}
  };

  const onDeleteWorkout = async (workoutId: string | null) => {
    try {
      if (!workoutId) return;
      await deleteWorkout.mutateAsync({ workoutId });
    } catch {}
  };

  const onRemoveExercise = (exercise: Exercise) => {
    removeExercise(exercise);
    removeSets(exercise.id);
  };

  return (
    <>
      <Head>
        <title>New Workout</title>
      </Head>
      <UserMenu>
        <Card className="flex flex-col gap-2">
          <CardHeader>
            <CardTitle className="flex flex-col gap-2">
              <Input
                className="custom-h3 flex items-center gap-2"
                type="text"
                defaultValue={workoutData && workoutData.name}
                {...register("name", {
                  required: true,
                  maxLength: 100,
                })}
              />
              <Input
                className="custom-h3 flex items-center gap-2"
                type="text"
                placeholder="Description"
                defaultValue={(workoutData && workoutData.description) ?? ""}
                {...register("description", {
                  required: true,
                  maxLength: 400,
                })}
              />
              <Textarea
                className="custom-subtle"
                placeholder="Notes"
                defaultValue={(workoutData && workoutData.notes) ?? ""}
                {...register("notes", {
                  required: true,
                  maxLength: 300,
                })}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="beneficial"
              onClick={() => void onUpdateQuickWorkout()}
            >
              Complete Workout
            </Button>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Add Exercise</Button>
              </DialogTrigger>
              <DialogContent className="py-10">
                <Exercises />
              </DialogContent>
            </Dialog>
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => void onDeleteWorkout(workoutId)}
            >
              Cancel Workout
            </Button>
          </CardFooter>
        </Card>
        <Card className="py-6">
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {exercises.length > 0 &&
              exercises.map((exercise, i) => (
                <Card key={i} className="flex flex-col gap-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-around">
                      <p className="custom-p font-semibold">{exercise.name}</p>
                      <Button
                        variant="ghost"
                        className="w-10 rounded-full p-0"
                        onClick={() => onRemoveExercise(exercise)}
                      >
                        <Trash />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CreateSet key={exercise.id} exerciseId={exercise.id} />
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>
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

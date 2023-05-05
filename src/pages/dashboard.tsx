import Head from "next/head";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useRouter } from "next/router";

import { Button } from "src/components/ui/button";
import { ssgHelper } from "src/utils/ssg";
import UserMenu from "src/components/common/user-menu";
import { api } from "src/utils/api";
import WorkoutBox from "src/components/common/workout-box";
import { useToast } from "src/hooks/useToast";
import Error from "src/components/common/error";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "src/components/ui/accordion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { useExerciseStore, useExerciseSetStore } from "src/utils/zustand";
import { Loader2 } from "lucide-react";
import SkeletonCard from "src/components/common/skeleton-card";

const Dashboard = ({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const utils = api.useContext();
  const router = useRouter();

  const { toast } = useToast();

  const chestExercisesQuery = api.exercise.getExercisesByMuscle.useQuery({
    muscle: "Chest",
  });

  const tricepsExercisesQuery = api.exercise.getExercisesByMuscle.useQuery({
    muscle: "Triceps",
  });

  const bicepsExercisesQuery = api.exercise.getExercisesByMuscle.useQuery({
    muscle: "Biceps",
  });

  const backExercisesQuery = api.exercise.getExercisesByMuscle.useQuery({
    muscle: "Back",
  });

  const coreExercisesQuery = api.exercise.getExercisesByMuscle.useQuery({
    muscle: "Core",
  });

  const legsExercisesQuery = api.exercise.getExercisesByMuscle.useQuery({
    muscle: "Legs",
  });

  const shouldersExercisesQuery = api.exercise.getExercisesByMuscle.useQuery({
    muscle: "Shoulders",
  });

  const {
    data: myWorkoutsData,
    isLoading: myWorkoutsIsLoading,
    isError: myWorkoutsIsError,
    error: myWorkoutsDataError,
  } = api.workout.getWorkoutsByUserId.useQuery(
    {
      userId,
    },
    {
      retry: false,
    }
  );

  const user = utils.auth.getUserSession.getData();

  const createQuickWorkout = api.workout.createQuickWorkout.useMutation({
    onSettled: async (variables) => {
      if (!variables) return;
      await router.push(`/workout/new-workout/${variables.id}`);
      await utils.workout.getWorkoutsByUserId.invalidate({ userId: userId });
    },
    onSuccess: () => {
      toast({
        title: "Workout created",
        description: "You can add exercises to it now.",
      });
    },
  });

  const onCreateQuickWorkout = async () => {
    try {
      await createQuickWorkout.mutateAsync({
        userId: user && user.id,
      });
    } catch { }
  };

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <UserMenu>
        <h1 className="custom-h1">Start Workout</h1>

        <h3 className="custom-h3">Quick Start</h3>
        <Button className="w-full" onClick={() => void onCreateQuickWorkout()}>
          Start an Empty Workout
        </Button>
        <h3 className="custom-h3 text-center">Workouts</h3>
        {myWorkoutsIsLoading &&
          <SkeletonCard length={2} />
        }
        {myWorkoutsData && myWorkoutsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Workouts({myWorkoutsData.length})</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
              {myWorkoutsData.map((w, i) => (
                <WorkoutBox
                  key={i}
                  id={w.id}
                  name={w.name}
                  createdAt={w.createdAt}
                  exercises={w.exercises}
                  copyCount={w.copyCount}
                  userId={userId as string}
                />
              ))}
            </CardContent>
          </Card>
        )}
        {myWorkoutsIsError && <Error message={myWorkoutsDataError.message} />}
        <Card>
          <CardHeader>
            <CardTitle>Example Workouts(7)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
            {chestExercisesQuery.data && (
              <ExampleWorkout
                name="Chest"
                exercises={chestExercisesQuery.data}
              />
            )}

            {tricepsExercisesQuery.data && (
              <ExampleWorkout
                name="Triceps"
                exercises={tricepsExercisesQuery.data}
              />
            )}

            {bicepsExercisesQuery.data && (
              <ExampleWorkout
                name="Biceps"
                exercises={bicepsExercisesQuery.data}
              />
            )}

            {backExercisesQuery.data && (
              <ExampleWorkout name="Back" exercises={backExercisesQuery.data} />
            )}

            {coreExercisesQuery.data && (
              <ExampleWorkout name="Core" exercises={coreExercisesQuery.data} />
            )}

            {legsExercisesQuery.data && (
              <ExampleWorkout name="Legs" exercises={legsExercisesQuery.data} />
            )}

            {shouldersExercisesQuery.data && (
              <ExampleWorkout
                name="Shoulders"
                exercises={shouldersExercisesQuery.data}
              />
            )}
          </CardContent>
        </Card>
      </UserMenu>
    </>
  );
};

const ExampleWorkout = ({
  name,
  exercises,
}: {
  name: string;
  exercises: string[];
}) => {
  const utils = api.useContext();
  const { toast } = useToast();
  const router = useRouter();
  const { reset, addExercise } = useExerciseStore();
  const { addExerciseSet } = useExerciseSetStore();

  const createExampleWorkout = api.workout.createExampleWorkout.useMutation({
    onMutate: (variables) => {
      toast({
        title: `Creating ${variables.muscle} workout...`,
        description: (
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />{" "}
            <span>Please wait...</span>
          </div>
        ),
      });
    },
    onSuccess: async (data) => {
      if (data) {
        await router.push(`/workout/new-workout/${data?.id}`);
        reset();
        if (data.exercises) {
          for (const e of data.exercises) {
            addExercise(e);
          }
          for (const e of data.exercises) {
            addExerciseSet(e);
          }
        }
        await utils.workout.getWorkoutsByUserId.invalidate({
          userId: data?.userId,
        });
        toast({
          title: "Workout created",
          description: "You can add exercises to it now.",
        });
      }
    },
  });

  const onCreateExampleWorkout = async (muscle: string) => {
    try {
      await createExampleWorkout.mutateAsync({
        muscle,
      });
    } catch { }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-auto">
          <AccordionItem value="item-1">
            <AccordionTrigger>Exercises</AccordionTrigger>
            <AccordionContent>
              {exercises.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => void onCreateExampleWorkout(name)}
        >
          Start Workout
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Dashboard;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssgHelper(context);

  if (session && session.user) {
    const userId = session.user.id;

    return {
      props: {
        trpcState: ssg.dehydrate(),
        userId,
      },
    };
  } else {
    return {
      props: {
        trpcState: ssg.dehydrate(),
        userId: null,
      },
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

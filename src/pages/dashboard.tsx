import Head from "next/head";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { History, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/router";

import { Button } from "src/components/ui/button";
import { ssgHelper } from "src/utils/ssg";
import UserMenu from "src/components/common/user-menu";
import { api } from "src/utils/api";
import WorkoutBox from "src/components/common/workout-box";
import { useToast } from "src/hooks/useToast";
import Error from "src/components/common/error";
import Spinner from "src/components/common/spinner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "src/components/ui/accordion";

const Dashboard = ({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const utils = api.useContext();
  const router = useRouter();

  const { toast } = useToast();

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
        <h3 className="text-center custom-h3">Workouts</h3>
        {myWorkoutsIsLoading && <Spinner />}
        {myWorkoutsData && myWorkoutsData.length > 0 && (
          <div>
            <h4 className="custom-h4">My Workouts({myWorkoutsData.length})</h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
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
            </div>
          </div>
        )}
        {myWorkoutsIsError && <Error message={myWorkoutsDataError.message} />}
        <h4 className="custom-h4">Example Workouts(4)</h4>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4">

          <div className="p-2 flex flex-col gap-2 rounded border-gray-200 border-2">
            <h5 className="text-center custom-h5">
              Chest and Triceps
            </h5>
            <Accordion type="single" collapsible className="w-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>Exercises</AccordionTrigger>
                <AccordionContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button>Start Workout</Button>
          </div>
          <div className="p-2 flex flex-col gap-2 rounded border-gray-200 border-2">
            <h5 className="text-center custom-h5">
              Back and Biceps
            </h5>
            <Accordion type="single" collapsible className="w-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>Exercises</AccordionTrigger>
                <AccordionContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button>Start Workout</Button>
          </div>
          <div className="p-2 flex flex-col gap-2 rounded border-gray-200 border-2">
            <h5 className="text-center custom-h5">
              Legs and Shoulders
            </h5>
            <Accordion type="single" collapsible className="w-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>Exercises</AccordionTrigger>
                <AccordionContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button>Start Workout</Button>
          </div>
          <div className="p-2 flex flex-col gap-2 rounded border-gray-200 border-2">
            <h5 className="text-center custom-h5">
              Cardio
            </h5>
            <Accordion type="single" collapsible className="w-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>Exercises</AccordionTrigger>
                <AccordionContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button>Start Workout</Button>
          </div>
        </div>
      </UserMenu>
    </>
  );
};

export default Dashboard;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssgHelper(context);

  if (session && session.user) {
    const userId = session.user.id;

    await ssg.auth.getUserSession.prefetch();

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

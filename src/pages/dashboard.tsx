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
    } catch {}
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
        {myWorkoutsIsLoading && <Spinner />}
        {myWorkoutsData && myWorkoutsData.length > 0 && (
          <div>
            <h4 className="custom-h4">My Workouts({myWorkoutsData.length})</h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border border-gray-50 p-2">
            <h5 className="custom-h5 flex items-center justify-between">
              Chest and Triceps <MoreHorizontal size={16} />
            </h5>
            <p className="custom-subtle">Beach Press(Barbell)</p>
            <p className="custom-subtle flex items-center gap-2">
              <History size={16} /> Dec 13, 2022
            </p>
          </div>
          <div className="rounded border border-gray-50 p-2">
            <h5 className="custom-h5 flex items-center justify-between">
              Chest and Triceps <MoreHorizontal size={16} />
            </h5>
            <p className="custom-subtle">Beach Press(Barbell)</p>
            <p className="custom-subtle flex items-center gap-2">
              <History size={16} /> Dec 13, 2022
            </p>
          </div>
          <div className="rounded border border-gray-50 p-2">
            <h5 className="custom-h5 flex items-center justify-between">
              Chest and Triceps <MoreHorizontal size={16} />
            </h5>
            <p className="custom-subtle">Beach Press(Barbell)</p>
            <p className="custom-subtle flex items-center gap-2">
              <History size={16} /> Dec 13, 2022
            </p>
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

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

const Dashboard = ({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const utils = api.useContext();
  const router = useRouter();

  const { toast } = useToast();

  const { data: myWorkoutsData } = api.workout.getWorkoutsByUserId.useQuery(
    {
      userId,
    },
    {
      retry: false,
    }
  );

  const createQuickWorkout = api.workout.createQuickWorkout.useMutation();

  const user = utils.auth.getUserSession.getData();

  const onCreateQuickWorkout = async () => {
    try {
      const newWorkout = await createQuickWorkout.mutateAsync({
        userId: user && user.id,
      });

      if (newWorkout) {
        toast({
          title: "Workout created",
          description: "You can add exercises to it now.",
        });

        await router.push(`/workout/new-workout/${newWorkout.id}`);
      }
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
        <h3 className="custom-h3">Workouts</h3>
        {myWorkoutsData && myWorkoutsData.length > 0 && (
          <div>
            <h4 className="custom-h4">My Workouts({myWorkoutsData.length})</h4>
            <div className="grid grid-cols-2 gap-2">
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
    await ssg.workout.getWorkoutsByUserId.prefetch({ userId });

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

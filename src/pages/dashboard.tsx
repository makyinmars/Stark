import Head from "next/head";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { Dumbbell, History, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/router";

import { Button } from "src/components/ui/button";
import { ssgHelper } from "src/utils/ssg";
import UserMenu from "src/components/common/user-menu";
import { api } from "src/utils/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";

const Dashboard = ({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const utils = api.useContext();
  const router = useRouter();

  const { data: myWorkoutsData } = api.user.getWorkoutsByUserId.useQuery({
    userId,
  });

  const createQuickWorkout = api.workout.createQuickWorkout.useMutation();
  const deleteWorkoutById = api.workout.deleteWorkoutById.useMutation({
    onSuccess: async () => {
      await utils.user.getWorkoutsByUserId.invalidate({ userId });
    },
  });

  const user = utils.auth.getUserSession.getData();

  const onCreateQuickWorkout = async () => {
    try {
      const newWorkout = await createQuickWorkout.mutateAsync({
        userId: user && user.id,
      });

      if (newWorkout) {
        await router.push(`/workout/new-workout/${newWorkout.id}`);
      }
    } catch {}
  };

  const onDeleteWorkoutById = async (workoutId: string) => {
    try {
      await deleteWorkoutById.mutateAsync({ workoutId });
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
                <div className="flex flex-col gap-2" key={i}>
                  <div className="rounded border border-gray-50 p-2">
                    <h5 className="custom-h5 flex items-center justify-between">
                      {w.name}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button>
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="flex items-center justify-around gap-2"
                            onClick={() => void router.push(`/workout/${w.id}`)}
                          >
                            <Dumbbell size={14} />
                            <p>View Workout</p>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center justify-around gap-2"
                            onClick={() => void onDeleteWorkoutById(w.id)}
                          >
                            <Trash size={14} />
                            <p>Delete Workout</p>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </h5>
                    {w.exercises.map((e, j) => (
                      <p className="custom-subtle" key={j}>
                        {e.name}
                      </p>
                    ))}
                    <p className="custom-subtle flex items-center gap-2">
                      <History size={16} /> Dec 13, 2022
                    </p>
                  </div>
                </div>
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
    await ssg.user.getWorkoutsByUserId.prefetch({ userId });

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

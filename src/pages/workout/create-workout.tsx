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

const CreateWorkout = () => {
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
          <Button className="h-8 self-start" variant="destructive">
            Finish
          </Button>
        </div>
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

import Head from "next/head";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { History, MoreHorizontal } from "lucide-react";

import { Button } from "src/components/ui/button";
import { ssgHelper } from "src/utils/ssg";
import UserMenu from "src/components/common/user-menu";

const Dashboard = () => {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <UserMenu>
        <h1 className="custom-h1">Start Workout</h1>

        <h3 className="custom-h3">Quick Start</h3>
        <Link href="/workout/create-workout">
          <Button className="w-full">Start an Empty Workout</Button>
        </Link>

        <h3 className="custom-h3">Workouts</h3>
        <h4 className="custom-h4">My Workouts(4)</h4>
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
    await ssg.auth.getUserSession.prefetch();

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

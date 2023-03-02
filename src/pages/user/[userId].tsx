import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Image from "next/image";
import Head from "next/head";
import { MoreHorizontal, History, Copy } from "lucide-react";

import { ssgHelper } from "src/utils/ssg";
import { api } from "src/utils/api";
import UserMenu from "src/components/common/user-menu";
import { formatDate } from "src/utils/date";

const User = ({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const utils = api.useContext();

  const user = utils.user.getUserById.getData({ id: userId });
  const userWorkouts = utils.user.getWorkoutsByUserId.getData({ userId });

  return (
    <>
      {user ? (
        <>
          <Head>
            <title>
              {user.name}
              {`'`}s Profile
            </title>
          </Head>
          <UserMenu>
            <div className="flex flex-col gap-4">
              <Image
                src={user.image as string}
                className="mx-auto rounded-full"
                width={120}
                height={120}
                alt={user.name as string}
              />
              <h3 className="self-center custom-h3">{user.name}</h3>
            </div>

            <h4 className="self-center custom-h4">Workouts: (40)</h4>

            <div className="flex justify-around">
              <div className="p-2 border rounded border-gray-50">
                <h5 className="flex items-center justify-between custom-h5">
                  Followers
                </h5>
                <p className="text-center custom-subtle">15</p>
              </div>
              <div className="p-2 border rounded border-gray-50">
                <h5 className="flex items-center justify-between custom-h5">
                  Following
                </h5>
                <p className="text-center custom-subtle">20</p>
              </div>
            </div>

            <h4 className="self-center custom-h4">Workout History</h4>
            <div className="grid grid-cols-2 gap-2">
              {userWorkouts &&
                userWorkouts.map((workout, i) => (
                  <div className="p-2 border rounded border-gray-50" key={i}>
                    <h5 className="flex items-center justify-between custom-h5">
                      {workout.name} <MoreHorizontal size={16} />
                    </h5>
                    {workout.exercises.map((exercise, j) => (
                      <p className="custom-subtle" key={j}>
                        {exercise.name}
                      </p>
                    ))}
                    <p className="flex items-center gap-2 custom-subtle">
                      <History size={16} />{" "}
                      {formatDate("DD/MM/YYYY", workout.createdAt)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Copy size={16} /> Copy Workout
                    </p>
                  </div>
                ))}
            </div>
          </UserMenu>
        </>
      ) : (
        <Head>
          <title>User Not Found</title>
        </Head>
      )}
    </>
  );
};

export default User;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const userId = context.params?.userId as string;

  const { ssg, session } = await ssgHelper(context);

  if (session && session.user) {
    await ssg.auth.getUserSession.prefetch();
    await ssg.user.getUserById.prefetch({ id: userId });
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
        permanent: "false",
      },
    };
  }
};

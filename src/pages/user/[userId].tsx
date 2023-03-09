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
import { Button } from "src/components/ui/button";

const User = ({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const utils = api.useContext();

  const followUser = api.follow.followUser.useMutation({
    onSuccess: async () => {
      await utils.user.getUserFollowers.invalidate({ userId });
    },
  });

  const unfollowUser = api.follow.unfollowUser.useMutation({
    onSuccess: async () => {
      await utils.user.getUserFollowers.invalidate({ userId });
    },
  });

  const session = utils.auth.getUserSession.getData();

  const userData = utils.user.getUserById.getData({ id: userId });
  const userWorkoutsData = utils.user.getWorkoutsByUserId.getData({
    userId,
  });
  const { data: userFollowersData } = api.user.getUserFollowers.useQuery({
    userId,
  });
  const { data: userFollowingData } = api.user.getUserFollowing.useQuery({
    userId,
  });

  const onFollowUser = async () => {
    try {
      const follow = await followUser.mutateAsync({
        followerId: session?.id as string,
        followingId: userData?.id as string,
      });

      console.log(follow);
    } catch {}
  };

  const onUnfollowUser = async () => {
    try {
      const unfollow = await unfollowUser.mutateAsync({
        followerId: session?.id as string,
        followingId: userData?.id as string,
      });

      console.log(unfollow);
    } catch {}
  };

  return (
    <>
      {userData ? (
        <>
          <Head>
            <title>{userData && userData.name}</title>
          </Head>
          <UserMenu>
            <div className="flex flex-col gap-4">
              <Image
                src={userData.image as string}
                className="mx-auto rounded-full"
                width={120}
                height={120}
                priority={true}
                alt={userData.name as string}
              />
              <h3 className="self-center custom-h3">{userData.name}</h3>
            </div>

            {session?.id !== userData.id && (
              <div className="flex flex-col items-center justify-center gap-1">
                {session &&
                userFollowersData &&
                userFollowersData.find((u) => u.id === session.id) ? (
                  <Button
                    className="w-40"
                    onClick={() => void onUnfollowUser()}
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button className="w-40" onClick={() => void onFollowUser()}>
                    Follow
                  </Button>
                )}
                {session &&
                  userFollowingData &&
                  userFollowingData.find((u) => u.id === session.id) && (
                    <p className="p-1 custom-subtle">Follows you</p>
                  )}
              </div>
            )}

            <h4 className="self-center custom-h4">
              Workouts: ({userWorkoutsData ? userWorkoutsData.length : 0})
            </h4>

            <div className="flex justify-around">
              <div>
                <h5 className="flex items-center justify-between custom-h5">
                  Followers
                </h5>
                <p className="text-center custom-subtle">
                  {userFollowersData ? userFollowersData.length : 0}
                </p>
              </div>
              <div>
                <h5 className="flex items-center justify-between custom-h5">
                  Following
                </h5>
                <p className="text-center custom-subtle">
                  {userFollowingData ? userFollowingData.length : 0}
                </p>
              </div>
            </div>

            <h4 className="self-center custom-h4">Workout History</h4>
            <div className="grid grid-cols-2 gap-2">
              {userWorkoutsData &&
                userWorkoutsData.map((workout, i) => (
                  <div className="p-2 border rounded border-slate-700" key={i}>
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
    await ssg.user.getUserFollowers.prefetch({ userId });
    await ssg.user.getUserFollowing.prefetch({ userId });

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

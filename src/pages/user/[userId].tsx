import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Image from "next/image";
import Head from "next/head";

import { ssgHelper } from "src/utils/ssg";
import { api } from "src/utils/api";
import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import WorkoutBox from "src/components/common/workout-box";

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

  const userWorkoutsData = utils.workout.getWorkoutsByUserId.getData({
    userId,
  });

  const { data: userFollowersData } = api.user.getUserFollowers.useQuery(
    {
      userId,
    },
    { retry: false }
  );
  const { data: userFollowingData } = api.user.getUserFollowing.useQuery(
    {
      userId,
    },
    {
      retry: false,
    }
  );

  const onFollowUser = async () => {
    try {
      const follow = await followUser.mutateAsync({
        followerId: session?.id as string,
        followingId: userData?.id as string,
      });
    } catch {}
  };

  const onUnfollowUser = async () => {
    try {
      const unfollow = await unfollowUser.mutateAsync({
        followerId: session?.id as string,
        followingId: userData?.id as string,
      });
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
              <h3 className="custom-h3 self-center">{userData.name}</h3>
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
                    <p className="custom-subtle p-1">Follows you</p>
                  )}
              </div>
            )}

            <h4 className="custom-h4 self-center">
              Workouts: ({userWorkoutsData ? userWorkoutsData.length : 0})
            </h4>

            <div className="flex justify-around">
              <div>
                <h5 className="custom-h5 flex items-center justify-between">
                  Followers
                </h5>
                <p className="custom-subtle text-center">
                  {userFollowersData ? userFollowersData.length : 0}
                </p>
              </div>
              <div>
                <h5 className="custom-h5 flex items-center justify-between">
                  Following
                </h5>
                <p className="custom-subtle text-center">
                  {userFollowingData ? userFollowingData.length : 0}
                </p>
              </div>
            </div>

            <h4 className="custom-h4 self-center">Workout History</h4>
            <div className="grid grid-cols-2 gap-2">
              {userWorkoutsData &&
                userWorkoutsData.map((w, i) => (
                  <WorkoutBox
                    key={i}
                    id={w.id}
                    name={w.name}
                    createdAt={w.createdAt}
                    exercises={w.exercises}
                    copyCount={w.copyCount}
                    userId={session?.id as string}
                    showCopy={userId !== session?.id}
                  />
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
    await ssg.workout.getWorkoutsByUserId.prefetch({ userId });
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

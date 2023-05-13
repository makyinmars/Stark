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
import { Crown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "src/components/ui/command";
import Link from "next/link";
import { ScrollArea } from "src/components/ui/scroll-area";
import Spinner from "src/components/common/spinner";
import Error from "src/components/common/error";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";
import SkeletonCard from "src/components/common/skeleton-card";

const User = ({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const utils = api.useContext();

  const { data: session } = api.auth.getUserSession.useQuery();

  const {
    data: userData,
    isLoading: userIsLoading,
    isError: userIsError,
    error: userError,
  } = api.user.getUserById.useQuery({ id: userId });

  const {
    data: followersData,
    refetch: followersRefetch,
    isLoading: followersIsLoading,
    isError: followersIsError,
    error: followersError,
  } = api.follow.getFollowers.useQuery(
    {
      userId: userId as string,
    },
    {
      enabled: false,
    }
  );

  const {
    data: followingData,
    refetch: followingRefetch,
    isLoading: followingIsLoading,
    isError: followingIsError,
    error: followingError,
  } = api.follow.getFollowing.useQuery(
    {
      userId: userId as string,
    },
    {
      enabled: false,
    }
  );

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

  const userWorkoutsData = api.workout.getWorkoutsByUserId.useQuery({
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
      await followUser.mutateAsync({
        followerId: session?.id as string,
        followingId: userData?.id as string,
      });
    } catch {}
  };

  const onUnfollowUser = async () => {
    try {
      await unfollowUser.mutateAsync({
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
            <h2 className="custom-h2 text-center">User Profile</h2>
            <div className="flex flex-col gap-4">
              <Image
                src={userData.image as string}
                className="mx-auto rounded-full"
                width={120}
                height={120}
                priority={true}
                alt={userData.name as string}
              />
              <h3 className="custom-h3 flex items-center gap-2 self-center">
                {userData.name}
                {userData && userData.stripeSubscriptionStatus === "active" && (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
              </h3>
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
              Workouts: ({userWorkoutsData ? userWorkoutsData.data?.length : 0})
            </h4>

            <div className="flex justify-around">
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button onClick={() => void followersRefetch()}>
                      Followers
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="flex h-auto flex-col gap-2">
                    <h4 className="custom-h4 text-center">Followers</h4>
                    <Command>
                      <CommandInput placeholder="Search user..." />
                      <CommandList>
                        <ScrollArea className="h-48">
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {followersIsLoading && <Spinner />}
                            {followersIsError && (
                              <Error message={followersError.message} />
                            )}
                            {followersData &&
                              followersData.map((f) => (
                                <CommandItem key={f.id} className="my-1">
                                  <Link
                                    href={`/user/${f.id}`}
                                    className="flex items-center gap-2"
                                  >
                                    {f.image && (
                                      <Image
                                        src={f.image}
                                        className="rounded"
                                        width={40}
                                        height={40}
                                        priority={true}
                                        alt={f.name as string}
                                      />
                                    )}
                                    <span>{f.name}</span>
                                  </Link>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </ScrollArea>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="custom-subtle text-center">
                  {userFollowersData ? userFollowersData.length : 0}
                </p>
              </div>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button onClick={() => void followingRefetch()}>
                      Following
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="flex h-auto flex-col gap-4">
                    <h4 className="custom-h4 text-center">Following</h4>
                    <Command>
                      <CommandInput placeholder="Search user..." />
                      <CommandList>
                        <ScrollArea className="h-48">
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {followingIsLoading && <Spinner />}
                            {followingIsError && (
                              <Error message={followingError.message} />
                            )}
                            {followingData &&
                              followingData.map((f) => (
                                <CommandItem key={f.id} className="my-1">
                                  <Link
                                    href={`/user/${f.id}`}
                                    className="flex items-center gap-2"
                                  >
                                    {f.image && (
                                      <Image
                                        src={f.image}
                                        className="rounded"
                                        width={40}
                                        height={40}
                                        priority={true}
                                        alt={f.name as string}
                                      />
                                    )}
                                    <span>{f.name}</span>
                                  </Link>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </ScrollArea>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="custom-subtle text-center">
                  {userFollowingData ? userFollowingData.length : 0}
                </p>
              </div>
            </div>

            <h4 className="custom-h4 self-center">Workout History</h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
              {userWorkoutsData.data &&
                userWorkoutsData.data.map((w, i) => (
                  <WorkoutBox
                    key={i}
                    id={w.id}
                    name={w.name}
                    createdAt={w.createdAt}
                    exercises={w.exercises}
                    copyCount={w.copyCount}
                    userId={session?.id as string}
                    showCopy={
                      userId !== session?.id &&
                      session?.stripeSubscriptionStatus === "active"
                    }
                    showDelete={userId === session?.id}
                  />
                ))}
            </div>
          </UserMenu>
        </>
      ) : (
        <div className="m-4">
          <Head>
            <title>User Not Found</title>
          </Head>
          {userIsLoading && <SkeletonCard length={4} />}
          {userIsError && <Error message={userError.message} />}
        </div>
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

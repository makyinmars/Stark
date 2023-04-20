import type { GetServerSidePropsContext } from "next";
import Spinner from "src/components/common/spinner";

import UserMenu from "src/components/common/user-menu";
import WorkoutBox from "src/components/common/workout-box";
import { api } from "src/utils/api";
import { ssgHelper } from "src/utils/ssg";

const History = () => {
  const { data, isLoading } = api.workout.getAllWorkouts.useQuery();

  const session = api.auth.getUserSession.useQuery();

  return (
    <UserMenu>
      <h2 className="custom-h2 text-center">Workouts History</h2>
      {isLoading && <Spinner />}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
        {data &&
          data.map((w, i) => (
            <WorkoutBox
              key={i}
              id={w.id}
              name={w.name}
              createdAt={w.createdAt}
              exercises={w.exercises}
              copyCount={w.copyCount}
              userId={session?.data?.id as string}
              showCopy={true}
            />
          ))}
      </div>
    </UserMenu>
  );
};

export default History;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssgHelper(context);

  if (session && session.user) {
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
        permanent: false,
      },
    };
  }
};

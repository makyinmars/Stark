import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";

import Spinner from "src/components/common/spinner";
import Error from "src/components/common/error";
import { api } from "src/utils/api";
import { ssgHelper } from "src/utils/ssg";
import UserMenu from "src/components/common/user-menu";
import Head from "next/head";

const WorkoutId = ({
  workoutId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, isError, isLoading, error } =
    api.workout.getWorkoutById.useQuery({
      workoutId: workoutId as string,
    });

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <Error message={error.message} />;
  }

  return (
    <UserMenu>
      <Head>
        <title>{data ? data.name : "Workout"}</title>
      </Head>
      {data && (
        <div className="flex flex-col gap-1">
          <h2 className="custom-h2 text-center">{data.name}</h2>
          <p className="custom-p">Description: {data.description ?? ""}</p>
          {data.notes && <p className="custom-p">Notes: {data.notes}</p>}
          <p className="custom-p">Copy count: {data.copyCount}</p>
        </div>
      )}
    </UserMenu>
  );
};

export default WorkoutId;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssgHelper(context);
  const { workoutId } = context.params as { workoutId: string };

  if (session && session.user) {
    return {
      props: {
        trpcState: ssg.dehydrate(),
        workoutId,
      },
    };
  } else {
    return {
      props: {
        trpcState: ssg.dehydrate(),
        workoutId: null,
      },
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

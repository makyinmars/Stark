import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { api } from "src/utils/api";

import { ssgHelper } from "src/utils/ssg";

const WorkoutId = ({
  workoutId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, isError, isLoading } = api.workout.getWorkoutById.useQuery({
    workoutId: workoutId as string,
  });

  console.log("Data", data)

  return <div>WorkoutId</div>;
};

export default WorkoutId;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssgHelper(context);
  const { workoutId } = context.params as { workoutId: string };

  if (session && session.user) {
    await ssg.auth.getUserSession.prefetch();
    await ssg.workout.getWorkoutById.prefetch({ workoutId });
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

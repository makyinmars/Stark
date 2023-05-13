import type { GetServerSidePropsContext } from "next";
import Head from "next/head";

import UserMenu from "src/components/common/user-menu";
import { ssgHelper } from "src/utils/ssg";
import Exercises from "src/components/common/exercises";

const Exercise = () => {
  return (
    <>
      <Head>
        <title>Exercise</title>
      </Head>
      <UserMenu>
        <h2 className="custom-h2 text-center">Exercise List</h2>
        <Exercises />
      </UserMenu>
    </>
  );
};

export default Exercise;

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
        permanent: false,
      },
    };
  }
};

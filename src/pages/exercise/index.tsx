import type { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Head from "next/head";

import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import { api } from "src/utils/api";
import { ssgHelper } from "src/utils/ssg";
import Exercises from "src/components/common/exercises";

const Exercise = () => {
  const utils = api.useContext();

  const createExercises = api.exercise.createExercises.useMutation();

  const onCreateExercises = async () => {
    try {
      await createExercises.mutateAsync();
    } catch {}
  };

  return (
    <>
      <Head>
        <title>Exercise</title>
      </Head>
      <UserMenu>
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
    await ssg.exercise.getExercisesTypes.prefetch()
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

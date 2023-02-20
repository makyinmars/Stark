import Head from "next/head";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "src/components/ui/button";
import type { GetServerSidePropsContext } from "next";
import { ssgHelper } from "src/utils/ssg";
import { api } from "src/utils/api";

const SignIn = () => {
  const utils = api.useContext();
  const { data: session } = useSession();
  const user = utils.auth.getUserSession.getData();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Head>
        <title>Sign In</title>
      </Head>
      <div className="rounded bg-slate-100 p-4">
        <h2>Sign In</h2>
        {session ? (
          <div>
            <h3>Signed in as: {session.user?.name}</h3>
          </div>
        ) : (
          <div>
            <Button
              onClick={() =>
                void signIn("discord", {
                  callbackUrl: "/",
                })
              }
            >
              Discord
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;

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
        permanent: false,
      },
    };
  }
};

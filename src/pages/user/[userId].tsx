import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Image from "next/image";
import Head from "next/head";

import { ssgHelper } from "src/utils/ssg";
import { api } from "src/utils/api";
import UserMenu from "src/components/common/user-menu";

const User = ({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const utils = api.useContext();

  const user = utils.user.getUserById.getData({ id: userId });

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

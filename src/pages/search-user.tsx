import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { GetServerSidePropsContext } from "next";
import Head from "next/head";

import UserMenu from "src/components/common/user-menu";
import { ssgHelper } from "src/utils/ssg";
import { api } from "src/utils/api";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { Card, CardHeader, CardTitle } from "src/components/ui/card";

const SearchUser = () => {
  const [value, setValue] = useState("");

  const utils = api.useContext();

  const user = utils.auth.getUserSession.getData();

  const { data, refetch } = api.user.getUsersBySearchName.useQuery(
    {
      name: value,
      userId: user && user.id,
    },
    {
      enabled: false,
    }
  );

  const onSearchClick = async () => {
    await refetch({});
  };

  return (
    <>
      <Head>
        <title>User Search</title>
      </Head>
      <UserMenu>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search user"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button className="w-40" onClick={() => void onSearchClick()}>
            Search
          </Button>
        </div>

        {data && data.length > 0 ? (
          <Card>
            {data.map((user, i) => (
              <CardHeader key={i} className="p-2">
                <Link href={`/user/${user.id}`}>
                  <CardTitle className="flex items-center gap-2">
                    {user.image && (
                      <Image
                        width={32}
                        height={12}
                        alt={user.name as string}
                        src={user.image}
                        className="h-auto w-8 rounded"
                      />
                    )}
                    {user.name}
                  </CardTitle>
                </Link>
              </CardHeader>
            ))}
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No users found</CardTitle>
            </CardHeader>
          </Card>
        )}
      </UserMenu>
    </>
  );
};

export default SearchUser;

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

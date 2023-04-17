import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { Fragment } from "react";

import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { api } from "src/utils/api";
import { ssgHelper } from "src/utils/ssg";

const Admin = () => {

  const { data, fetchPreviousPage, hasPreviousPage, isFetchingPreviousPage } =
    api.featureRequest.getFeatureRequests.useInfiniteQuery(
      {
        limit: 5,
      },
      {
        getPreviousPageParam(lastPage) {
          return lastPage.nextCursor;
        },
      }
    );

  return (
    <>
      <Head>
        <title>Admin</title>
      </Head>
      <UserMenu>
        <h1 className="custom-h1 text-center">Admin</h1>
        <h2 className="custom-h2 text-center">Feature Request</h2>
        <Tabs defaultValue="account" className="w-auto">
      <TabsList className="w-full">
        <TabsTrigger value="account" className="w-full">Account</TabsTrigger>
        <TabsTrigger value="password" className="w-full">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Make changes to your account here.
        </p>
        <div className="grid gap-2 py-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="Pedro Duarte" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue="@peduarte" />
          </div>
        </div>
        <div className="flex">
          <Button>Save changes</Button>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Change your password here
        </p>
        <div className="grid gap-2 py-4">
          <div className="space-y-1">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" />
          </div>
        </div>
        <div className="flex">
          <Button>Save password</Button>
        </div>
      </TabsContent>
    </Tabs>
        {data && (
          <div className="flex flex-col gap-1">
            <Button
              onClick={() => void fetchPreviousPage()}
              disabled={!hasPreviousPage || isFetchingPreviousPage}
            >
              {isFetchingPreviousPage
                ? "Loading More..."
                : hasPreviousPage
                  ? "Load More"
                  : "Nothing More to Load"}
            </Button>
            {data.pages.map((page, index) => (
              <Fragment key={page.featureRequests[0]?.id || index}>
                {page.featureRequests.map((item) => (
                  <div
                    key={item.id}
                    className="rounded border border-slate-400 p-2"
                  >
                    <h5 className="custom-h5 text-center">{item.title}</h5>
                    <p>{item.title}</p>
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        )}
      </UserMenu>
    </>
  )
}

export default Admin


export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssgHelper(context);

  if (session && session.user) {

    const user = await ssg.auth.getUserSession.fetch()

    if (user?.role === "ADMIN") {
      return {
        props: {
          trpcState: ssg.dehydrate(),
        },
      };
    }
    return {
      props: {
        trpcState: ssg.dehydrate(),
      },
      redirect: {
        destination: "/",
        permanent: false,
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

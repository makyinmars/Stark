import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { Fragment } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Textarea } from "src/components/ui/textarea";
import { useToast } from "src/hooks/useToast";
import { api } from "src/utils/api";
import { ssgHelper } from "src/utils/ssg";

type FeatureRequestInputs = {
  title: string;
  description: string;
};

const FeatureRequest = () => {
  const utils = api.useContext();

  const { register, handleSubmit, reset } = useForm<FeatureRequestInputs>();

  const { toast } = useToast();

  const createFeatureRequest =
    api.featureRequest.createFeatureRequest.useMutation({
      onMutate: () => {
        toast({
          title: "Creating Feature Request",
          variant: "info",
          description: "Please wait...",
        });
      },
      onSettled: () => {
        toast({
          title: "Feature Request Created",
          variant: "success",
        });
      },
      onError: (error) => {
        toast({
          title: "Feature Request Creation Failed",
          variant: "success",
          description: error.shape?.message,
        });
      },
      onSuccess: async () => {
        await utils.featureRequest.getFeatureRequests.invalidate();
        reset();
      },
    });

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

  const onSubmit: SubmitHandler<FeatureRequestInputs> = async (data) => {
    try {
      await createFeatureRequest.mutateAsync(data);
    } catch {}
  };

  return (
    <>
      <Head>
        <title>Feature Request</title>
      </Head>
      <UserMenu>
        <h1 className="custom-h1 text-center">Feature Request</h1>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <Input placeholder="Title" {...register("title")} />
          <Textarea
            placeholder="Description"
            {...register("description")}
            cols={30}
            rows={20}
          />
          <Button type="submit">Submit</Button>
        </form>
        <h2 className="custom-h2 text-center">Feature Request Items</h2>
        {data && (
          <div className="flex flex-col gap-1">
            <Button
              onClick={() => void fetchPreviousPage()}
              disabled={!hasPreviousPage || isFetchingPreviousPage}
            >
              {isFetchingPreviousPage
                ? "Loading more..."
                : hasPreviousPage
                ? "Load More"
                : "Nothing more to load"}
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
  );
};

export default FeatureRequest;

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

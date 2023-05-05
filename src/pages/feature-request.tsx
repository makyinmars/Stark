import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useForm, type SubmitHandler } from "react-hook-form";
import SkeletonCard from "src/components/common/skeleton-card";

import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Input } from "src/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
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
          description: "Please wait...",
        });
      },
      onSettled: () => {
        toast({
          title: "Feature Request Created",
        });
      },
      onError: (error) => {
        toast({
          title: "Feature Request Creation Failed",
          description: error.shape?.message,
        });
      },
      onSuccess: async () => {
        await utils.featureRequest.getFeatureRequests.invalidate();
        reset();
      },
    });

  const frCompletedQuery = api.featureRequest.getFeatureRequests.useQuery({
    showApproved: true,
    status: "COMPLETED",
  });

  const frInProgressQuery = api.featureRequest.getFeatureRequests.useQuery({
    showApproved: true,
    status: "IN_PROGRESS",
  });

  const frNotStartedQuery = api.featureRequest.getFeatureRequests.useQuery({
    showApproved: true,
    status: "NOT_STARTED",
  });

  const onSubmit: SubmitHandler<FeatureRequestInputs> = async (data) => {
    try {
      await createFeatureRequest.mutateAsync(data);
    } catch { }
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
        <Tabs defaultValue="in_progress" className="w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="not_started">Not Started</TabsTrigger>
          </TabsList>
          {frCompletedQuery.isLoading ? (
            <SkeletonCard length={2} />
          ) : (
            <>
              <TabsContent value="completed">
                {frCompletedQuery &&
                  frCompletedQuery.data?.map((fr) => (
                    <Card key={fr.id}>
                      <CardHeader className="flex flex-row items-center gap-1">
                        <div className="flex flex-col items-center md:w-20">
                          <ArrowBigUp className="h-16 w-8" />
                          <span className="text-2xl">{fr.votes}</span>
                          <ArrowBigDown className="h-16 w-8" />
                        </div>
                        <div>
                          <CardTitle>{fr.title}</CardTitle>
                          <CardDescription>{fr.description}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </TabsContent>
              <TabsContent value="in_progress">
                {frInProgressQuery &&
                  frInProgressQuery.data?.map((fr) => (
                    <Card key={fr.id}>
                      <CardHeader className="flex flex-row items-center gap-1">
                        <div className="flex flex-col items-center md:w-20">
                          <ArrowBigUp className="h-16 w-8" />
                          <span className="text-2xl">{fr.votes}</span>
                          <ArrowBigDown className="h-16 w-8" />
                        </div>
                        <div>
                          <CardTitle>{fr.title}</CardTitle>
                          <CardDescription>{fr.description}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </TabsContent>
              <TabsContent value="not_started" className="flex flex-col gap-2">
                {frNotStartedQuery &&
                  frNotStartedQuery.data?.map((fr) => (
                    <Card key={fr.id}>
                      <CardHeader className="flex flex-row items-center gap-1">
                        <div className="flex flex-col items-center md:w-20">
                          <ArrowBigUp className="h-16 w-8" />
                          <span className="text-2xl">{fr.votes}</span>
                          <ArrowBigDown className="h-16 w-8" />
                        </div>
                        <div>
                          <CardTitle>{fr.title}</CardTitle>
                          <CardDescription>{fr.description}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </TabsContent>
            </>
          )}
        </Tabs>
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

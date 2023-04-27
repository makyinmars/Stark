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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "src/components/ui/accordion";

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
        <Card>
          <CardHeader>
            <CardTitle>{data.name}</CardTitle>
            {data.description && (
              <CardDescription>Description: {data.description}</CardDescription>
            )}
            {data.notes && (
              <CardDescription>Notes: {data.notes}</CardDescription>
            )}
            <CardDescription>Copy Count: {data.copyCount}</CardDescription>
          </CardHeader>
          {data.exercises && (
            <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {data.exercises.map((exercise) => (
                <Card key={exercise.id}>
                  <CardHeader>
                    <CardTitle>{exercise.name}</CardTitle>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          <p className="text-sm">{exercise.name} Information</p>
                        </AccordionTrigger>
                        <AccordionContent>
                          <CardDescription className="flex flex-col gap-1">
                            <div>Difficulty: {exercise.difficulty}</div>
                            <div>Equipment: {exercise.equipment}</div>
                            <div>Instructions: {exercise.instructions}</div>
                          </CardDescription>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardHeader>
                  {exercise.set.length > 0 && (
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex justify-around font-bold">
                        <div>Reps</div>
                        <div>Weight</div>
                      </div>
                      {exercise.set.map((set, j) => (
                        <div
                          key={j}
                          className="grid grid-cols-2 justify-items-center"
                        >
                          <div>{set.reps}</div>
                          <div>{set.weight}</div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </CardContent>
          )}
        </Card>
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

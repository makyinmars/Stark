import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useEffect, useState } from "react";

import Error from "src/components/common/error";
import { api } from "src/utils/api";
import { ssgHelper } from "src/utils/ssg";
import UserMenu from "src/components/common/user-menu";
import Head from "next/head";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import Chart from "src/components/common/chart";
import type { ChartData } from "src/utils/type";
import { Alert, AlertDescription, AlertTitle } from "src/components/ui/alert";
import { Terminal } from "lucide-react";
import SkeletonCard from "src/components/common/skeleton-card";

const WorkoutId = ({
  workoutId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, isError, isLoading, error } =
    api.workout.getWorkoutById.useQuery({
      workoutId: workoutId as string,
    });

  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (data) {
      const chartData = data.exercises.map((exercise) => {
        const volume = exercise.set.reduce((acc, set) => {
          return acc + set.reps * set.weight * exercise.set.length;
        }, 0);
        return {
          name: exercise.name,
          volume,
        };
      });

      setChartData(chartData);
    }
  }, [data]);

  if (isError) {
    return <Error message={error.message} />;
  }

  return (
    <UserMenu>
      <Head>
        <title>{data ? data.name : "Workout"}</title>
      </Head>
      {isLoading && <SkeletonCard length={5} />}
      {data && <h2 className="custom-h2 text-center">{data.name}</h2>}
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
                    <CardDescription className="flex flex-col gap-1">
                      <div>Difficulty: {exercise.difficulty}</div>
                      <div>Equipment: {exercise.equipment}</div>
                      <div>Instructions: {exercise.instructions}</div>
                    </CardDescription>
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
          <CardFooter></CardFooter>
        </Card>
      )}
      <div className="flex flex-col items-center gap-4">
        <Chart chartData={chartData} />
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>What is volume?</AlertTitle>
          <AlertDescription>
            <span className="font-bold">
              {`"`}Volume{`"`}
            </span>{" "}
            in a workout is the total work done over a period of time, measured
            by multiplying sets, reps, and weight. For example, 3 sets of 10
            reps with 50 pounds is a volume of 1,500 pounds. It can be used to
            track progress and adjust workout intensity, but other factors like
            exercise selection, rest periods, and intensity are also important.
          </AlertDescription>
        </Alert>
      </div>
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

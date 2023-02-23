import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

import { getTimeOfDay } from "src/utils/date";
import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import { useStopwatch } from "src/hooks/useStopwatch";

const CreateWorkout = () => {
  const { time, isActive, toggle } = useStopwatch();

  // convert time to hours, minutes, seconds
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor((time % 3600) % 60);

  useEffect(() => {
    if (!isActive) {
      toggle();
    }
  }, [isActive, toggle]);

  return (
    <>
      <Head>
        <title>Create Workout</title>
      </Head>
      <UserMenu>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 custom-h3">
              {getTimeOfDay()} Workout
              <MoreHorizontal size={16} />
            </h2>
            <p className="text-base custom-subtle">
              {hours}:{minutes}:{seconds}
            </p>
            <p className="custom-subtle">Notes</p>
          </div>
          <Button className="self-start h-8" variant="destructive">
            Finish
          </Button>
        </div>
        <Button>Add Exercise</Button>
        <Link href="/dashboard">
          <Button className="w-full">Cancel Workout</Button>
        </Link>
      </UserMenu>
    </>
  );
};

export default CreateWorkout;

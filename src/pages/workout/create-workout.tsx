import Head from "next/head";
import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { getTimeOfDay } from "src/utils/date";
import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";

const CreateWorkout = () => {
  const [timer, setTimer] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

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
              {timer.getMinutes()}: {timer.getSeconds()}
            </p>
            <p className="custom-subtle">Notes</p>
          </div>
          <Button className="self-start h-8" variant="destructive">
            Finish
          </Button>
        </div>
        <Button>Add Exercise</Button>
        <Button>Cancel Workout</Button>
      </UserMenu>
    </>
  );
};

export default CreateWorkout;

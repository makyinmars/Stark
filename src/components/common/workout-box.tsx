import { Dumbbell, MoreHorizontal, Trash, History, Copy } from "lucide-react";
import { useRouter } from "next/router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { formatDate } from "src/utils/date";
import { Button } from "../ui/button";
import { api } from "src/utils/api";
import { useToast } from "src/hooks/useToast";

interface WorkoutsProps {
  id: string;
  createdAt: Date;
  name: string;
  exercises: {
    name: string;
  }[];
  copyCount: number;
  userId: string;
  showCopy?: boolean;
}

const WorkoutBox = ({
  id,
  createdAt,
  name,
  exercises,
  copyCount,
  userId,
  showCopy,
}: WorkoutsProps) => {
  const router = useRouter();
  const utils = api.useContext();
  const { toast } = useToast();

  const copyWorkoutById = api.workout.copyWorkoutById.useMutation({
    onSuccess: async () => {
      await utils.workout.getWorkoutsByUserId.invalidate({ userId });
    },
  });

  const deleteWorkoutById = api.workout.deleteWorkoutById.useMutation({
    onSuccess: async () => {
      await utils.workout.getWorkoutsByUserId.invalidate({ userId });
    },
  });

  const onCopyWorkoutById = async (workoutId: string) => {
    try {
      const copiedWorkout = await copyWorkoutById.mutateAsync({
        workoutId,
        userId,
      });

      if (copiedWorkout) {
        toast({
          title: "Workout Copied",
          description:
            "This workout has been copied and added to your workouts",
        });
      }
    } catch {}
  };

  const onDeleteWorkoutById = async (workoutId: string) => {
    try {
      const deletedWorkout = await deleteWorkoutById.mutateAsync({ workoutId });

      if (deletedWorkout) {
        toast({
          title: "Workout Deleted",
          description: "This workout has been deleted",
        });
      }
    } catch {}
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded border border-gray-50 p-2">
        <h5 className="custom-h5 flex items-center justify-between">
          {name}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="flex items-center justify-around gap-2"
                onClick={() => void router.push(`/workout/${id}`)}
              >
                <Dumbbell size={14} />
                <p>View Workout</p>
              </DropdownMenuItem>
              {router.pathname.includes("/user") && showCopy && (
                <DropdownMenuItem
                  className="flex items-center justify-around gap-2"
                  onClick={() => void onCopyWorkoutById(id)}
                >
                  <Copy size={14} /> Copy Workout
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="flex items-center justify-around gap-2"
                onClick={() => void onDeleteWorkoutById(id)}
              >
                <Trash size={14} />
                <p>Delete Workout</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </h5>
        {exercises.map((e, j) => (
          <p className="custom-subtle" key={j}>
            {e.name}
          </p>
        ))}
        <p className="custom-subtle flex items-center gap-2">
          <History size={16} /> {formatDate("MMM D, YYYY", createdAt)}
        </p>
      </div>
    </div>
  );
};

export default WorkoutBox;

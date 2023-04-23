import { Dumbbell, Copy, MoreHorizontal, Trash, History } from "lucide-react";
import { useRouter } from "next/router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { formatDate } from "src/utils/date";
import { Button } from "src/components/ui/button";
import { api } from "src/utils/api";
import { useToast } from "src/hooks/useToast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
  showDelete?: boolean;
}

const WorkoutBox = ({
  id,
  createdAt,
  name,
  exercises,
  copyCount,
  userId,
  showCopy,
  showDelete,
}: WorkoutsProps) => {
  const router = useRouter();
  const utils = api.useContext();
  const { toast } = useToast();

  const copyWorkoutById = api.workout.copyWorkoutById.useMutation({
    // Check this as an example:
    // @link: https://github.com/calcom/cal.com/blob/main/apps/web/pages/availability/index.tsx#L22
    onError: (err) => {
      if (err) {
        toast({
          title: "Error",
          variant: "destructive",
          description: err.message,
        });
      }
    },
    onSuccess: async () => {
      await utils.workout.getWorkoutsByUserId.invalidate({ userId });
      toast({
        title: "Workout Copied",
        description: "This workout has been copied and added to your workouts",
      });
    },
  });

  const deleteWorkoutById = api.workout.deleteWorkoutById.useMutation({
    onSettled: async () => {
      await utils.workout.getWorkoutsByUserId.invalidate({ userId });
    },
    onSuccess: (variables) => {
      if (variables) {
        toast({
          title: "Workout Deleted",
          description: `Workout: ${variables.name} has been deleted`,
        });
      }
    },
  });

  const onCopyWorkoutById = async (workoutId: string) => {
    try {
      await copyWorkoutById.mutateAsync({
        workoutId,
        userId,
      });
    } catch {}
  };

  const onDeleteWorkoutById = async (workoutId: string) => {
    try {
      await deleteWorkoutById.mutateAsync({ workoutId });
    } catch {}
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
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
                {(router.pathname.includes("/dashboard") ||
                  router.pathname.includes("/history") ||
                  showDelete) && (
                  <DropdownMenuItem
                    className="flex items-center justify-around gap-2"
                    onClick={() => void onDeleteWorkoutById(id)}
                  >
                    <Trash size={14} />
                    <p>Delete Workout</p>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {exercises.map((e, j) => (
          <p className="custom-subtle" key={j}>
            {e.name}
          </p>
        ))}
        <p className="flex items-center gap-2 custom-subtle">
          <History size={16} /> {formatDate("MMM D, YYYY", createdAt)}
        </p>
        <p className="flex items-center gap-2 custom-subtle">
          <Copy size={16} /> Copied: {copyCount}
        </p>
      </CardContent>
    </Card>
  );
};

export default WorkoutBox;

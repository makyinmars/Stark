import { XCircle } from "lucide-react";
import { type SubmitHandler, useFieldArray, useForm } from "react-hook-form";

import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { useExerciseSetStore, useSetStore } from "src/utils/zustand";

interface CreateSetProps {
  exerciseId: string;
}

interface SetInputs {
  exerciseId: string;
  sets: {
    weight: number;
    reps: number;
    time: number;
    rest: number;
  }[];
}

const CreateSet = ({ exerciseId }: CreateSetProps) => {
  const { addSet, removeSet } = useSetStore();
  const { addSetsToExerciseSet } = useExerciseSetStore();

  const { register, control, handleSubmit } = useForm<SetInputs>({
    defaultValues: {
      exerciseId: exerciseId,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "sets",
    control,
  });

  const onRemoveSet = (index: number, setId: string) => {
    removeSet(setId);
    remove(index);
  };

  const onSubmit: SubmitHandler<SetInputs> = (data) => {
    const { sets } = data;

    sets.forEach((set, i) => {
      if (set.reps > 0 && set.weight > 0) {
        addSet({
          exerciseId: exerciseId,
          reps: set.reps,
          weight: set.weight,
          rest: set.rest,
          time: set.time,
          id: `${exerciseId}-${i}`,
        });
      }
    });

    // Add exerciseId to each set
    const setsWithExerciseId = sets.map((set, i) => ({
      ...set,
      exerciseId: exerciseId,
      id: `${exerciseId}-${i}`,
    }));

    addSetsToExerciseSet(exerciseId, setsWithExerciseId);
  };

  return (
    <div>
      <div className="flex items-center justify-around">
        <p>Set</p>
        <p>Reps</p>
        <p>Weight</p>
        <div />
        <div />
        <div />
      </div>
      <div className="flex flex-col gap-2">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          {fields.map((set, index) => (
            <div className="flex items-center justify-around" key={set.id}>
              <p>{index + 1}</p>
              <Input
                type="number"
                className="h-6 w-12 p-0 text-center"
                {...register(`sets.${index}.reps` as const, {
                  required: true,
                  valueAsNumber: true,
                })}
              />
              <Input
                type="number"
                className="h-6 w-12 p-0 text-center"
                {...register(`sets.${index}.weight` as const, {
                  required: true,
                  valueAsNumber: true,
                })}
              />
              <Button
                variant="ghost"
                className="w-10 rounded-full p-0"
                onClick={() => onRemoveSet(index, set.id)}
              >
                <XCircle className="text-red-600" />
              </Button>
            </div>
          ))}
          <Button variant="beneficial">Complete</Button>
        </form>

        <Button
          className="w-full"
          onClick={() =>
            append({
              reps: 0,
              weight: 0,
              time: 0,
              rest: 0,
            })
          }
        >
          Add New Set
        </Button>
      </div>
    </div>
  );
};

export default CreateSet;

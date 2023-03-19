import { Check, XCircle } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { useSetState } from "src/utils/zustand";

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
  const { addSet, removeSet, sets } = useSetState();

  const { register, control } = useForm<SetInputs>({
    defaultValues: {
      exerciseId: exerciseId,
      sets: [{ weight: 0, reps: 0, rest: 0, time: 0 }],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    name: "sets",
    control,
  });

  const onRemoveSet = (index: number, setId: string) => {
    removeSet(setId);
    remove(index);
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
        {fields.map((set, index) => (
          <div
            className={`flex items-center justify-around ${
              sets && sets.find((s) => s.id === set.id)
                ? "rounded bg-slate-300"
                : ""
            }`}
            key={set.id}
          >
            <p>{index + 1}</p>
            <Input
              type="number"
              defaultValue={set.reps ?? 0}
              className="w-12 h-6 p-0 text-center"
              {...register(`sets.${index}.reps` as const, {
                required: true,
                valueAsNumber: true,
              })}
            />
            <Input
              type="number"
              defaultValue={set.weight ?? 0}
              className="w-12 h-6 p-0 text-center"
              {...register(`sets.${index}.weight` as const, {
                required: true,
                valueAsNumber: true,
              })}
            />
            <div>
              <Button
                variant="ghost"
                className="w-10 p-0 rounded-full"
                onClick={() => addSet({ ...set, exerciseId, id: set.id })}
              >
                <Check className="text-green-600" />
              </Button>
              <Button
                variant="ghost"
                className="w-10 p-0 rounded-full"
                onClick={() => onRemoveSet(index, set.id)}
              >
                <XCircle className="text-red-600" />
              </Button>
            </div>
          </div>
        ))}
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
          Add Set
        </Button>
      </div>
    </div>
  );
};

export default CreateSet;

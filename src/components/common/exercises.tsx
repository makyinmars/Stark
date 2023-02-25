import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "src/utils/tailwindcss";
import { api } from "src/utils/api";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";
import { Button } from "src/components/ui/button";

const Exercises = () => {
  const utils = api.useContext();
  const exercises = utils.exercise.getExercises.getData();
  const exercisesTypes = utils.exercise.getExercisesTypes.getData();

  const [open, setOpen] = useState(false);
  const [exerciseValue, setExerciseValue] = useState("");
  const [typeValue, setTypeValue] = useState("");

  return (
    <div className="flex flex-col gap-4">
      {exercises && exercisesTypes ? (
        <div className="flex flex-col gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {typeValue
                  ? exercisesTypes.find((type) => type === typeValue)
                  : "Select framework..."}
                {typeValue && <span className="capitalize">{typeValue}</span>}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search framework..." />
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup className="w-full">
                  {exercisesTypes.map((type) => (
                    <CommandItem
                      key={type}
                      onSelect={(currentValue) => {
                        setTypeValue(
                          currentValue === typeValue ? "" : currentValue
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          typeValue === type ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {type}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Command>
            <CommandInput placeholder="Search exercise..." />
            <CommandEmpty>No exercises found</CommandEmpty>
            <CommandGroup>
              {exercises
                .filter((exercise) => exercise.type.toLowerCase() === typeValue)
                .map((exercise) => (
                  <CommandItem
                    key={exercise.name}
                    onSelect={(currentValue) => {
                      setExerciseValue(
                        currentValue === exerciseValue ? "" : currentValue
                      );
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        exerciseValue === exercise.name
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {exercise.name} - {exercise.type}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default Exercises;

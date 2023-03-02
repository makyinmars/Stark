import { useState } from "react";
import { Check, ChevronsUpDown, Info, Minus, Plus } from "lucide-react";
import { useRouter } from "next/router";
import Image from "next/image";

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
import { ScrollArea } from "src/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog";
import { useExerciseState } from "src/utils/zustand";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";

const Exercises = () => {
  const router = useRouter();
  const utils = api.useContext();
  const exercises = utils.exercise.getExercises.getData();
  const exercisesTypes = utils.exercise.getExercisesByTypes.getData();
  const exercisesMuscles = utils.exercise.getExercisesByMuscles.getData();

  const [openType, setOpenType] = useState(false);
  const [openMuscle, setOpenMuscle] = useState(false);

  const [exerciseValue, setExerciseValue] = useState("");
  const [typeValue, setTypeValue] = useState("");
  const [muscleValue, setMuscleValue] = useState("");

  const isCreateWorkoutPath = router.pathname.includes(
    "/workout/create-workout"
  );
  const {
    addExercise,
    removeExercise,
    exercises: exercisesState,
  } = useExerciseState();

  return (
    <div className="flex flex-col gap-4">
      {exercises && exercisesTypes && exercisesMuscles ? (
        <div className="flex flex-col gap-4">
          <Popover open={openType} onOpenChange={setOpenType}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openType}
                className="w-full justify-between"
              >
                {typeValue
                  ? exercisesTypes.find(
                      (type) => type.toLowerCase() === typeValue
                    )
                  : "Select body type..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search body type..." />
                <CommandEmpty>No type found.</CommandEmpty>
                <CommandGroup className="w-full">
                  {exercisesTypes.map((type) => (
                    <CommandItem
                      key={type}
                      onSelect={(currentValue) => {
                        setTypeValue(
                          currentValue === typeValue ? "" : currentValue
                        );
                        setOpenType(false);
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
          <Popover open={openMuscle} onOpenChange={setOpenMuscle}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openMuscle}
                className="w-full justify-between"
              >
                {muscleValue
                  ? exercisesMuscles.find(
                      (muscle) => muscle.toLowerCase() === muscleValue
                    )
                  : "Select body muscle..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search body muscle..." />
                <CommandEmpty>No muscle exercises found.</CommandEmpty>
                <CommandGroup className="w-full">
                  {exercisesMuscles.map((muscle) => (
                    <CommandItem
                      key={muscle}
                      onSelect={(currentValue) => {
                        setMuscleValue(
                          currentValue === muscleValue ? "" : currentValue
                        );
                        setOpenMuscle(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          muscleValue === muscle ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {muscle}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Command className="rounded border border-gray-200">
            <CommandInput placeholder="Search exercise..." />
            <CommandEmpty>No exercises found</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[560px]">
                {exercises
                  .filter((exercise) => {
                    if (typeValue && muscleValue) {
                      return (
                        exercise.type.toLowerCase() === typeValue &&
                        exercise.muscle.toLowerCase() === muscleValue
                      );
                    } else if (typeValue) {
                      return exercise.type.toLowerCase() === typeValue;
                    } else if (muscleValue) {
                      return exercise.muscle.toLowerCase() === muscleValue;
                    } else {
                      return exercise;
                    }
                  })
                  .map((exercise) => (
                    <CommandItem
                      key={exercise.name}
                      onSelect={(currentValue) => {
                        setExerciseValue(
                          currentValue === exerciseValue ? "" : currentValue
                        );
                      }}
                      className="flex justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        {exerciseValue === exercise.name && (
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              exerciseValue === exercise.name
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        )}
                        {exercise.image ? (
                          <Image
                            src={exercise.image}
                            width={95}
                            height={70}
                            alt={exercise.name}
                            loading="lazy"
                            className="h-auto w-24 rounded"
                          />
                        ) : (
                          <p className="flex h-14 w-24 items-center justify-center rounded bg-slate-300">
                            {exercise.name.charAt(0)}
                          </p>
                        )}
                        <div className="flex items-center gap-1">
                          <p>{exercise.name}</p>

                          <Dialog>
                            <DialogTrigger>
                              <Info className="h-4 w-4" />
                            </DialogTrigger>
                            <DialogContent className="flex flex-col gap-2">
                              <DialogHeader>
                                <DialogTitle className="text-center">
                                  {exercise.name}
                                </DialogTitle>
                                {exercise.image && (
                                  <Image
                                    src={exercise.image}
                                    width={95}
                                    height={70}
                                    alt={exercise.name}
                                    loading="lazy"
                                    className="mx-auto h-full w-full rounded"
                                  />
                                )}
                                <DialogDescription>
                                  <span className="font-semibold">
                                    Instructions:
                                  </span>{" "}
                                  {exercise.instructions}
                                </DialogDescription>
                                <DialogDescription>
                                  <span className="font-semibold">
                                    Equipment:
                                  </span>{" "}
                                  {exercise.equipment}
                                </DialogDescription>
                                <DialogDescription>
                                  <span className="font-semibold">
                                    Difficulty:
                                  </span>{" "}
                                  {exercise.difficulty}
                                </DialogDescription>
                                <DialogDescription>
                                  <span className="font-semibold">Muscle:</span>{" "}
                                  {exercise.muscle}
                                </DialogDescription>
                                <DialogDescription>
                                  <span className="font-semibold">Type:</span>{" "}
                                  {exercise.type}
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      {isCreateWorkoutPath && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {exercisesState.length > 0 &&
                              exercisesState.find(
                                (e) => e.id === exercise.id
                              ) ? (
                                <Button
                                  className="w-10 rounded-full p-0"
                                  onClick={() => removeExercise(exercise)}
                                >
                                  <Minus className="h-4 w-4" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="w-10 rounded-full p-0"
                                  onClick={() => addExercise(exercise)}
                                >
                                  <Plus className="h-4 w-4" />
                                  <span className="sr-only">Add</span>
                                </Button>
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              {exercisesState.length > 0 &&
                              exercisesState.find(
                                (e) => e.id === exercise.id
                              ) ? (
                                <p>Remove from workout</p>
                              ) : (
                                <p>Add to workout</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CommandItem>
                  ))}
              </ScrollArea>
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

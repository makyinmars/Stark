import { prisma } from "src/server/db";
import { seedExercises } from "src/data/exercises";

const main = async () => {
  // Seed exercises
  for (const exercise of seedExercises) {
    const newExercise = await prisma.exercise.create({
      data: exercise,
    });

    console.log(`Created exercise: ${newExercise.name}`);
  }
};

try {
  await main();
  await prisma.$disconnect();
} catch (e) {
  console.error(e);
  process.exit(1);
}

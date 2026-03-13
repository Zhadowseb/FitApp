import { runningRepository } from "../Repository";
import { withTransaction } from "./shared";

export async function getRunSets(db, { workoutId, type }) {
  return runningRepository.getRunSets(db, { workoutId, type });
}

export async function getOrderedRunSetsForWorkout(db, workoutId) {
  return runningRepository.getOrderedRunSetsForWorkout(db, workoutId);
}

export async function addRunSet(db, { workoutId, type }) {
  const row = await runningRepository.countActiveRunSets(db, {
    workoutId,
    type,
  });

  await runningRepository.createRunSet(db, {
    workoutId,
    type,
    setNumber: (row?.count ?? 0) + 1,
  });
}

export async function updateRunSetField(db, { runId, field, value }) {
  await runningRepository.updateRunSetField(db, { runId, field, value });
}

export async function updateRunSetDone(db, { runId, done }) {
  await runningRepository.updateRunSetDone(db, { runId, done });
}

export async function renumberWorkingRunSets(db, { workoutId, type }) {
  const rows = await runningRepository.getRunSets(db, { workoutId, type });

  let counter = 1;
  for (const row of rows) {
    if (!row.is_pause) {
      await runningRepository.updateRunSetNumber(db, {
        runId: row.Run_id,
        setNumber: counter,
      });
      counter += 1;
    }
  }
}

export async function deleteRunSet(db, { runId, workoutId, type }) {
  await withTransaction(db, async () => {
    await runningRepository.deleteRunSetById(db, runId);
    await renumberWorkingRunSets(db, { workoutId, type });
  });
}

export async function toggleRunSetPause(
  db,
  { runId, workoutId, type, isPause }
) {
  await withTransaction(db, async () => {
    await runningRepository.updateRunSetPause(db, { runId, isPause });
    await renumberWorkingRunSets(db, { workoutId, type });
  });
}

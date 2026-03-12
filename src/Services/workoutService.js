import { workoutRepository } from "../Repository";
import { withTransaction } from "./shared";

export async function refreshWorkoutHierarchyCompletionByIds(
  db,
  { dayId, microcycleId, mesocycleId }
) {
  if (dayId) {
    await workoutRepository.updateDayDoneFromWorkouts(db, dayId);
  }

  if (microcycleId) {
    await workoutRepository.updateMicrocycleDoneFromWorkouts(db, microcycleId);
  }

  if (mesocycleId) {
    await workoutRepository.updateMesocycleDoneFromMicrocycles(db, mesocycleId);
  }
}

export async function refreshWorkoutHierarchyCompletion(db, workoutId) {
  const ids = await workoutRepository.getWorkoutHierarchyIds(db, workoutId);

  if (!ids) {
    return;
  }

  await refreshWorkoutHierarchyCompletionByIds(db, {
    dayId: ids.day_id,
    microcycleId: ids.microcycle_id,
    mesocycleId: ids.mesocycle_id,
  });
}

export async function getWorkoutTimerState(db, workoutId) {
  return workoutRepository.getWorkoutTimerState(db, workoutId);
}

export async function persistWorkoutTimerState(
  db,
  { workoutId, timerStart, elapsedTime }
) {
  await workoutRepository.persistWorkoutTimerState(db, {
    workoutId,
    timerStart,
    elapsedTime,
  });
}

export async function updateWorkoutElapsedTime(
  db,
  { workoutId, elapsedTime }
) {
  await workoutRepository.updateWorkoutElapsedTime(db, {
    workoutId,
    elapsedTime,
  });
}

export async function getWorkoutOriginalStartTime(db, workoutId) {
  return workoutRepository.getWorkoutOriginalStartTime(db, workoutId);
}

export async function setWorkoutOriginalStartTime(
  db,
  { workoutId, startTime }
) {
  await workoutRepository.setWorkoutOriginalStartTime(db, {
    workoutId,
    startTime,
  });
}

export async function getWorkoutStartTimestamp(db, workoutId) {
  return workoutRepository.getWorkoutStartTimestamp(db, workoutId);
}

export async function setWorkoutStartTimestamp(db, { workoutId, startTs }) {
  await workoutRepository.setWorkoutStartTimestamp(db, {
    workoutId,
    startTs,
  });
}

export async function stopWorkoutStopwatch(
  db,
  { workoutId, durationSeconds }
) {
  await workoutRepository.stopWorkoutStopwatch(db, {
    workoutId,
    durationSeconds,
  });
}

export async function setWorkoutDone(db, { workoutId, done }) {
  await withTransaction(db, async () => {
    await workoutRepository.updateWorkoutDone(db, {
      workoutId,
      done,
    });

    await refreshWorkoutHierarchyCompletion(db, workoutId);
  });
}

export async function resetWorkoutState(db, workoutId) {
  await withTransaction(db, async () => {
    await workoutRepository.resetWorkoutStateFields(db, workoutId);
    await refreshWorkoutHierarchyCompletion(db, workoutId);
  });
}

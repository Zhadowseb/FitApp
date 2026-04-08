import { formatDate, parseCustomDate } from "../Utils/dateUtils";
import {
  programRepository,
  runningRepository,
  weightliftingRepository,
  workoutRepository,
} from "../Repository";
import * as workoutService from "./workoutService";
import { withTransaction } from "./shared";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function formatDisplayNumber(value) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function calculateBrzyckiOneRepMax(weight, reps) {
  const denominator = 1.0278 - 0.0278 * reps;

  if (denominator <= 0) {
    return null;
  }

  return weight / denominator;
}

function formatProgramBestDisplay({ weight, reps, estimatedOneRepMax }) {
  const setText = `${reps} x ${formatDisplayNumber(weight)} kg`;

  if (reps === 1) {
    return {
      setDisplayValue: setText,
      rmDisplayValue: `${formatDisplayNumber(weight)} kg`,
      isEstimated: false,
      estimatedLabel: null,
    };
  }

  return {
    setDisplayValue: setText,
    rmDisplayValue: `${formatDisplayNumber(Math.round(estimatedOneRepMax))} kg`,
    isEstimated: true,
    estimatedLabel: "estimated",
  };
}

async function cloneWorkoutContents(db, { sourceWorkoutId, targetWorkoutId }) {
  const exercises = await weightliftingRepository.getExercisesByWorkoutId(
    db,
    sourceWorkoutId
  );

  for (const exercise of exercises) {
    const exerciseResult = await weightliftingRepository.createExercise(db, {
      workoutId: targetWorkoutId,
      exerciseName: exercise.exercise_name,
      sets: exercise.sets,
      visibleColumns: exercise.visible_columns,
      note: exercise.note,
      done: 0,
    });

    const sets = await weightliftingRepository.getSetsByExercise(
      db,
      exercise.exercise_id
    );

    for (const set of sets) {
      await weightliftingRepository.createSet(db, {
        setNumber: set.set_number,
        exerciseId: exerciseResult.lastInsertRowId,
        date: set.date,
        personalRecord: set.personal_record,
        pause: set.pause,
        rpe: set.rpe,
        weight: set.weight,
        rmPercentage: set.rm_percentage,
        reps: set.reps,
        done: 0,
        failed: 0,
        amrap: set.amrap,
        note: set.note,
      });
    }
  }

  const runSets = await runningRepository.getOrderedRunSetsForWorkout(
    db,
    sourceWorkoutId
  );

  for (const runSet of runSets) {
    await runningRepository.createRunSet(db, {
      workoutId: targetWorkoutId,
      type: runSet.type,
      setNumber: runSet.set_number,
      isPause: runSet.is_pause,
      distance: runSet.distance,
      pace: runSet.pace,
      time: runSet.time,
      heartrate: runSet.heartrate,
      done: 0,
    });
  }
}

function formatSetCountLabel(count) {
  return count === 1 ? "1 set" : `${count} sets`;
}

function formatExerciseRepSummary(exercise, exerciseSets) {
  const numericSetCount = Number(exercise.sets);
  const setCount =
    Number.isFinite(numericSetCount) && numericSetCount > 0
      ? numericSetCount
      : exerciseSets.length;
  const validReps = exerciseSets
    .map((set) => Number(set.reps))
    .filter((reps) => Number.isFinite(reps) && reps > 0);

  if (validReps.length === 0) {
    return setCount > 0 ? formatSetCountLabel(setCount) : null;
  }

  const firstReps = validReps[0];
  const allSame = validReps.every((reps) => reps === firstReps);

  if (allSame && setCount > 0) {
    return `${setCount} x ${firstReps}`;
  }

  const preview = validReps.slice(0, 4).join("/");
  return validReps.length > 4 ? `${preview}/...` : preview;
}

function buildRunPreviewItems(runSets) {
  const activeCounts = {
    WARMUP: 0,
    WORKING_SET: 0,
    COOLDOWN: 0,
  };
  const activeDoneCounts = {
    WARMUP: 0,
    WORKING_SET: 0,
    COOLDOWN: 0,
  };

  for (const runSet of runSets) {
    if (Number(runSet.is_pause) === 1) {
      continue;
    }

    if (activeCounts[runSet.type] !== undefined) {
      activeCounts[runSet.type] += 1;
      if (Number(runSet.done) === 1) {
        activeDoneCounts[runSet.type] += 1;
      }
    }
  }

  const previewItems = [];

  if (activeCounts.WARMUP > 0) {
    previewItems.push({
      label: "Warmup",
      detail: formatSetCountLabel(activeCounts.WARMUP),
      done: activeDoneCounts.WARMUP === activeCounts.WARMUP,
    });
  }

  if (activeCounts.WORKING_SET > 0) {
    previewItems.push({
      label: "Working sets",
      detail: formatSetCountLabel(activeCounts.WORKING_SET),
      done: activeDoneCounts.WORKING_SET === activeCounts.WORKING_SET,
    });
  }

  if (activeCounts.COOLDOWN > 0) {
    previewItems.push({
      label: "Cooldown",
      detail: formatSetCountLabel(activeCounts.COOLDOWN),
      done: activeDoneCounts.COOLDOWN === activeCounts.COOLDOWN,
    });
  }

  if (previewItems.length > 0) {
    return previewItems;
  }

  if (runSets.length > 0) {
    return [
      {
        label: "Running session",
        detail: formatSetCountLabel(runSets.length),
        done: runSets.every((runSet) => Number(runSet.done) === 1),
      },
    ];
  }

  return [];
}

async function buildWorkoutPreview(db, workout) {
  const exercises = await weightliftingRepository.getExercisesByWorkout(
    db,
    workout.workout_id
  );

  if (exercises.length > 0) {
    const sets = await weightliftingRepository.getSetsByWorkout(db, workout.workout_id);
    const setsByExerciseId = {};

    for (const set of sets) {
      if (!setsByExerciseId[set.exercise_id]) {
        setsByExerciseId[set.exercise_id] = [];
      }

      setsByExerciseId[set.exercise_id].push(set);
    }

    return {
      ...workout,
      previewItems: exercises.map((exercise) => ({
        label: exercise.exercise_name,
        detail: formatExerciseRepSummary(
          exercise,
          setsByExerciseId[exercise.exercise_id] ?? []
        ),
        done: Number(exercise.done) === 1,
      })),
    };
  }

  const runSets = await runningRepository.getOrderedRunSetsForWorkout(
    db,
    workout.workout_id
  );

  return {
    ...workout,
    previewItems: buildRunPreviewItems(runSets),
  };
}

export async function createProgram(db, { programName, startDate, status }) {
  await programRepository.createProgram(db, { programName, startDate, status });
}

export async function getProgramsOverview(db) {
  return programRepository.getProgramsOverview(db);
}

export async function getProgramStatus(db, programId) {
  return programRepository.getProgramStatus(db, programId);
}

export async function getProgramName(db, programId) {
  return programRepository.getProgramName(db, programId);
}

export async function getProgramBestExerciseOptions(db, programId) {
  const exercises = await weightliftingRepository.getProgramExerciseNames(
    db,
    programId
  );
  const selections = await programRepository.getProgramBestExerciseSelections(
    db,
    programId
  );
  const selectionMap = new Map(
    selections.map((selection) => [
      selection.exercise_name,
      Number(selection.is_selected) === 1,
    ])
  );

  for (const exercise of exercises) {
    if (!selectionMap.has(exercise.exercise_name)) {
      await programRepository.insertProgramBestExerciseSelection(db, {
        programId,
        exerciseName: exercise.exercise_name,
        isSelected: true,
      });
    }
  }

  return exercises.map((exercise) => ({
    exercise_name: exercise.exercise_name,
    is_selected: selectionMap.get(exercise.exercise_name) ?? true,
  }));
}

export async function setProgramBestExerciseSelection(
  db,
  { programId, exerciseName, isSelected }
) {
  await programRepository.upsertProgramBestExerciseSelection(db, {
    programId,
    exerciseName,
    isSelected,
  });
}

export async function updateProgramStatus(db, { programId, status }) {
  await programRepository.updateProgramStatus(db, { programId, status });
}

export async function updateProgramName(db, { programId, programName }) {
  await programRepository.updateProgramName(db, { programId, programName });
}

export async function getProgramDayCount(db, programId) {
  return programRepository.getProgramDayCount(db, programId);
}

export async function getTodayProgramSnapshot(db, { programId, date }) {
  const day = await programRepository.getDayByProgramAndDate(db, {
    programId,
    date,
  });

  if (!day) {
    return null;
  }

  const workouts = await programRepository.getWorkoutsByDayId(db, day.day_id);
  const sets = await programRepository.getSetDoneStatesByDayId(db, day.day_id);
  const workoutsWithPreview = await Promise.all(
    workouts.map((workout) => buildWorkoutPreview(db, workout))
  );

  return {
    day,
    workouts: workoutsWithPreview,
    counts: {
      total: sets.length,
      done: sets.filter((set) => set.done === 1).length,
    },
  };
}

export async function getProgramExerciseBests(db, programId) {
  const sets = await programRepository.getCompletedStrengthSetsByProgram(
    db,
    programId
  );
  const bestsByExercise = {};

  for (const set of sets) {
    const weight = Number(set.weight);
    const reps = Number(set.reps);

    if (!Number.isFinite(weight) || !Number.isFinite(reps) || reps < 1) {
      continue;
    }

    const estimatedOneRepMax = calculateBrzyckiOneRepMax(weight, reps);

    if (estimatedOneRepMax === null) {
      continue;
    }

    const currentBest = bestsByExercise[set.exercise_name];

    if (
      !currentBest ||
      estimatedOneRepMax > currentBest.estimatedOneRepMax
    ) {
      bestsByExercise[set.exercise_name] = {
        exercise_name: set.exercise_name,
        weight,
        reps,
        performedDate: set.performed_date ?? null,
        estimatedOneRepMax,
        ...formatProgramBestDisplay({
          weight,
          reps,
          estimatedOneRepMax,
        }),
      };
    }
  }

  return Object.values(bestsByExercise).sort((left, right) =>
    left.exercise_name.localeCompare(right.exercise_name)
  );
}

export async function deleteProgram(db, programId) {
  await withTransaction(db, async () => {
    await programRepository.deleteSetsByProgram(db, programId);
    await programRepository.deleteExercisesByProgram(db, programId);
    await programRepository.deleteRunsByProgram(db, programId);
    await programRepository.deleteWorkoutsByProgram(db, programId);
    await programRepository.deleteDaysByProgram(db, programId);
    await programRepository.deleteMicrocyclesByProgram(db, programId);
    await programRepository.deleteEstimatedSetsByProgram(db, programId);
    await weightliftingRepository.deleteRmWeightProgressionsByProgram(
      db,
      programId
    );
    await programRepository.deleteProgramBestExercisesByProgram(db, programId);
    await programRepository.deleteMesocyclesByProgram(db, programId);
    await programRepository.deleteProgramById(db, programId);
  });
}

export async function createMesocycle(
  db,
  { programId, startDate, weeks, focus }
) {
  return withTransaction(db, async () => {
    const mesocycleCount = await programRepository.countMesocyclesByProgram(
      db,
      programId
    );
    const weekCount = await programRepository.countMicrocyclesByProgram(
      db,
      programId
    );

    const mesocycleResult = await programRepository.insertMesocycle(db, {
      programId,
      mesocycleNumber: (mesocycleCount?.count ?? 0) + 1,
      weeks,
      focus,
    });
    const mesocycleNumber = (mesocycleCount?.count ?? 0) + 1;
    const estimatedSets = await weightliftingRepository.getEstimatedSets(
      db,
      programId
    );

    for (const estimatedSet of estimatedSets) {
      const previousProgression =
        await weightliftingRepository.getLatestRmProgressionWeightBeforeMesocycle(
          db,
          {
            programId,
            exerciseName: estimatedSet.exercise_name,
            mesocycleNumber,
          }
        );

      await weightliftingRepository.insertRmWeightProgression(db, {
        mesocycleId: mesocycleResult.lastInsertRowId,
        exerciseName: estimatedSet.exercise_name,
        progressionWeight:
          mesocycleNumber > 1
            ? Number(previousProgression?.progression_weight || 0) + 2.5
            : 0,
      });
    }

    for (let week = 1; week <= weeks; week += 1) {
      const microcycleResult = await programRepository.insertMicrocycle(db, {
        mesocycleId: mesocycleResult.lastInsertRowId,
        microcycleNumber: week,
      });

      for (let dayIndex = 0; dayIndex < WEEK_DAYS.length; dayIndex += 1) {
        const currentDay =
          (weekCount?.count ?? 0) * 7 +
          (week * 7 - 7) +
          dayIndex;

        const date = parseCustomDate(startDate);
        date.setDate(date.getDate() + currentDay);

        await programRepository.insertDay(db, {
          microcycleId: microcycleResult.lastInsertRowId,
          programId,
          weekday: WEEK_DAYS[dayIndex],
          date: formatDate(date),
        });
      }
    }

    return mesocycleResult.lastInsertRowId;
  });
}

export async function getMesocyclesByProgram(db, programId) {
  return programRepository.getMesocyclesByProgram(db, programId);
}

export async function getMesocycleWorkoutCountsByProgram(db, programId) {
  return programRepository.getMesocycleWorkoutCountsByProgram(db, programId);
}

export async function updateMesocycleFocus(db, { mesocycleId, focus }) {
  await programRepository.updateMesocycleFocus(db, { mesocycleId, focus });
}

export async function addWeekToMesocycle(db, { mesocycleId, programId }) {
  return withTransaction(db, async () => {
    const weeks = await programRepository.getMicrocyclesByMesocycleForInsert(
      db,
      mesocycleId
    );
    const lastWeek = weeks[weeks.length - 1];
    const lastDay = await programRepository.getLastSundayByMicrocycle(
      db,
      lastWeek.microcycle_id
    );

    const microcycleResult = await programRepository.insertMicrocycle(db, {
      mesocycleId,
      microcycleNumber: weeks.length + 1,
    });

    for (let dayIndex = 0; dayIndex < WEEK_DAYS.length; dayIndex += 1) {
      const date = parseCustomDate(lastDay.date);
      date.setDate(date.getDate() + dayIndex + 1);

      await programRepository.insertDay(db, {
        microcycleId: microcycleResult.lastInsertRowId,
        programId,
        weekday: WEEK_DAYS[dayIndex],
        date: formatDate(date),
      });
    }

    await programRepository.incrementMesocycleWeeks(db, mesocycleId);

    return microcycleResult.lastInsertRowId;
  });
}

export async function deleteMesocycle(db, mesocycleId) {
  await withTransaction(db, async () => {
    await programRepository.deleteSetsByMesocycle(db, mesocycleId);
    await programRepository.deleteExercisesByMesocycle(db, mesocycleId);
    await programRepository.deleteRunsByMesocycle(db, mesocycleId);
    await programRepository.deleteWorkoutsByMesocycle(db, mesocycleId);
    await programRepository.deleteDaysByMesocycle(db, mesocycleId);
    await programRepository.deleteMicrocyclesByMesocycle(db, mesocycleId);
    await weightliftingRepository.deleteRmWeightProgressionsByMesocycle(
      db,
      mesocycleId
    );
    await programRepository.deleteMesocycleById(db, mesocycleId);
  });
}

export async function getMesocycleOptions(db, programId) {
  return programRepository.getMesocycleOptions(db, programId);
}

export async function getWeeksBeforeMesocycle(
  db,
  { programId, mesocycleNumber }
) {
  const row = await programRepository.getWeeksBeforeMesocycle(db, {
    programId,
    mesocycleNumber,
  });

  return row?.total_weeks ?? 0;
}

export async function getGlobalWeekIndexFromMicrocycle(
  db,
  { programId, microcycleId }
) {
  const microcycle = await programRepository.getMicrocycleNumberAndMesocycleNumber(
    db,
    {
      programId,
      microcycleId,
    }
  );

  if (!microcycle) {
    throw new Error("Microcycle not found");
  }

  const weeksBefore = await getWeeksBeforeMesocycle(db, {
    programId,
    mesocycleNumber: microcycle.mesocycle_number,
  });

  return weeksBefore + (microcycle.microcycle_number - 1);
}

export async function getMicrocyclesByMesocycle(db, mesocycleId) {
  return programRepository.getMicrocyclesByMesocycle(db, mesocycleId);
}

export async function updateMicrocycleFocus(db, { microcycleId, focus }) {
  await programRepository.updateMicrocycleFocus(db, { microcycleId, focus });
}

export async function getMicrocycleWorkoutCounts(db, microcycleId) {
  const total = await programRepository.getTotalWorkoutCountByMicrocycle(
    db,
    microcycleId
  );
  const done = await programRepository.getDoneWorkoutCountByMicrocycle(
    db,
    microcycleId
  );

  return {
    total: total?.count ?? 0,
    done: done?.count ?? 0,
  };
}

export async function getDayByMicrocycleAndDate(
  db,
  { microcycleId, date }
) {
  return programRepository.getDayByMicrocycleAndDate(db, {
    microcycleId,
    date,
  });
}

export async function getWorkoutLabelsByDay(db, dayId) {
  return programRepository.getWorkoutLabelsByDay(db, dayId);
}

export async function getMicrocycleOptions(db, programId) {
  const mesocycles = await programRepository.getMesocycleOptions(db, programId);
  const microcycles = await programRepository.getAllMicrocyclesByProgram(
    db,
    programId
  );

  return { mesocycles, microcycles };
}

export async function copyMicrocycleWorkouts(
  db,
  { sourceMicrocycleId, targetMicrocycleId }
) {
  await withTransaction(db, async () => {
    const sourceDays = await programRepository.getDaysByMicrocycle(
      db,
      sourceMicrocycleId
    );
    const targetDays = await programRepository.getDaysByMicrocycle(
      db,
      targetMicrocycleId
    );

    const targetDayMap = {};
    for (const day of targetDays) {
      targetDayMap[day.Weekday] = day;
    }

    for (const sourceDay of sourceDays) {
      const targetDay = targetDayMap[sourceDay.Weekday];
      if (!targetDay) {
        continue;
      }

      const workouts = await programRepository.getWorkoutsByDay(
        db,
        sourceDay.day_id
      );

      for (const workout of workouts) {
        const workoutResult = await programRepository.createWorkout(db, {
          date: targetDay.date,
          dayId: targetDay.day_id,
          label: workout.label,
        });

        await cloneWorkoutContents(db, {
          sourceWorkoutId: workout.workout_id,
          targetWorkoutId: workoutResult.lastInsertRowId,
        });
      }

      const hierarchy = await workoutRepository.getDayHierarchyIds(
        db,
        targetDay.day_id
      );
      await workoutService.refreshWorkoutHierarchyCompletionByIds(db, {
        dayId: hierarchy?.day_id,
        microcycleId: hierarchy?.microcycle_id,
        mesocycleId: hierarchy?.mesocycle_id,
      });
    }
  });
}

export async function deleteMicrocycle(db, microcycleId) {
  await withTransaction(db, async () => {
    await programRepository.deleteSetsByMicrocycle(db, microcycleId);
    await programRepository.deleteExercisesByMicrocycle(db, microcycleId);
    await programRepository.deleteRunsByMicrocycle(db, microcycleId);
    await programRepository.deleteWorkoutsByMicrocycle(db, microcycleId);
    await programRepository.deleteDaysByMicrocycle(db, microcycleId);
    await programRepository.deleteMicrocycleById(db, microcycleId);
  });
}

export async function getDayDetails(db, { microcycleId, weekday }) {
  const day = await programRepository.getDayByWeekdayAndMicrocycle(db, {
    weekday,
    microcycleId,
  });

  if (!day?.day_id) {
    return null;
  }

  const workouts = await programRepository.getWorkoutsByDayId(db, day.day_id);
  const workoutExercises = [];

  for (const workout of workouts) {
    const exercises = await weightliftingRepository.getExerciseSummariesByWorkout(
      db,
      workout.workout_id
    );

    workoutExercises.push({
      workout_id: workout.workout_id,
      label: workout.label,
      exercises,
    });
  }

  return {
    ...day,
    workouts,
    workoutExercises,
    workoutsDone: day.done === 1,
  };
}

export async function getDayByDate(db, { programId, date }) {
  return programRepository.getDayByDate(db, { programId, date });
}

export async function createWorkoutForDay(db, { date, dayId, label }) {
  return withTransaction(db, async () => {
    const workout = await programRepository.createWorkout(db, {
      date,
      dayId,
      label,
    });

    const hierarchy = await workoutRepository.getDayHierarchyIds(db, dayId);
    await workoutService.refreshWorkoutHierarchyCompletionByIds(db, {
      dayId: hierarchy?.day_id,
      microcycleId: hierarchy?.microcycle_id,
      mesocycleId: hierarchy?.mesocycle_id,
    });

    return workout;
  });
}

export async function copyWorkoutToDate(
  db,
  { workoutId, programId, date }
) {
  return withTransaction(db, async () => {
    const targetDay = await programRepository.getDayByDate(db, {
      programId,
      date: formatDate(date),
    });

    if (!targetDay?.day_id) {
      return null;
    }

    const workoutResult = await programRepository.copyWorkoutIntoDay(db, {
      date: formatDate(date),
      dayId: targetDay.day_id,
      workoutId,
    });

    await cloneWorkoutContents(db, {
      sourceWorkoutId: workoutId,
      targetWorkoutId: workoutResult.lastInsertRowId,
    });

    const hierarchy = await workoutRepository.getDayHierarchyIds(
      db,
      targetDay.day_id
    );
    await workoutService.refreshWorkoutHierarchyCompletionByIds(db, {
      dayId: hierarchy?.day_id,
      microcycleId: hierarchy?.microcycle_id,
      mesocycleId: hierarchy?.mesocycle_id,
    });

    return workoutResult.lastInsertRowId;
  });
}

export async function deleteWorkout(db, workoutId) {
  await withTransaction(db, async () => {
    const hierarchy = await workoutRepository.getWorkoutHierarchyIds(
      db,
      workoutId
    );

    await weightliftingRepository.deleteSetsByWorkout(db, workoutId);
    await weightliftingRepository.deleteExercisesByWorkout(db, workoutId);
    await runningRepository.deleteRunSetsByWorkout(db, workoutId);
    await programRepository.deleteWorkoutById(db, workoutId);

    await workoutService.refreshWorkoutHierarchyCompletionByIds(db, {
      dayId: hierarchy?.day_id,
      microcycleId: hierarchy?.microcycle_id,
      mesocycleId: hierarchy?.mesocycle_id,
    });
  });
}

export async function getWorkoutOptions(db, programId) {
  return programRepository.getWorkoutOptions(db, programId);
}

export async function getMicrocycleMetadata(db, microcycleId) {
  return programRepository.getMicrocycleMetadata(db, microcycleId);
}

export async function getMesocycleMetadata(
  db,
  { mesocycleId, programId }
) {
  return programRepository.getMesocycleMetadata(db, {
    mesocycleId,
    programId,
  });
}

export async function getProgramMetadata(db, programId) {
  return programRepository.getProgramMetadata(db, programId);
}

import {
  programRepository,
  weightliftingRepository,
  workoutRepository,
} from "../Repository";
import * as workoutService from "./workoutService";
import { withTransaction } from "./shared";

export const DEFAULT_VISIBLE_COLUMNS = {
  note: true,
  rest: true,
  set: true,
  reps: true,
  rpe: true,
  rm_percentage: true,
  weight: true,
  done: true,
};

function normalizeOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getDefaultMesocycleProgressionWeight(mesocycleNumber) {
  const parsedMesocycleNumber = Number(mesocycleNumber);

  if (!Number.isFinite(parsedMesocycleNumber) || parsedMesocycleNumber <= 1) {
    return 0;
  }

  return (parsedMesocycleNumber - 1) * 2.5;
}

function formatWeightDisplay(value) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

async function getEstimatedWeightForSet(db, setId) {
  const estimatedSet = await weightliftingRepository.getEstimatedWeightBySetId(
    db,
    setId
  );
  const estimatedWeight = Number(
    estimatedSet?.adjusted_estimated_weight ?? estimatedSet?.estimated_weight
  );

  if (!Number.isFinite(estimatedWeight) || estimatedWeight <= 0) {
    return null;
  }

  return estimatedWeight;
}

async function ensureMesocycleProgressions(
  db,
  { mesocycleId, programId, mesocycleNumber }
) {
  const estimatedSets = await weightliftingRepository.getEstimatedSets(db, programId);
  const existingProgressions =
    await weightliftingRepository.getMesocycleRmProgressions(db, mesocycleId);
  const existingExerciseNames = new Set(
    existingProgressions.map((progression) => progression.exercise_name)
  );
  const defaultProgressionWeight =
    getDefaultMesocycleProgressionWeight(mesocycleNumber);

  for (const estimatedSet of estimatedSets) {
    if (existingExerciseNames.has(estimatedSet.exercise_name)) {
      continue;
    }

    await weightliftingRepository.insertRmWeightProgression(db, {
      mesocycleId,
      exerciseName: estimatedSet.exercise_name,
      progressionWeight: defaultProgressionWeight,
    });
  }
}

async function getSelectedProgramBestExerciseNames(db, programId) {
  const programExercises = await weightliftingRepository.getProgramExerciseNames(
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

  for (const exercise of programExercises) {
    if (!selectionMap.has(exercise.exercise_name)) {
      await programRepository.insertProgramBestExerciseSelection(db, {
        programId,
        exerciseName: exercise.exercise_name,
        isSelected: true,
      });
      selectionMap.set(exercise.exercise_name, true);
    }
  }

  return new Set(
    programExercises
      .filter((exercise) => selectionMap.get(exercise.exercise_name) ?? true)
      .map((exercise) => exercise.exercise_name)
  );
}

export async function getExerciseStorage(db) {
  return weightliftingRepository.getExerciseStorage(db);
}

export async function createExerciseStorage(db, exerciseName) {
  await weightliftingRepository.createExerciseStorage(db, exerciseName);
}

export async function getEstimatedSets(db, programId) {
  return weightliftingRepository.getEstimatedSets(db, programId);
}

export async function createEstimatedSet(
  db,
  { programId, exerciseName, estimatedWeight }
) {
  await withTransaction(db, async () => {
    await weightliftingRepository.createEstimatedSet(db, {
      programId,
      exerciseName,
      estimatedWeight,
    });

    const mesocycles = await programRepository.getMesocyclesByProgram(db, programId);

    for (const mesocycle of mesocycles) {
      await weightliftingRepository.insertRmWeightProgression(db, {
        mesocycleId: mesocycle.mesocycle_id,
        exerciseName,
        progressionWeight: getDefaultMesocycleProgressionWeight(
          mesocycle.mesocycle_number
        ),
      });
    }
  });
}

export async function updateEstimatedSetWeight(
  db,
  { estimatedSetId, estimatedWeight }
) {
  await weightliftingRepository.updateEstimatedSetWeight(db, {
    estimatedSetId,
    estimatedWeight,
  });
}

export async function deleteEstimatedSet(db, estimatedSetId) {
  await withTransaction(db, async () => {
    const estimatedSet = await weightliftingRepository.getEstimatedSetById(
      db,
      estimatedSetId
    );

    if (!estimatedSet) {
      return;
    }

    await weightliftingRepository.deleteEstimatedSet(db, estimatedSetId);
    await weightliftingRepository.deleteRmWeightProgressionsByProgramExercise(db, {
      programId: estimatedSet.program_id,
      exerciseName: estimatedSet.exercise_name,
    });
  });
}

export async function getMesocycleProgressiveOverload(
  db,
  { mesocycleId, programId, mesocycleNumber }
) {
  await ensureMesocycleProgressions(db, {
    mesocycleId,
    programId,
    mesocycleNumber,
  });

  const rows = await weightliftingRepository.getMesocycleEstimatedSetProgressions(
    db,
    mesocycleId
  );
  const selectedExerciseNames = await getSelectedProgramBestExerciseNames(
    db,
    programId
  );
  const filteredRows = rows.filter((row) =>
    selectedExerciseNames.has(row.exercise_name)
  );
  const progressions = filteredRows.map((row) => {
    const progressionWeight = Number(row.progression_weight) || 0;

    return {
      exercise_name: row.exercise_name,
      progression_weight: progressionWeight,
      progression_display: `+${formatWeightDisplay(progressionWeight)} kg`,
    };
  });

  const uniformProgressionWeight =
    progressions.length > 0 &&
    progressions.every(
      (progression) =>
        progression.progression_weight === progressions[0].progression_weight
    )
      ? progressions[0].progression_weight
      : null;

  return {
    summary:
      rows.length === 0
        ? "No 1 RM values yet."
        : progressions.length === 0
          ? "No Program bests selected."
        : uniformProgressionWeight !== null
          ? `Selected exercises: +${formatWeightDisplay(uniformProgressionWeight)} kg`
          : "Custom progression",
    progressions,
  };
}

export async function getMesocycleProgressiveOverloadByProgram(db, programId) {
  const mesocycles = await programRepository.getMesocyclesByProgram(db, programId);

  for (const mesocycle of mesocycles) {
    await ensureMesocycleProgressions(db, {
      mesocycleId: mesocycle.mesocycle_id,
      programId,
      mesocycleNumber: mesocycle.mesocycle_number,
    });
  }

  const rows =
    await weightliftingRepository.getMesocycleEstimatedSetProgressionsByProgram(
      db,
      programId
    );
  const selectedExerciseNames = await getSelectedProgramBestExerciseNames(
    db,
    programId
  );
  const groupedProgressions = {};

  for (const row of rows) {
    if (!selectedExerciseNames.has(row.exercise_name)) {
      continue;
    }

    if (!groupedProgressions[row.mesocycle_id]) {
      groupedProgressions[row.mesocycle_id] = [];
    }

    const progressionWeight = Number(row.progression_weight) || 0;
    groupedProgressions[row.mesocycle_id].push({
      exercise_name: row.exercise_name,
      progression_weight: progressionWeight,
      progression_display: `+${formatWeightDisplay(progressionWeight)} kg`,
    });
  }

  return groupedProgressions;
}

export async function getStrengthWorkoutSummary(db, workoutId) {
  const total = await weightliftingRepository.getTotalPlannedSetsByWorkout(
    db,
    workoutId
  );
  const done = await weightliftingRepository.getDoneSetCountByWorkout(
    db,
    workoutId
  );

  return {
    totalSets: total?.count ?? 0,
    doneSets: done?.done_sets ?? 0,
  };
}

export async function getProgramExerciseNames(db, programId) {
  return weightliftingRepository.getProgramExerciseNames(db, programId);
}

export async function getWorkoutExercises(db, workoutId) {
  const exercises = await weightliftingRepository.getExercisesByWorkout(
    db,
    workoutId
  );
  const sets = await weightliftingRepository.getSetsByWorkout(db, workoutId);

  const setsByExercise = {};
  for (const set of sets) {
    if (!setsByExercise[set.exercise_id]) {
      setsByExercise[set.exercise_id] = [];
    }
    setsByExercise[set.exercise_id].push(set);
  }

  return exercises.map((exercise) => {
    const exerciseSets = setsByExercise[exercise.exercise_id] ?? [];

    return {
      ...exercise,
      sets: exerciseSets,
      setCount: exerciseSets.length,
      visibleColumns: exercise.visible_columns
        ? {
            ...DEFAULT_VISIBLE_COLUMNS,
            ...JSON.parse(exercise.visible_columns),
          }
        : DEFAULT_VISIBLE_COLUMNS,
    };
  });
}

export async function addExerciseToWorkout(db, { workoutId, exerciseName }) {
  await withTransaction(db, async () => {
    await weightliftingRepository.createExercise(db, {
      workoutId,
      exerciseName,
      sets: 0,
    });

    await workoutRepository.updateWorkoutDone(db, {
      workoutId,
      done: false,
    });

    await workoutService.refreshWorkoutHierarchyCompletion(db, workoutId);
  });
}

export async function deleteExercise(db, exerciseId) {
  await withTransaction(db, async () => {
    const exercise = await weightliftingRepository.getWorkoutIdByExercise(
      db,
      exerciseId
    );

    await weightliftingRepository.deleteSetsByExercise(db, exerciseId);
    await weightliftingRepository.deleteExerciseById(db, exerciseId);

    if (exercise?.workout_id) {
      await weightliftingRepository.updateWorkoutDoneFromExercises(
        db,
        exercise.workout_id
      );
      await workoutService.refreshWorkoutHierarchyCompletion(
        db,
        exercise.workout_id
      );
    }
  });
}

export async function addSetToExercise(db, exerciseId) {
  await withTransaction(db, async () => {
    const exercise = await weightliftingRepository.getWorkoutIdByExercise(
      db,
      exerciseId
    );
    const row = await weightliftingRepository.countSetsByExercise(db, exerciseId);

    await weightliftingRepository.createSet(db, {
      setNumber: (row?.count ?? 0) + 1,
      exerciseId,
    });

    await weightliftingRepository.updateExerciseSetCount(db, exerciseId);
    await weightliftingRepository.updateExerciseDoneFromSets(db, exerciseId);

    if (exercise?.workout_id) {
      await weightliftingRepository.updateWorkoutDoneFromExercises(
        db,
        exercise.workout_id
      );
      await workoutService.refreshWorkoutHierarchyCompletion(
        db,
        exercise.workout_id
      );
    }
  });
}

export async function updateExerciseVisibleColumns(
  db,
  { exerciseId, columns }
) {
  await weightliftingRepository.updateExerciseVisibleColumns(db, {
    exerciseId,
    columns,
  });
}

export async function updateExerciseNote(db, { exerciseId, note }) {
  await weightliftingRepository.updateExerciseNote(db, {
    exerciseId,
    note,
  });
}

export async function updateStrengthSetDone(db, { workoutId, setId, done }) {
  await withTransaction(db, async () => {
    await weightliftingRepository.updateSetDone(db, { setId, done });
    await weightliftingRepository.updateExerciseDoneBySet(db, setId);
    await weightliftingRepository.updateWorkoutDoneFromExercises(db, workoutId);
    await workoutService.refreshWorkoutHierarchyCompletion(db, workoutId);
  });
}

export async function deleteSet(db, setId) {
  await withTransaction(db, async () => {
    const set = await weightliftingRepository.getExerciseAndWorkoutBySetId(
      db,
      setId
    );

    if (!set) {
      return;
    }

    await weightliftingRepository.deleteSetById(db, setId);

    const sets = await weightliftingRepository.getSetIdsByExercise(
      db,
      set.exercise_id
    );
    let setNumber = 1;
    for (const row of sets) {
      await weightliftingRepository.updateSetNumber(db, {
        setId: row.sets_id,
        setNumber,
      });
      setNumber += 1;
    }

    await weightliftingRepository.updateExerciseSetCount(db, set.exercise_id);
    await weightliftingRepository.updateExerciseDoneFromSets(db, set.exercise_id);
    await weightliftingRepository.updateWorkoutDoneFromExercises(
      db,
      set.workout_id
    );
    await workoutService.refreshWorkoutHierarchyCompletion(db, set.workout_id);
  });
}

export async function updateSetField(db, { field, value, setId }) {
  await weightliftingRepository.updateSetField(db, { field, value, setId });
}

export async function updateSetRmPercentage(db, { setId, rmPercentage }) {
  const nextRmPercentage = normalizeOptionalNumber(rmPercentage);

  return withTransaction(db, async () => {
    await weightliftingRepository.updateSetField(db, {
      field: "rm_percentage",
      value: nextRmPercentage,
      setId,
    });

    if (nextRmPercentage === null) {
      return {
        rmPercentage: null,
        weightUpdated: false,
        weight: null,
      };
    }

    const estimatedWeight = await getEstimatedWeightForSet(db, setId);

    if (estimatedWeight === null) {
      return {
        rmPercentage: nextRmPercentage,
        weightUpdated: false,
        weight: null,
      };
    }

    const calculatedWeight = Math.round(
      estimatedWeight * (nextRmPercentage / 100)
    );

    await weightliftingRepository.updateSetField(db, {
      field: "weight",
      value: calculatedWeight,
      setId,
    });

    return {
      rmPercentage: nextRmPercentage,
      weightUpdated: true,
      weight: calculatedWeight,
    };
  });
}

export async function updateSetWeight(db, { setId, weight }) {
  const nextWeight = normalizeOptionalNumber(weight);

  return withTransaction(db, async () => {
    await weightliftingRepository.updateSetField(db, {
      field: "weight",
      value: nextWeight,
      setId,
    });

    if (nextWeight === null) {
      await weightliftingRepository.updateSetField(db, {
        field: "rm_percentage",
        value: null,
        setId,
      });

      return {
        weight: null,
        rmPercentage: null,
      };
    }

    const estimatedWeight = await getEstimatedWeightForSet(db, setId);

    if (estimatedWeight === null) {
      await weightliftingRepository.updateSetField(db, {
        field: "rm_percentage",
        value: null,
        setId,
      });

      return {
        weight: nextWeight,
        rmPercentage: null,
      };
    }

    const nextRmPercentage = Math.round((nextWeight / estimatedWeight) * 100);

    await weightliftingRepository.updateSetField(db, {
      field: "rm_percentage",
      value: nextRmPercentage,
      setId,
    });

    return {
      weight: nextWeight,
      rmPercentage: nextRmPercentage,
    };
  });
}

export async function getExerciseSets(db, exerciseId) {
  return weightliftingRepository.getExerciseSets(db, exerciseId);
}

export async function getExerciseSetCount(db, exerciseId) {
  return weightliftingRepository.getExerciseSetCount(db, exerciseId);
}

export async function initializeExerciseSets(db, { exerciseId, count }) {
  await withTransaction(db, async () => {
    for (let index = 1; index <= count; index += 1) {
      await weightliftingRepository.createSet(db, {
        setNumber: index,
        exerciseId,
      });
    }

    await weightliftingRepository.updateExerciseSetCount(db, exerciseId);
  });
}

export async function saveExerciseSets(db, { exerciseId, sets }) {
  await withTransaction(db, async () => {
    const exercise = await weightliftingRepository.getWorkoutIdByExercise(
      db,
      exerciseId
    );

    for (const set of sets) {
      await weightliftingRepository.updateSetByExerciseAndNumber(db, {
        exerciseId,
        setNumber: set.set_number,
        pause: set.pause,
        rpe: set.rpe,
        weight: set.weight,
        rmPercentage: set.rm_percentage,
        reps: set.reps,
        done: set.done ? 1 : 0,
        failed: set.failed ? 1 : 0,
        amrap: set.amrap ? 1 : 0,
        note: set.note,
      });
    }

    await weightliftingRepository.updateExerciseDoneFromSets(db, exerciseId);

    if (exercise?.workout_id) {
      await weightliftingRepository.updateWorkoutDoneFromExercises(
        db,
        exercise.workout_id
      );
      await workoutService.refreshWorkoutHierarchyCompletion(
        db,
        exercise.workout_id
      );
    }
  });
}

export async function updateExerciseDone(db, { exerciseId, done }) {
  await withTransaction(db, async () => {
    const exercise = await weightliftingRepository.getWorkoutIdByExercise(
      db,
      exerciseId
    );

    await weightliftingRepository.updateExerciseDone(db, { exerciseId, done });

    if (exercise?.workout_id) {
      await weightliftingRepository.updateWorkoutDoneFromExercises(
        db,
        exercise.workout_id
      );
      await workoutService.refreshWorkoutHierarchyCompletion(
        db,
        exercise.workout_id
      );
    }
  });
}

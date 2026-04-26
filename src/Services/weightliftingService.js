import {
  programRepository,
  weightliftingRepository,
  workoutRepository,
} from "../Repository";
import { supabase } from "../Database/supaBaseClient";
import * as workoutService from "./workoutService";
import { withTransaction } from "./shared";
import { createNextSyncVersion, normalizeSyncId } from "../Utils/syncUtils";
import { enqueueSync, startBackgroundSync } from "./syncScheduler";

async function syncExerciseInstancesInBackground(db) {
  try {
    const programServiceModule = await import("./programService");
    startBackgroundSync(
      () => programServiceModule.syncExerciseInstancesWithCloud(db),
      "Exercise instance cloud sync failed:"
    );
  } catch (error) {
    console.error("Failed to start exercise instance cloud sync:", error);
  }
}

async function syncSetsInBackground(db) {
  try {
    const programServiceModule = await import("./programService");
    startBackgroundSync(
      () => programServiceModule.syncSetsWithCloud(db),
      "Set cloud sync failed:"
    );
  } catch (error) {
    console.error("Failed to start set cloud sync:", error);
  }
}

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

const EXERCISE_LIBRARY_TABLE = "Exercise";
const EXERCISE_LIBRARY_NAME_COLUMN = "name";
const EXERCISE_LIBRARY_ID_COLUMN = "id";
const MUSCLE_ACTIVATION_TABLE = "Muscle_Activation";
const MUSCLE_TABLE = "Muscle";
const PRIMARY_ACTIVATION_LEVEL = "primary";
const SECONDARY_ACTIVATION_LEVEL = "secondary";
const EXERCISE_INSTANCE_CLOUD_TABLE = "exercise_instance";
const EXERCISE_INSTANCE_CLOUD_SELECT =
  "id, local_exercise_instance_id, sync_id, sync_version, deleted_at, cloud_workout_type_instance_id, exercise_name, sets, visible_columns, note, done";
const SET_CLOUD_TABLE = "set";
const SET_CLOUD_SELECT =
  "id, local_set_id, sync_id, sync_version, deleted_at, cloud_exercise_instance_id, set_number, personal_record, pause, rpe, weight, rm_percentage, reps, done, failed, amrap, note";

function normalizeOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const normalizedValue =
    typeof value === "string"
      ? value.trim().replace(",", ".").replace(/[^0-9.-]/g, "")
      : value;

  if (normalizedValue === "") {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function formatWeightDisplay(value) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatSignedWeightDisplay(value) {
  const parsedValue = Number(value) || 0;
  const sign = parsedValue >= 0 ? "+" : "-";

  return `${sign}${formatWeightDisplay(Math.abs(parsedValue))} kg`;
}

function normalizeOptionalInteger(value, fallbackValue = null) {
  if (value === "" || value === null || value === undefined) {
    return fallbackValue;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.trunc(numericValue) : fallbackValue;
}

function normalizeOptionalText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeBooleanFlag(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    return ["1", "true", "yes"].includes(value.trim().toLowerCase());
  }

  return false;
}

function parseVisibleColumns(value) {
  if (value === null || value === undefined || value === "") {
    return { ...DEFAULT_VISIBLE_COLUMNS };
  }

  let parsedValue = value;

  if (typeof value === "string") {
    try {
      parsedValue = JSON.parse(value);
    } catch {
      return { ...DEFAULT_VISIBLE_COLUMNS };
    }
  }

  if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
    return { ...DEFAULT_VISIBLE_COLUMNS };
  }

  const normalizedColumns = { ...DEFAULT_VISIBLE_COLUMNS };

  for (const key of Object.keys(DEFAULT_VISIBLE_COLUMNS)) {
    if (Object.prototype.hasOwnProperty.call(parsedValue, key)) {
      normalizedColumns[key] = Boolean(parsedValue[key]);
    }
  }

  return normalizedColumns;
}

function serializeVisibleColumns(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  let parsedValue = value;

  if (typeof value === "string") {
    try {
      parsedValue = JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
    return null;
  }

  const normalizedColumns = {};

  for (const key of Object.keys(DEFAULT_VISIBLE_COLUMNS)) {
    if (Object.prototype.hasOwnProperty.call(parsedValue, key)) {
      normalizedColumns[key] = Boolean(parsedValue[key]);
    }
  }

  return Object.keys(normalizedColumns).length > 0
    ? JSON.stringify(normalizedColumns)
    : null;
}

function normalizeExerciseCatalogEntries(entries) {
  const exerciseMap = new Map();

  for (const entry of entries) {
    const rawName = entry?.name ?? entry?.exercise_name;
    const normalizedName =
      typeof rawName === "string" ? rawName.trim() : "";
    const normalizedNickname =
      typeof entry?.nickname === "string" && entry.nickname.trim() !== ""
        ? entry.nickname.trim()
        : null;

    if (!normalizedName) {
      continue;
    }

    exerciseMap.set(normalizedName.toLocaleLowerCase(), {
      name: normalizedName,
      nickname: normalizedNickname,
    });
  }

  return [...exerciseMap.values()].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, {
      sensitivity: "base",
    })
  );
}

function areExerciseCatalogEntriesEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (
      left[index].name !== right[index].name ||
      left[index].nickname !== right[index].nickname
    ) {
      return false;
    }
  }

  return true;
}

function buildExerciseActivationCounts(exercises, activations) {
  const activationMap = new Map(
    exercises.map((exercise) => [
      exercise.id,
      {
        primary: new Set(),
        secondary: new Set(),
      },
    ])
  );

  for (const activation of activations) {
    const activationBucket = activationMap.get(activation.exercise_id);

    if (!activationBucket) {
      continue;
    }

    const activationLevel =
      typeof activation.activation_level === "string"
        ? activation.activation_level.trim().toLocaleLowerCase()
        : "";

    if (activationLevel === PRIMARY_ACTIVATION_LEVEL) {
      activationBucket.primary.add(activation.muscle_id);
      continue;
    }

    if (activationLevel === SECONDARY_ACTIVATION_LEVEL) {
      activationBucket.secondary.add(activation.muscle_id);
    }
  }

  return normalizeExerciseCatalogEntries(
    exercises.map((exercise) => {
      const counts = activationMap.get(exercise.id);

      return {
        name: exercise.name,
        nickname:
          typeof exercise.nickname === "string" && exercise.nickname.trim() !== ""
            ? exercise.nickname.trim()
            : null,
        primary_muscle_group_count: counts?.primary.size ?? 0,
        secondary_muscle_group_count: counts?.secondary.size ?? 0,
      };
    })
  );
}

function normalizeActivationLevel(activationLevel) {
  return typeof activationLevel === "string"
    ? activationLevel.trim().toLocaleLowerCase()
    : "";
}

async function getDefaultMesocycleProgressionWeight(
  db,
  { programId, mesocycleNumber, exerciseName }
) {
  const parsedMesocycleNumber = Number(mesocycleNumber);

  if (!Number.isFinite(parsedMesocycleNumber) || parsedMesocycleNumber <= 1) {
    return 0;
  }

  const previousProgression =
    await weightliftingRepository.getLatestRmProgressionWeightBeforeMesocycle(
      db,
      {
        programId,
        exerciseName,
        mesocycleNumber: parsedMesocycleNumber,
      }
    );

  if (previousProgression?.progression_weight !== undefined) {
    return Number(previousProgression.progression_weight || 0) + 2.5;
  }

  return (parsedMesocycleNumber - 1) * 2.5;
}

async function getEstimatedWeightForSet(db, setId) {
  const estimatedSet = await weightliftingRepository.getEstimatedWeightBySetId(
    db,
    setId
  );
  const baseEstimatedWeight = normalizeOptionalNumber(
    estimatedSet?.estimated_weight
  );
  const progressionWeight =
    normalizeOptionalNumber(estimatedSet?.progression_weight) ?? 0;
  const adjustedEstimatedWeight = normalizeOptionalNumber(
    estimatedSet?.adjusted_estimated_weight
  );
  const estimatedWeight =
    adjustedEstimatedWeight ??
    (baseEstimatedWeight === null
      ? null
      : baseEstimatedWeight + progressionWeight);

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

  for (const estimatedSet of estimatedSets) {
    if (existingExerciseNames.has(estimatedSet.exercise_name)) {
      continue;
    }

    const defaultProgressionWeight =
      await getDefaultMesocycleProgressionWeight(db, {
        programId,
        mesocycleNumber,
        exerciseName: estimatedSet.exercise_name,
      });

    await weightliftingRepository.insertRmWeightProgression(db, {
      mesocycleId,
      exerciseName: estimatedSet.exercise_name,
      progressionWeight: defaultProgressionWeight,
    });
  }
}

async function ensureProgramMesocycleProgressions(db, programId) {
  const mesocycles = await programRepository.getMesocyclesByProgram(db, programId);

  for (const mesocycle of mesocycles) {
    await ensureMesocycleProgressions(db, {
      mesocycleId: mesocycle.mesocycle_id,
      programId,
      mesocycleNumber: mesocycle.mesocycle_number,
    });
  }

  return mesocycles;
}

function buildProgressionGroups(rows, selectedExerciseNames) {
  const rowsByExercise = new Map();

  for (const row of rows) {
    if (!selectedExerciseNames.has(row.exercise_name)) {
      continue;
    }

    const existingRows = rowsByExercise.get(row.exercise_name) ?? [];
    existingRows.push(row);
    rowsByExercise.set(row.exercise_name, existingRows);
  }

  const groupedProgressions = {};

  for (const [exerciseName, exerciseRows] of rowsByExercise.entries()) {
    const sortedRows = [...exerciseRows].sort(
      (left, right) => left.mesocycle_number - right.mesocycle_number
    );
    let previousProgressionWeight = 0;

    for (const row of sortedRows) {
      const estimatedWeight = Number(row.estimated_weight);

      if (!Number.isFinite(estimatedWeight)) {
        continue;
      }

      const progressionWeight = Number(row.progression_weight) || 0;
      const blockDelta = progressionWeight - previousProgressionWeight;
      const previousWeight = estimatedWeight + previousProgressionWeight;
      const currentWeight = estimatedWeight + progressionWeight;

      if (!groupedProgressions[row.mesocycle_id]) {
        groupedProgressions[row.mesocycle_id] = [];
      }

      groupedProgressions[row.mesocycle_id].push({
        exercise_name: exerciseName,
        estimated_weight: estimatedWeight,
        estimated_weight_display: `${formatWeightDisplay(estimatedWeight)} kg`,
        progression_weight: progressionWeight,
        previous_progression_weight: previousProgressionWeight,
        previous_weight: previousWeight,
        previous_weight_display: `${formatWeightDisplay(previousWeight)} kg`,
        current_weight: currentWeight,
        current_weight_display: `${formatWeightDisplay(currentWeight)} kg`,
        block_delta: blockDelta,
        block_delta_display: formatSignedWeightDisplay(blockDelta),
        progression_display: formatSignedWeightDisplay(blockDelta),
        is_base_mesocycle: row.mesocycle_number === 1,
        mesocycle_number: row.mesocycle_number,
      });

      previousProgressionWeight = progressionWeight;
    }
  }

  for (const mesocycleId of Object.keys(groupedProgressions)) {
    groupedProgressions[mesocycleId].sort((left, right) =>
      left.exercise_name.localeCompare(right.exercise_name)
    );
  }

  return groupedProgressions;
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

function mapExerciseCatalogForDisplay(entries) {
  return entries.map((entry) => ({
    exercise_name: entry.name,
    nickname: entry.nickname,
    primary_muscle_group_count: Number(entry.primary_muscle_group_count) || 0,
    secondary_muscle_group_count: Number(entry.secondary_muscle_group_count) || 0,
  }));
}

export async function getExerciseStorage(db) {
  return weightliftingRepository.getExerciseStorage(db);
}

export async function createExerciseStorage(db, exerciseName) {
  await weightliftingRepository.createExerciseStorage(db, exerciseName);
}

export async function getExerciseLibraryEntries(db) {
  const localExerciseRows = await weightliftingRepository.getExerciseStorage(db);
  const localExercises = normalizeExerciseCatalogEntries(localExerciseRows);

  if (localExercises.length === 0) {
    return [];
  }

  try {
    const { data: exerciseRows, error: exerciseError } = await supabase
      .from(EXERCISE_LIBRARY_TABLE)
      .select(
        `${EXERCISE_LIBRARY_ID_COLUMN}, ${EXERCISE_LIBRARY_NAME_COLUMN}, nickname`
      )
      .in(
        EXERCISE_LIBRARY_NAME_COLUMN,
        localExercises.map((exercise) => exercise.name)
      )
      .order(EXERCISE_LIBRARY_NAME_COLUMN, { ascending: true });

    if (exerciseError) {
      throw exerciseError;
    }

    const exerciseIds = (exerciseRows ?? [])
      .map((row) => row?.[EXERCISE_LIBRARY_ID_COLUMN])
      .filter((id) => id !== null && id !== undefined);
    let activationRows = [];

    if (exerciseIds.length > 0) {
      const { data, error } = await supabase
        .from(MUSCLE_ACTIVATION_TABLE)
        .select("exercise_id, muscle_id, activation_level")
        .in("exercise_id", exerciseIds);

      if (error) {
        throw error;
      }

      activationRows = data ?? [];
    }

    const cloudExercisesWithCounts = buildExerciseActivationCounts(
      exerciseRows ?? [],
      activationRows
    );
    const cloudExerciseMap = new Map(
      cloudExercisesWithCounts.map((exercise) => [
        exercise.name.toLocaleLowerCase(),
        exercise,
      ])
    );

    return mapExerciseCatalogForDisplay(
      localExercises.map((exercise) => ({
        ...exercise,
        primary_muscle_group_count:
          cloudExerciseMap.get(exercise.name.toLocaleLowerCase())
            ?.primary_muscle_group_count ?? 0,
        secondary_muscle_group_count:
          cloudExerciseMap.get(exercise.name.toLocaleLowerCase())
            ?.secondary_muscle_group_count ?? 0,
      }))
    );
  } catch (_error) {
    return mapExerciseCatalogForDisplay(localExercises);
  }
}

export async function syncExerciseLibraryFromCloud(db) {
  const { data: exerciseRows, error: exerciseError } = await supabase
    .from(EXERCISE_LIBRARY_TABLE)
    .select(
      `${EXERCISE_LIBRARY_ID_COLUMN}, ${EXERCISE_LIBRARY_NAME_COLUMN}, nickname`
    )
    .order(EXERCISE_LIBRARY_NAME_COLUMN, { ascending: true });

  if (exerciseError) {
    throw exerciseError;
  }

  const cloudExercises = normalizeExerciseCatalogEntries(exerciseRows ?? []);
  const localExerciseRows = await weightliftingRepository.getExerciseStorage(db);
  const localExercises = normalizeExerciseCatalogEntries(localExerciseRows);

  if (areExerciseCatalogEntriesEqual(localExercises, cloudExercises)) {
    return {
      changed: false,
      exerciseCount: localExercises.length,
    };
  }

  await weightliftingRepository.replaceExerciseCatalog(db, cloudExercises);

  return {
    changed: true,
    exerciseCount: cloudExercises.length,
  };
}

export async function getExerciseLibraryMuscleDetails(exerciseName) {
  const normalizedExerciseName =
    typeof exerciseName === "string" ? exerciseName.trim() : "";

  if (!normalizedExerciseName) {
    return [];
  }

  const { data: exerciseRow, error: exerciseError } = await supabase
    .from(EXERCISE_LIBRARY_TABLE)
    .select(`${EXERCISE_LIBRARY_ID_COLUMN}, ${EXERCISE_LIBRARY_NAME_COLUMN}`)
    .eq(EXERCISE_LIBRARY_NAME_COLUMN, normalizedExerciseName)
    .maybeSingle();

  if (exerciseError) {
    throw exerciseError;
  }

  if (!exerciseRow?.[EXERCISE_LIBRARY_ID_COLUMN]) {
    return [];
  }

  const { data: activationRows, error: activationError } = await supabase
    .from(MUSCLE_ACTIVATION_TABLE)
    .select("muscle_id, activation_percent, activation_level")
    .eq("exercise_id", exerciseRow[EXERCISE_LIBRARY_ID_COLUMN])
    .order("activation_percent", { ascending: false });

  if (activationError) {
    throw activationError;
  }

  const muscleIds = [...new Set((activationRows ?? []).map((row) => row.muscle_id))];

  if (muscleIds.length === 0) {
    return [];
  }

  const { data: muscleRows, error: muscleError } = await supabase
    .from(MUSCLE_TABLE)
    .select("id, name, nickname")
    .in("id", muscleIds);

  if (muscleError) {
    throw muscleError;
  }

  const muscleMap = new Map((muscleRows ?? []).map((row) => [row.id, row]));

  return (activationRows ?? [])
    .map((row) => {
      const muscle = muscleMap.get(row.muscle_id);

      if (!muscle) {
        return null;
      }

      const fullName = muscle.name?.trim() || "Unknown muscle";
      const nickname = muscle.nickname?.trim() || fullName;

      return {
        muscle_id: row.muscle_id,
        nickname,
        muscle_name: fullName,
        activation_percent: Number(row.activation_percent) || 0,
        activation_level: normalizeActivationLevel(row.activation_level),
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.activation_percent !== left.activation_percent) {
        return right.activation_percent - left.activation_percent;
      }

      return left.nickname.localeCompare(right.nickname, undefined, {
        sensitivity: "base",
      });
    });
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
      const progressionWeight = await getDefaultMesocycleProgressionWeight(db, {
        programId,
        mesocycleNumber: mesocycle.mesocycle_number,
        exerciseName,
      });

      await weightliftingRepository.insertRmWeightProgression(db, {
        mesocycleId: mesocycle.mesocycle_id,
        exerciseName,
        progressionWeight,
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

  const rows =
    await weightliftingRepository.getMesocycleEstimatedSetProgressionsByProgram(
      db,
      programId
    );
  const selectedExerciseNames = await getSelectedProgramBestExerciseNames(
    db,
    programId
  );
  const groupedProgressions = buildProgressionGroups(rows, selectedExerciseNames);
  const progressions = groupedProgressions[mesocycleId] ?? [];

  const uniformBlockDelta =
    progressions.length > 0 &&
    progressions.every(
      (progression) =>
        progression.block_delta === progressions[0].block_delta
    )
      ? progressions[0].block_delta
      : null;

  return {
    summary:
      rows.length === 0
        ? "No 1 RM values yet."
        : progressions.length === 0
          ? "No Program bests selected."
        : mesocycleNumber === 1 && uniformBlockDelta === 0
          ? "Base 1 RM values"
        : uniformBlockDelta !== null
          ? `This block: ${formatSignedWeightDisplay(uniformBlockDelta)}`
          : "Custom progression",
    progressions,
  };
}

export async function getMesocycleProgressiveOverloadByProgram(db, programId) {
  await ensureProgramMesocycleProgressions(db, programId);

  const rows =
    await weightliftingRepository.getMesocycleEstimatedSetProgressionsByProgram(
      db,
      programId
    );
  const selectedExerciseNames = await getSelectedProgramBestExerciseNames(
    db,
    programId
  );

  return buildProgressionGroups(rows, selectedExerciseNames);
}

export async function adjustMesocycleProgressionByDelta(
  db,
  { programId, mesocycleId, exerciseName, delta }
) {
  const numericDelta = Number(delta);

  if (!Number.isFinite(numericDelta) || numericDelta === 0) {
    return;
  }

  const mesocycles = await ensureProgramMesocycleProgressions(db, programId);
  const currentMesocycle = mesocycles.find(
    (mesocycle) => mesocycle.mesocycle_id === mesocycleId
  );

  if (!currentMesocycle) {
    throw new Error("Mesocycle not found");
  }

  await withTransaction(db, async () => {
    await weightliftingRepository.incrementRmWeightProgressionsFromMesocycle(
      db,
      {
        programId,
        exerciseName,
        mesocycleNumber: currentMesocycle.mesocycle_number,
        delta: numericDelta,
      }
    );
  });
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

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session?.user?.id ?? null;
}

async function loadWorkoutExercisesFromLocal(db, workoutId) {
  const exercises = await weightliftingRepository.getExercisesByWorkout(
    db,
    workoutId
  );
  const sets = await weightliftingRepository.getSetsByWorkout(db, workoutId);

  const setsByExercise = {};
  for (const set of sets) {
    if (!setsByExercise[set.exercise_instance_id]) {
      setsByExercise[set.exercise_instance_id] = [];
    }
    setsByExercise[set.exercise_instance_id].push(set);
  }

  return exercises.map((exercise) => {
    const exerciseSets = setsByExercise[exercise.exercise_id] ?? [];
    const plannedSetCount = Number(exercise.sets) || 0;

    return {
      ...exercise,
      plannedSetCount,
      sets: exerciseSets,
      setCount: exerciseSets.length,
      visibleColumns: parseVisibleColumns(exercise.visible_columns),
    };
  });
}

function shouldHydrateWorkoutExerciseData(exercises) {
  if (exercises.length === 0) {
    return true;
  }

  return exercises.some((exercise) => {
    const expectedSetCount = Number(exercise.plannedSetCount) || 0;
    return expectedSetCount > 0 && exercise.setCount === 0;
  });
}

async function hydrateWorkoutStrengthDataFromCloud(db, workoutId) {
  const [userId, workoutSyncMetadata, localExercises] = await Promise.all([
    getAuthenticatedUserId(),
    programRepository.getWorkoutSyncMetadata(db, workoutId),
    weightliftingRepository.getExercisesForCloudSync(db),
  ]);
  const cloudWorkoutTypeInstanceId = normalizeOptionalInteger(
    workoutSyncMetadata?.cloud_workout_type_instance_id,
    null
  );

  if (!userId || cloudWorkoutTypeInstanceId === null) {
    return false;
  }

  const { data: cloudExercises, error: cloudExercisesError } = await supabase
    .from(EXERCISE_INSTANCE_CLOUD_TABLE)
    .select(EXERCISE_INSTANCE_CLOUD_SELECT)
    .eq("user_id", userId)
    .eq("cloud_workout_type_instance_id", cloudWorkoutTypeInstanceId)
    .order("id", { ascending: true });

  if (cloudExercisesError) {
    throw cloudExercisesError;
  }

  const localExercisesForWorkout = localExercises.filter(
    (exercise) => Number(exercise.workout_type_instance_id) === Number(workoutId)
  );
  const localExercisesByCloudId = new Map();
  const localExercisesByRemoteLocalId = new Map();
  const localExercisesByLocalId = new Map();

  for (const exercise of localExercisesForWorkout) {
    const cloudExerciseInstanceId = normalizeOptionalInteger(
      exercise.cloud_exercise_instance_id,
      null
    );
    const remoteLocalExerciseInstanceId = normalizeOptionalInteger(
      exercise.remote_local_exercise_instance_id,
      null
    );

    if (cloudExerciseInstanceId !== null) {
      localExercisesByCloudId.set(cloudExerciseInstanceId, exercise);
    }

    if (remoteLocalExerciseInstanceId !== null) {
      localExercisesByRemoteLocalId.set(remoteLocalExerciseInstanceId, exercise);
    }

    localExercisesByLocalId.set(exercise.exercise_instance_id, exercise);
  }

  let didHydrate = false;

  await withTransaction(db, async () => {
    for (const cloudExercise of cloudExercises ?? []) {
      const cloudExerciseInstanceId = normalizeOptionalInteger(
        cloudExercise?.id,
        null
      );
      const remoteLocalExerciseInstanceId = normalizeOptionalInteger(
        cloudExercise?.local_exercise_instance_id,
        null
      );
      const exerciseName = normalizeOptionalText(cloudExercise?.exercise_name);

      if (cloudExerciseInstanceId === null || !exerciseName) {
        continue;
      }

      const localExercise =
        localExercisesByCloudId.get(cloudExerciseInstanceId) ??
        localExercisesByRemoteLocalId.get(remoteLocalExerciseInstanceId) ??
        localExercisesByLocalId.get(remoteLocalExerciseInstanceId) ??
        null;

      if (normalizeOptionalText(cloudExercise?.deleted_at)) {
        if (!localExercise) {
          continue;
        }

        await weightliftingRepository.deleteSetsByExercise(
          db,
          localExercise.exercise_instance_id
        );
        await weightliftingRepository.deleteExerciseById(
          db,
          localExercise.exercise_instance_id
        );
        didHydrate = true;
        continue;
      }

      const exercisePayload = {
        cloudExerciseInstanceId,
        remoteLocalExerciseInstanceId,
        syncId: normalizeSyncId(cloudExercise?.sync_id),
        syncVersion: normalizeOptionalInteger(cloudExercise?.sync_version, 0),
        deletedAt: normalizeOptionalText(cloudExercise?.deleted_at),
        workoutId,
        exerciseName,
        sets: Math.max(0, normalizeOptionalInteger(cloudExercise?.sets, 0) ?? 0),
        visibleColumns: serializeVisibleColumns(cloudExercise?.visible_columns),
        note: normalizeOptionalText(cloudExercise?.note),
        done: normalizeBooleanFlag(cloudExercise?.done),
      };

      if (!localExercise) {
        const createdExerciseResult =
          await weightliftingRepository.createExerciseFromCloud(
            db,
            exercisePayload
          );
        const createdExercise = {
          exercise_instance_id: createdExerciseResult.lastInsertRowId,
          cloud_exercise_instance_id: cloudExerciseInstanceId,
          remote_local_exercise_instance_id: remoteLocalExerciseInstanceId,
          workout_type_instance_id: workoutId,
        };

        localExercisesByCloudId.set(cloudExerciseInstanceId, createdExercise);
        if (remoteLocalExerciseInstanceId !== null) {
          localExercisesByRemoteLocalId.set(
            remoteLocalExerciseInstanceId,
            createdExercise
          );
          localExercisesByLocalId.set(
            remoteLocalExerciseInstanceId,
            createdExercise
          );
        }
        localExercisesByLocalId.set(
          createdExercise.exercise_instance_id,
          createdExercise
        );
        didHydrate = true;
        continue;
      }

      await weightliftingRepository.updateExerciseFromCloud(db, {
        exerciseId: localExercise.exercise_instance_id,
        ...exercisePayload,
      });
      didHydrate = true;
    }
  });

  const refreshedExercises = (
    await weightliftingRepository.getExercisesForCloudSync(db)
  ).filter(
    (exercise) => Number(exercise.workout_type_instance_id) === Number(workoutId)
  );
  const localExerciseIds = new Set(
    refreshedExercises.map((exercise) => exercise.exercise_instance_id)
  );
  const localExercisesByCloudExerciseId = new Map();

  for (const exercise of refreshedExercises) {
    const cloudExerciseInstanceId = normalizeOptionalInteger(
      exercise.cloud_exercise_instance_id,
      null
    );

    if (cloudExerciseInstanceId !== null) {
      localExercisesByCloudExerciseId.set(cloudExerciseInstanceId, exercise);
    }
  }

  const cloudExerciseIds = [...localExercisesByCloudExerciseId.keys()];

  if (cloudExerciseIds.length === 0) {
    return didHydrate;
  }

  const { data: cloudSets, error: cloudSetsError } = await supabase
    .from(SET_CLOUD_TABLE)
    .select(SET_CLOUD_SELECT)
    .eq("user_id", userId)
    .in("cloud_exercise_instance_id", cloudExerciseIds)
    .order("cloud_exercise_instance_id", { ascending: true })
    .order("id", { ascending: true });

  if (cloudSetsError) {
    throw cloudSetsError;
  }

  const localSets = (await weightliftingRepository.getSetsForCloudSync(db)).filter(
    (set) => localExerciseIds.has(set.exercise_instance_id)
  );
  const localSetsByCloudId = new Map();
  const localSetsByRemoteLocalId = new Map();
  const localSetsByLocalId = new Map();

  for (const localSet of localSets) {
    const cloudSetId = normalizeOptionalInteger(localSet.cloud_set_id, null);
    const remoteLocalSetId = normalizeOptionalInteger(
      localSet.remote_local_set_id,
      null
    );

    if (cloudSetId !== null) {
      localSetsByCloudId.set(cloudSetId, localSet);
    }

    if (remoteLocalSetId !== null) {
      localSetsByRemoteLocalId.set(remoteLocalSetId, localSet);
    }

    localSetsByLocalId.set(localSet.sets_id, localSet);
  }

  await withTransaction(db, async () => {
    for (const cloudSet of cloudSets ?? []) {
      const cloudSetId = normalizeOptionalInteger(cloudSet?.id, null);
      const remoteLocalSetId = normalizeOptionalInteger(
        cloudSet?.local_set_id,
        null
      );
      const cloudExerciseInstanceId = normalizeOptionalInteger(
        cloudSet?.cloud_exercise_instance_id,
        null
      );
      const parentExercise =
        localExercisesByCloudExerciseId.get(cloudExerciseInstanceId) ?? null;

      if (
        cloudSetId === null ||
        cloudExerciseInstanceId === null ||
        !parentExercise
      ) {
        continue;
      }

      const localSet =
        localSetsByCloudId.get(cloudSetId) ??
        localSetsByRemoteLocalId.get(remoteLocalSetId) ??
        localSetsByLocalId.get(remoteLocalSetId) ??
        null;

      if (normalizeOptionalText(cloudSet?.deleted_at)) {
        if (!localSet) {
          continue;
        }

        await weightliftingRepository.deleteSetById(db, localSet.sets_id);
        didHydrate = true;
        continue;
      }

      const setPayload = {
        cloudSetId,
        remoteLocalSetId,
        syncId: normalizeSyncId(cloudSet?.sync_id),
        syncVersion: normalizeOptionalInteger(cloudSet?.sync_version, 0),
        deletedAt: normalizeOptionalText(cloudSet?.deleted_at),
        exerciseId: parentExercise.exercise_instance_id,
        setNumber: normalizeOptionalInteger(cloudSet?.set_number, 1),
        personalRecord: normalizeBooleanFlag(cloudSet?.personal_record),
        pause: normalizeOptionalInteger(cloudSet?.pause, null),
        rpe: normalizeOptionalInteger(cloudSet?.rpe, null),
        weight: normalizeOptionalInteger(cloudSet?.weight, null),
        rmPercentage: normalizeOptionalInteger(cloudSet?.rm_percentage, null),
        reps: normalizeOptionalInteger(cloudSet?.reps, null),
        done: normalizeBooleanFlag(cloudSet?.done),
        failed: normalizeBooleanFlag(cloudSet?.failed),
        amrap: normalizeBooleanFlag(cloudSet?.amrap),
        note: normalizeOptionalText(cloudSet?.note),
      };

      if (!localSet) {
        await weightliftingRepository.createSetFromCloud(db, setPayload);
        didHydrate = true;
        continue;
      }

      await weightliftingRepository.updateSetFromCloud(db, {
        setId: localSet.sets_id,
        ...setPayload,
      });
      didHydrate = true;
    }

    await weightliftingRepository.refreshExerciseDerivedFieldsFromSets(db);
  });

  return didHydrate;
}

export async function syncStrengthWorkoutDataFromCloud(db) {
  const programServiceModule = await import("./programService");
  return enqueueSync(() => programServiceModule.syncSetsWithCloud(db));
}

export async function hydrateStrengthWorkoutDataForWorkout(db, workoutId) {
  let exercises = await loadWorkoutExercisesFromLocal(db, workoutId);

  if (!shouldHydrateWorkoutExerciseData(exercises)) {
    return exercises;
  }

  let targetedHydrationError = null;

  try {
    await hydrateWorkoutStrengthDataFromCloud(db, workoutId);
    exercises = await loadWorkoutExercisesFromLocal(db, workoutId);
  } catch (hydrateError) {
    targetedHydrationError = hydrateError;
  }

  if (!shouldHydrateWorkoutExerciseData(exercises)) {
    return exercises;
  }

  let syncError = null;

  try {
    await syncStrengthWorkoutDataFromCloud(db);
    exercises = await loadWorkoutExercisesFromLocal(db, workoutId);
  } catch (error) {
    syncError = error;
  }

  if (shouldHydrateWorkoutExerciseData(exercises)) {
    if (targetedHydrationError || syncError) {
      throw new Error(
        `Targeted workout hydration failed: ${
          targetedHydrationError?.message ?? "unknown targeted hydration error"
        }. Global strength sync failed: ${
          syncError?.message ?? "unknown global sync error"
        }.`
      );
    }

    console.warn(
      "Workout hydration completed, but the workout is still missing exercise or set data.",
      { workoutId }
    );
  }

  return exercises;
}

export async function getWorkoutExercises(
  db,
  workoutId,
  { ensureHydrated = false } = {}
) {
  let exercises = await loadWorkoutExercisesFromLocal(db, workoutId);

  if (ensureHydrated && shouldHydrateWorkoutExerciseData(exercises)) {
    try {
      exercises = await hydrateStrengthWorkoutDataForWorkout(db, workoutId);
    } catch (error) {
      console.warn(
        "Unable to hydrate strength workout exercises from cloud:",
        error
      );
    }
  }

  return exercises;
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

  syncExerciseInstancesInBackground(db);
}

export async function deleteExercise(db, exerciseId) {
  await withTransaction(db, async () => {
    const exercise = await weightliftingRepository.getWorkoutIdByExercise(
      db,
      exerciseId
    );
    const syncMetadata = await weightliftingRepository.getExerciseSyncMetadata(
      db,
      exerciseId
    );
    const remoteLocalExerciseInstanceId =
      Number(syncMetadata?.remote_local_exercise_instance_id) ||
      Number(syncMetadata?.exercise_instance_id) ||
      Number(exerciseId) ||
      null;
    const deleteSyncVersion = createNextSyncVersion(syncMetadata?.sync_version);

    if (
      syncMetadata?.cloud_exercise_instance_id ||
      remoteLocalExerciseInstanceId !== null
    ) {
      await weightliftingRepository.queueExerciseInstanceDeleteSync(db, {
        cloudExerciseInstanceId:
          syncMetadata?.cloud_exercise_instance_id ?? null,
        remoteLocalExerciseInstanceId,
        syncId: normalizeSyncId(syncMetadata?.sync_id),
        syncVersion: deleteSyncVersion,
        deletedAt: new Date().toISOString(),
      });
    }

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

  syncExerciseInstancesInBackground(db);
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

  syncExerciseInstancesInBackground(db);
  syncSetsInBackground(db);
}

export async function updateExerciseVisibleColumns(
  db,
  { exerciseId, columns }
) {
  await weightliftingRepository.updateExerciseVisibleColumns(db, {
    exerciseId,
    columns,
  });
  syncExerciseInstancesInBackground(db);
}

export async function updateExerciseNote(db, { exerciseId, note }) {
  await weightliftingRepository.updateExerciseNote(db, {
    exerciseId,
    note,
  });
  syncExerciseInstancesInBackground(db);
}

export async function updateStrengthSetDone(db, { workoutId, setId, done }) {
  await withTransaction(db, async () => {
    await weightliftingRepository.updateSetDone(db, { setId, done });
    await weightliftingRepository.updateExerciseDoneBySet(db, setId);
    await weightliftingRepository.updateWorkoutDoneFromExercises(db, workoutId);
    await workoutService.refreshWorkoutHierarchyCompletion(db, workoutId);
  });

  syncExerciseInstancesInBackground(db);
  syncSetsInBackground(db);
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

    const syncMetadata = await weightliftingRepository.getSetSyncMetadata(
      db,
      setId
    );
    const remoteLocalSetId =
      Number(syncMetadata?.remote_local_set_id) ||
      Number(syncMetadata?.sets_id) ||
      Number(setId) ||
      null;
    const deleteSyncVersion = createNextSyncVersion(syncMetadata?.sync_version);

    if (syncMetadata?.cloud_set_id || remoteLocalSetId !== null) {
      await weightliftingRepository.queueSetDeleteSync(db, {
        cloudSetId: syncMetadata?.cloud_set_id ?? null,
        remoteLocalSetId,
        syncId: normalizeSyncId(syncMetadata?.sync_id),
        syncVersion: deleteSyncVersion,
        deletedAt: new Date().toISOString(),
      });
    }

    await weightliftingRepository.deleteSetById(db, setId);

    const sets = await weightliftingRepository.getSetIdsByExercise(
      db,
      set.exercise_instance_id
    );
    let setNumber = 1;
    for (const row of sets) {
      await weightliftingRepository.updateSetNumber(db, {
        setId: row.sets_id,
        setNumber,
      });
      setNumber += 1;
    }

    await weightliftingRepository.updateExerciseSetCount(db, set.exercise_instance_id);
    await weightliftingRepository.updateExerciseDoneFromSets(db, set.exercise_instance_id);
    await weightliftingRepository.updateWorkoutDoneFromExercises(
      db,
      set.workout_id
    );
    await workoutService.refreshWorkoutHierarchyCompletion(db, set.workout_id);
  });

  syncExerciseInstancesInBackground(db);
  syncSetsInBackground(db);
}

export async function updateSetField(db, { field, value, setId }) {
  await weightliftingRepository.updateSetField(db, { field, value, setId });
  syncSetsInBackground(db);
}

export async function updateSetRmPercentage(db, { setId, rmPercentage }) {
  const nextRmPercentage = normalizeOptionalNumber(rmPercentage);

  const result = await withTransaction(db, async () => {
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

  syncSetsInBackground(db);
  return result;
}

export async function updateSetWeight(db, { setId, weight }) {
  const nextWeight = normalizeOptionalNumber(weight);

  const result = await withTransaction(db, async () => {
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

  syncSetsInBackground(db);
  return result;
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

  syncExerciseInstancesInBackground(db);
  syncSetsInBackground(db);
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

  syncExerciseInstancesInBackground(db);
  syncSetsInBackground(db);
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

  syncExerciseInstancesInBackground(db);
}

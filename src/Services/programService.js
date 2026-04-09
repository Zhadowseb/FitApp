import {
  formatDate,
  normalizeIsoDateString,
  normalizeLocalDateString,
  parseCustomDate,
} from "../Utils/dateUtils";
import { supabase } from "../Database/supaBaseClient";
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
const PROGRAM_CLOUD_TABLE = "Program";
const PROGRAM_STATUS_VALUES = new Set(["COMPLETE", "ACTIVE", "NOT_STARTED"]);
const PROGRAM_CLOUD_SYNC_SELECT =
  "id, user_id, local_program_id, program_name, start_date, status";
const MESOCYCLE_CLOUD_TABLE = "Mesocycle";
const MESOCYCLE_CLOUD_SYNC_SELECT =
  "id, user_id, local_mesocycle_id, local_program_id, mesocycle_number, weeks, focus, done";

let activeProgramSyncPromise = null;
let activeMesocycleSyncPromise = null;

function formatDisplayNumber(value) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function normalizeProgramName(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeProgramStartDate(value) {
  return normalizeLocalDateString(value);
}

function normalizeProgramStartDateForCloud(value) {
  return normalizeIsoDateString(value);
}

function normalizeProgramStatus(value) {
  const normalizedStatus =
    typeof value === "string" ? value.trim().toUpperCase() : "";

  return PROGRAM_STATUS_VALUES.has(normalizedStatus)
    ? normalizedStatus
    : "NOT_STARTED";
}

function resolveProgramCloudLocalId(program) {
  return normalizeOptionalInteger(
    program?.remote_local_program_id ??
      program?.local_program_id ??
      program?.program_id,
    null
  );
}

function getComparableProgramSnapshot(program) {
  return {
    local_program_id: resolveProgramCloudLocalId(program),
    program_name: normalizeProgramName(program?.program_name),
    start_date: normalizeProgramStartDate(program?.start_date),
    status: normalizeProgramStatus(program?.status),
  };
}

function areComparableProgramsEqual(leftProgram, rightProgram) {
  const leftSnapshot = getComparableProgramSnapshot(leftProgram);
  const rightSnapshot = getComparableProgramSnapshot(rightProgram);

  return (
    leftSnapshot.local_program_id === rightSnapshot.local_program_id &&
    leftSnapshot.program_name === rightSnapshot.program_name &&
    leftSnapshot.start_date === rightSnapshot.start_date &&
    leftSnapshot.status === rightSnapshot.status
  );
}

function buildCloudProgramPayload(localProgram, userId) {
  return {
    user_id: userId,
    local_program_id: resolveProgramCloudLocalId(localProgram),
    program_name: normalizeProgramName(localProgram.program_name),
    start_date: normalizeProgramStartDateForCloud(localProgram.start_date),
    status: normalizeProgramStatus(localProgram.status),
  };
}

function parseCloudProgramId(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeOptionalText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalInteger(value, fallbackValue = 0) {
  if (value === null || value === undefined || value === "") {
    return fallbackValue;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.trunc(numericValue) : fallbackValue;
}

function normalizeBooleanFlag(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    return ["1", "true", "yes"].includes(normalizedValue);
  }

  return false;
}

function parseCloudMesocycleId(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function getComparableMesocycleSnapshot(mesocycle) {
  return {
    local_program_id: normalizeOptionalInteger(
      mesocycle?.local_program_id ?? mesocycle?.program_id,
      null
    ),
    mesocycle_number: normalizeOptionalInteger(mesocycle?.mesocycle_number, 0),
    weeks: normalizeOptionalInteger(mesocycle?.weeks, 0),
    focus: normalizeOptionalText(mesocycle?.focus),
    done: normalizeBooleanFlag(mesocycle?.done),
  };
}

function areComparableMesocyclesEqual(leftMesocycle, rightMesocycle) {
  const leftSnapshot = getComparableMesocycleSnapshot(leftMesocycle);
  const rightSnapshot = getComparableMesocycleSnapshot(rightMesocycle);

  return (
    leftSnapshot.local_program_id === rightSnapshot.local_program_id &&
    leftSnapshot.mesocycle_number === rightSnapshot.mesocycle_number &&
    leftSnapshot.weeks === rightSnapshot.weeks &&
    leftSnapshot.focus === rightSnapshot.focus &&
    leftSnapshot.done === rightSnapshot.done
  );
}

function buildCloudMesocyclePayload(localMesocycle, userId, localProgramId) {
  return {
    user_id: userId,
    local_mesocycle_id: localMesocycle.mesocycle_id,
    local_program_id: localProgramId,
    mesocycle_number: normalizeOptionalInteger(localMesocycle.mesocycle_number, 0),
    weeks: normalizeOptionalInteger(localMesocycle.weeks, 0),
    focus: normalizeOptionalText(localMesocycle.focus),
    done: normalizeBooleanFlag(localMesocycle.done),
  };
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session?.user?.id ?? null;
}

async function deleteCloudRowForUserOrThrow({
  tableName,
  rowId,
  userId,
  entityLabel,
}) {
  const { data: deletedRow, error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    throw deleteError;
  }

  if (deletedRow?.id !== null && deletedRow?.id !== undefined) {
    return true;
  }

  const { data: existingRow, error: selectError } = await supabase
    .from(tableName)
    .select("id")
    .eq("id", rowId)
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingRow?.id !== null && existingRow?.id !== undefined) {
    throw new Error(
      `${entityLabel} cloud delete did not remove the remote row. The delete will stay queued and retry on the next sync.`
    );
  }

  return false;
}

async function processQueuedProgramDeletes(db, userId) {
  const queuedDeletes = await programRepository.getQueuedProgramDeletes(db);
  let deletedCount = 0;

  for (const queuedDelete of queuedDeletes) {
    const wasDeletedNow = await deleteCloudRowForUserOrThrow({
      tableName: PROGRAM_CLOUD_TABLE,
      rowId: queuedDelete.cloud_program_id,
      userId,
      entityLabel: "Program",
    });

    await programRepository.deleteQueuedProgramDelete(
      db,
      queuedDelete.program_sync_delete_id
    );
    deletedCount += wasDeletedNow ? 1 : 0;
  }

  return deletedCount;
}

async function uploadDirtyPrograms(db, userId) {
  const localPrograms = await programRepository.getProgramsForCloudSync(db);
  let uploadedCount = 0;

  for (const localProgram of localPrograms) {
    if (Number(localProgram.needs_sync) !== 1) {
      continue;
    }

    const payload = buildCloudProgramPayload(localProgram, userId);

    if (payload.local_program_id === null || !payload.start_date) {
      continue;
    }

    if (localProgram.cloud_program_id) {
      const { data: updatedProgram, error: updateError } = await supabase
        .from(PROGRAM_CLOUD_TABLE)
        .update({
          program_name: payload.program_name,
          start_date: payload.start_date,
          status: payload.status,
        })
        .eq("id", localProgram.cloud_program_id)
        .eq("user_id", userId)
        .select("id, local_program_id")
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      let syncedProgramRecord = updatedProgram;
      let cloudProgramId = parseCloudProgramId(updatedProgram?.id);

      if (cloudProgramId === null) {
        const { data: insertedProgram, error: insertError } = await supabase
          .from(PROGRAM_CLOUD_TABLE)
          .insert(payload)
          .select("id, local_program_id")
          .single();

        if (insertError) {
          throw insertError;
        }

        syncedProgramRecord = insertedProgram;
        cloudProgramId = parseCloudProgramId(insertedProgram?.id);
      }

      if (cloudProgramId === null) {
        throw new Error("Could not resolve cloud program id after update.");
      }

      const remoteLocalProgramId =
        resolveProgramCloudLocalId(syncedProgramRecord) ??
        payload.local_program_id;

      await programRepository.markProgramSynced(db, {
        programId: localProgram.program_id,
        cloudProgramId,
        remoteLocalProgramId,
      });
      uploadedCount += 1;
      continue;
    }

    const { data: syncedProgram, error: syncError } = await supabase
      .from(PROGRAM_CLOUD_TABLE)
      .upsert(payload, {
        onConflict: "user_id,local_program_id",
      })
      .select("id, local_program_id")
      .single();

    if (syncError) {
      throw syncError;
    }

    const cloudProgramId = parseCloudProgramId(syncedProgram?.id);

    if (cloudProgramId === null) {
      throw new Error("Could not resolve cloud program id after insert.");
    }

    const remoteLocalProgramId =
      resolveProgramCloudLocalId(syncedProgram) ?? payload.local_program_id;

    await programRepository.markProgramSynced(db, {
      programId: localProgram.program_id,
      cloudProgramId,
      remoteLocalProgramId,
    });
    uploadedCount += 1;
  }

  return uploadedCount;
}

async function reconcileProgramsFromCloud(db, userId) {
  const { data: cloudPrograms, error } = await supabase
    .from(PROGRAM_CLOUD_TABLE)
    .select(PROGRAM_CLOUD_SYNC_SELECT)
    .eq("user_id", userId)
    .order("start_date", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  const localPrograms = await programRepository.getProgramsForCloudSync(db);
  const localProgramsByCloudId = new Map();

  for (const localProgram of localPrograms) {
    const cloudProgramId = parseCloudProgramId(localProgram.cloud_program_id);

    if (cloudProgramId !== null) {
      localProgramsByCloudId.set(cloudProgramId, localProgram);
    }
  }

  let downloadedCount = 0;

  await withTransaction(db, async () => {
    for (const cloudProgram of cloudPrograms ?? []) {
      const cloudProgramId = parseCloudProgramId(cloudProgram.id);
      const comparableCloudProgram = getComparableProgramSnapshot(cloudProgram);

      if (
        cloudProgramId === null ||
        comparableCloudProgram.local_program_id === null ||
        !comparableCloudProgram.start_date
      ) {
        continue;
      }

      const localProgram = localProgramsByCloudId.get(cloudProgramId);

      if (!localProgram) {
        const result = await programRepository.createProgramFromCloud(db, {
          cloudProgramId,
          remoteLocalProgramId: comparableCloudProgram.local_program_id,
          programName: comparableCloudProgram.program_name,
          startDate: comparableCloudProgram.start_date,
          status: comparableCloudProgram.status,
        });

        localProgramsByCloudId.set(cloudProgramId, {
          program_id: result.lastInsertRowId,
          cloud_program_id: cloudProgramId,
          remote_local_program_id: comparableCloudProgram.local_program_id,
          ...comparableCloudProgram,
          needs_sync: 0,
        });
        downloadedCount += 1;
        continue;
      }

      if (Number(localProgram.needs_sync) === 1) {
        continue;
      }

      if (areComparableProgramsEqual(localProgram, comparableCloudProgram)) {
        continue;
      }

      await programRepository.updateProgramFromCloud(db, {
        programId: localProgram.program_id,
        cloudProgramId,
        remoteLocalProgramId: comparableCloudProgram.local_program_id,
        programName: comparableCloudProgram.program_name,
        startDate: comparableCloudProgram.start_date,
        status: comparableCloudProgram.status,
      });

      localProgramsByCloudId.set(cloudProgramId, {
        ...localProgram,
        cloud_program_id: cloudProgramId,
        remote_local_program_id: comparableCloudProgram.local_program_id,
        ...comparableCloudProgram,
        needs_sync: 0,
      });
      downloadedCount += 1;
    }
  });

  return downloadedCount;
}

async function syncProgramsWithCloudInternal(db) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      changed: false,
      deletedCount: 0,
      downloadedCount: 0,
      uploadedCount: 0,
    };
  }

  const deletedCount = await processQueuedProgramDeletes(db, userId);
  const uploadedCount = await uploadDirtyPrograms(db, userId);
  const downloadedCount = await reconcileProgramsFromCloud(db, userId);

  return {
    changed: deletedCount > 0 || uploadedCount > 0 || downloadedCount > 0,
    deletedCount,
    downloadedCount,
    uploadedCount,
  };
}

function syncProgramsInBackground(db) {
  void syncProgramsWithCloud(db).catch((error) => {
    console.error("Program cloud sync failed:", error);
  });
}

async function processQueuedMesocycleDeletes(db, userId) {
  const queuedDeletes = await programRepository.getQueuedMesocycleDeletes(db);
  let deletedCount = 0;

  for (const queuedDelete of queuedDeletes) {
    const wasDeletedNow = await deleteCloudRowForUserOrThrow({
      tableName: MESOCYCLE_CLOUD_TABLE,
      rowId: queuedDelete.cloud_mesocycle_id,
      userId,
      entityLabel: "Mesocycle",
    });

    await programRepository.deleteQueuedMesocycleDelete(
      db,
      queuedDelete.mesocycle_sync_delete_id
    );
    deletedCount += wasDeletedNow ? 1 : 0;
  }

  return deletedCount;
}

async function uploadDirtyMesocycles(db, userId) {
  const [localMesocycles, localPrograms] = await Promise.all([
    programRepository.getMesocyclesForCloudSync(db),
    programRepository.getProgramsForCloudSync(db),
  ]);
  const localProgramsById = new Map(
    localPrograms.map((program) => [program.program_id, program])
  );
  let uploadedCount = 0;

  for (const localMesocycle of localMesocycles) {
    if (Number(localMesocycle.needs_sync) !== 1) {
      continue;
    }

    const parentProgram = localProgramsById.get(localMesocycle.program_id);
    const parentProgramCloudLocalId = resolveProgramCloudLocalId(parentProgram);

    if (!parentProgram?.cloud_program_id || parentProgramCloudLocalId === null) {
      continue;
    }

    const payload = buildCloudMesocyclePayload(
      localMesocycle,
      userId,
      parentProgramCloudLocalId
    );

    if (localMesocycle.cloud_mesocycle_id) {
      const { data: updatedMesocycle, error: updateError } = await supabase
        .from(MESOCYCLE_CLOUD_TABLE)
        .update({
          local_program_id: payload.local_program_id,
          mesocycle_number: payload.mesocycle_number,
          weeks: payload.weeks,
          focus: payload.focus,
          done: payload.done,
        })
        .eq("id", localMesocycle.cloud_mesocycle_id)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      let cloudMesocycleId = parseCloudMesocycleId(updatedMesocycle?.id);

      if (cloudMesocycleId === null) {
        const { data: insertedMesocycle, error: insertError } = await supabase
          .from(MESOCYCLE_CLOUD_TABLE)
          .insert(payload)
          .select("id")
          .single();

        if (insertError) {
          throw insertError;
        }

        cloudMesocycleId = parseCloudMesocycleId(insertedMesocycle?.id);
      }

      if (cloudMesocycleId === null) {
        throw new Error("Could not resolve cloud mesocycle id after update.");
      }

      await programRepository.markMesocycleSynced(db, {
        mesocycleId: localMesocycle.mesocycle_id,
        cloudMesocycleId,
      });
      uploadedCount += 1;
      continue;
    }

    const { data: syncedMesocycle, error: syncError } = await supabase
      .from(MESOCYCLE_CLOUD_TABLE)
      .upsert(payload, {
        onConflict: "user_id,local_mesocycle_id",
      })
      .select("id")
      .single();

    if (syncError) {
      throw syncError;
    }

    const cloudMesocycleId = parseCloudMesocycleId(syncedMesocycle?.id);

    if (cloudMesocycleId === null) {
      throw new Error("Could not resolve cloud mesocycle id after insert.");
    }

    await programRepository.markMesocycleSynced(db, {
      mesocycleId: localMesocycle.mesocycle_id,
      cloudMesocycleId,
    });
    uploadedCount += 1;
  }

  return uploadedCount;
}

async function reconcileMesocyclesFromCloud(db, userId) {
  const { data: cloudMesocycles, error } = await supabase
    .from(MESOCYCLE_CLOUD_TABLE)
    .select(MESOCYCLE_CLOUD_SYNC_SELECT)
    .eq("user_id", userId)
    .order("local_program_id", { ascending: true })
    .order("mesocycle_number", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  const [localMesocycles, localPrograms] = await Promise.all([
    programRepository.getMesocyclesForCloudSync(db),
    programRepository.getProgramsForCloudSync(db),
  ]);
  const localMesocyclesByCloudId = new Map();
  const localMesocyclesByLocalId = new Map();
  const localProgramsById = new Map(
    localPrograms.map((program) => [program.program_id, program])
  );
  const localProgramsByCloudLocalId = new Map();

  for (const localProgram of localPrograms) {
    const cloudLocalProgramId = resolveProgramCloudLocalId(localProgram);

    if (cloudLocalProgramId !== null) {
      localProgramsByCloudLocalId.set(cloudLocalProgramId, localProgram);
    }
  }

  for (const localMesocycle of localMesocycles) {
    const cloudMesocycleId = parseCloudMesocycleId(
      localMesocycle.cloud_mesocycle_id
    );

    if (cloudMesocycleId !== null) {
      localMesocyclesByCloudId.set(cloudMesocycleId, localMesocycle);
    }

    localMesocyclesByLocalId.set(localMesocycle.mesocycle_id, localMesocycle);
  }

  let downloadedCount = 0;

  await withTransaction(db, async () => {
    for (const cloudMesocycle of cloudMesocycles ?? []) {
      const cloudMesocycleId = parseCloudMesocycleId(cloudMesocycle.id);
      const localMesocycleId = normalizeOptionalInteger(
        cloudMesocycle.local_mesocycle_id,
        null
      );
      const localProgramId = normalizeOptionalInteger(
        cloudMesocycle.local_program_id,
        null
      );
      const parentProgram = localProgramsByCloudLocalId.get(localProgramId);
      const comparableCloudMesocycle = getComparableMesocycleSnapshot(
        cloudMesocycle
      );

      if (
        cloudMesocycleId === null ||
        localMesocycleId === null ||
        localProgramId === null ||
        !parentProgram
      ) {
        continue;
      }

      const localMesocycle =
        localMesocyclesByCloudId.get(cloudMesocycleId) ??
        localMesocyclesByLocalId.get(localMesocycleId) ??
        null;

      if (!localMesocycle) {
        await programRepository.createMesocycleFromCloud(db, {
          localMesocycleId,
          cloudMesocycleId,
          programId: parentProgram.program_id,
          mesocycleNumber: comparableCloudMesocycle.mesocycle_number,
          weeks: comparableCloudMesocycle.weeks,
          focus: comparableCloudMesocycle.focus,
          done: comparableCloudMesocycle.done,
        });

        const createdMesocycle = {
          mesocycle_id: localMesocycleId,
          cloud_mesocycle_id: cloudMesocycleId,
          program_id: parentProgram.program_id,
          mesocycle_number: comparableCloudMesocycle.mesocycle_number,
          weeks: comparableCloudMesocycle.weeks,
          focus: comparableCloudMesocycle.focus,
          done: comparableCloudMesocycle.done ? 1 : 0,
          needs_sync: 0,
        };

        localMesocyclesByCloudId.set(cloudMesocycleId, createdMesocycle);
        localMesocyclesByLocalId.set(localMesocycleId, createdMesocycle);
        downloadedCount += 1;
        continue;
      }

      if (Number(localMesocycle.needs_sync) === 1) {
        continue;
      }

      const comparableLocalMesocycle = getComparableMesocycleSnapshot({
        ...localMesocycle,
        local_program_id: resolveProgramCloudLocalId(
          localProgramsById.get(localMesocycle.program_id)
        ),
      });

      if (
        areComparableMesocyclesEqual(
          comparableLocalMesocycle,
          comparableCloudMesocycle
        )
      ) {
        if (!localMesocycle.cloud_mesocycle_id) {
          await programRepository.markMesocycleSynced(db, {
            mesocycleId: localMesocycle.mesocycle_id,
            cloudMesocycleId,
          });
        }
        continue;
      }

      await programRepository.updateMesocycleFromCloud(db, {
        mesocycleId: localMesocycle.mesocycle_id,
        cloudMesocycleId,
        programId: parentProgram.program_id,
        mesocycleNumber: comparableCloudMesocycle.mesocycle_number,
        weeks: comparableCloudMesocycle.weeks,
        focus: comparableCloudMesocycle.focus,
        done: comparableCloudMesocycle.done,
      });

      const updatedMesocycle = {
        ...localMesocycle,
        cloud_mesocycle_id: cloudMesocycleId,
        program_id: parentProgram.program_id,
        mesocycle_number: comparableCloudMesocycle.mesocycle_number,
        weeks: comparableCloudMesocycle.weeks,
        focus: comparableCloudMesocycle.focus,
        done: comparableCloudMesocycle.done ? 1 : 0,
        needs_sync: 0,
      };

      localMesocyclesByCloudId.set(cloudMesocycleId, updatedMesocycle);
      localMesocyclesByLocalId.set(localMesocycle.mesocycle_id, updatedMesocycle);
      downloadedCount += 1;
    }
  });

  return downloadedCount;
}

async function syncMesocyclesWithCloudInternal(db) {
  await syncProgramsWithCloud(db);

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      changed: false,
      deletedCount: 0,
      downloadedCount: 0,
      uploadedCount: 0,
    };
  }

  const deletedCount = await processQueuedMesocycleDeletes(db, userId);
  const uploadedCount = await uploadDirtyMesocycles(db, userId);
  const downloadedCount = await reconcileMesocyclesFromCloud(db, userId);

  return {
    changed: deletedCount > 0 || uploadedCount > 0 || downloadedCount > 0,
    deletedCount,
    downloadedCount,
    uploadedCount,
  };
}

function syncMesocyclesInBackground(db) {
  void syncMesocyclesWithCloud(db).catch((error) => {
    console.error("Mesocycle cloud sync failed:", error);
  });
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
      if (!setsByExerciseId[set.exercise_instance_id]) {
        setsByExerciseId[set.exercise_instance_id] = [];
      }

      setsByExerciseId[set.exercise_instance_id].push(set);
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

export async function syncProgramsWithCloud(db) {
  if (activeProgramSyncPromise) {
    return activeProgramSyncPromise;
  }

  activeProgramSyncPromise = syncProgramsWithCloudInternal(db).finally(() => {
    activeProgramSyncPromise = null;
  });

  return activeProgramSyncPromise;
}

export async function syncMesocyclesWithCloud(db) {
  if (activeMesocycleSyncPromise) {
    return activeMesocycleSyncPromise;
  }

  activeMesocycleSyncPromise = syncMesocyclesWithCloudInternal(db).finally(() => {
    activeMesocycleSyncPromise = null;
  });

  return activeMesocycleSyncPromise;
}

export async function createProgram(db, { programName, startDate, status }) {
  await programRepository.createProgram(db, { programName, startDate, status });
  syncProgramsInBackground(db);
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
  syncProgramsInBackground(db);
}

export async function updateProgramName(db, { programId, programName }) {
  await programRepository.updateProgramName(db, { programId, programName });
  syncProgramsInBackground(db);
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
    const syncMetadata = await programRepository.getProgramSyncMetadata(
      db,
      programId
    );

    if (syncMetadata?.cloud_program_id) {
      await programRepository.queueProgramDeleteSync(db, {
        cloudProgramId: syncMetadata.cloud_program_id,
        deletedAt: new Date().toISOString(),
      });
    }

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

  try {
    await syncProgramsWithCloud(db);
  } catch (error) {
    console.error(
      "Program cloud delete sync failed after local delete; the delete remains queued for retry:",
      error
    );
  }
}

export async function createMesocycle(
  db,
  { programId, startDate, weeks, focus }
) {
  const mesocycleId = await withTransaction(db, async () => {
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

  syncMesocyclesInBackground(db);
  return mesocycleId;
}

export async function getMesocyclesByProgram(db, programId) {
  return programRepository.getMesocyclesByProgram(db, programId);
}

export async function getMesocycleWorkoutCountsByProgram(db, programId) {
  return programRepository.getMesocycleWorkoutCountsByProgram(db, programId);
}

export async function updateMesocycleFocus(db, { mesocycleId, focus }) {
  await programRepository.updateMesocycleFocus(db, { mesocycleId, focus });
  syncMesocyclesInBackground(db);
}

export async function addWeekToMesocycle(db, { mesocycleId, programId }) {
  const insertedMicrocycleId = await withTransaction(db, async () => {
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

  syncMesocyclesInBackground(db);
  return insertedMicrocycleId;
}

export async function deleteMesocycle(db, mesocycleId) {
  await withTransaction(db, async () => {
    const syncMetadata = await programRepository.getMesocycleSyncMetadata(
      db,
      mesocycleId
    );

    if (syncMetadata?.cloud_mesocycle_id) {
      await programRepository.queueMesocycleDeleteSync(db, {
        cloudMesocycleId: syncMetadata.cloud_mesocycle_id,
        deletedAt: new Date().toISOString(),
      });
    }

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

  syncMesocyclesInBackground(db);
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
          workoutType: workout.workout_type,
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

export async function createWorkoutForDay(
  db,
  { date, dayId, workoutType, label }
) {
  return withTransaction(db, async () => {
    const workout = await programRepository.createWorkout(db, {
      date,
      dayId,
      workoutType,
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

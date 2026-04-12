export async function getExerciseStorage(db) {
  return db.getAllAsync(
    `SELECT
        name AS exercise_name,
        nickname
     FROM Exercise
     ORDER BY name COLLATE NOCASE ASC;`
  );
}

export async function createExerciseStorage(db, exerciseName) {
  await db.runAsync(
    `INSERT INTO Exercise (name, nickname)
     VALUES (?, NULL);`,
    [exerciseName]
  );
}

export async function replaceExerciseCatalog(db, exercises) {
  await db.execAsync("BEGIN TRANSACTION;");

  try {
    await db.runAsync(`DELETE FROM Exercise;`);

    if (exercises.length > 0) {
      const placeholders = exercises.map(() => "(?, ?)").join(", ");
      const values = exercises.flatMap((exercise) => [
        exercise.name ?? exercise.exercise_name,
        exercise.nickname ?? null,
      ]);

      await db.runAsync(
        `INSERT INTO Exercise (
          name,
          nickname
        ) VALUES ${placeholders};`,
        values
      );
    }

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

export async function getEstimatedSets(db, programId) {
  return db.getAllAsync(
    `SELECT estimated_set_id, estimated_weight, exercise_name
     FROM Estimated_Set
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function getEstimatedSetById(db, estimatedSetId) {
  return db.getFirstAsync(
    `SELECT estimated_set_id, program_id, exercise_name, estimated_weight
     FROM Estimated_Set
     WHERE estimated_set_id = ?;`,
    [estimatedSetId]
  );
}

export async function createEstimatedSet(
  db,
  { programId, exerciseName, estimatedWeight }
) {
  await db.runAsync(
    `INSERT INTO Estimated_Set (program_id, exercise_name, estimated_weight)
     VALUES (?, ?, ?);`,
    [programId, exerciseName, estimatedWeight]
  );
}

export async function updateEstimatedSetWeight(
  db,
  { estimatedSetId, estimatedWeight }
) {
  await db.runAsync(
    `UPDATE Estimated_Set
     SET estimated_weight = ?
     WHERE estimated_set_id = ?;`,
    [estimatedWeight, estimatedSetId]
  );
}

export async function deleteEstimatedSet(db, estimatedSetId) {
  await db.runAsync(
    `DELETE FROM Estimated_Set
     WHERE estimated_set_id = ?;`,
    [estimatedSetId]
  );
}

export async function getMesocycleRmProgressions(db, mesocycleId) {
  return db.getAllAsync(
    `SELECT exercise_name, progression_weight
     FROM RMWeightProgression
     WHERE mesocycle_id = ?
     ORDER BY exercise_name COLLATE NOCASE ASC;`,
    [mesocycleId]
  );
}

export async function insertRmWeightProgression(
  db,
  { mesocycleId, exerciseName, progressionWeight }
) {
  await db.runAsync(
    `INSERT OR IGNORE INTO RMWeightProgression (
      mesocycle_id,
      exercise_name,
      progression_weight
    ) VALUES (?, ?, ?);`,
    [mesocycleId, exerciseName, progressionWeight]
  );
}

export async function getLatestRmProgressionWeightBeforeMesocycle(
  db,
  { programId, exerciseName, mesocycleNumber }
) {
  return db.getFirstAsync(
    `SELECT rmp.progression_weight
     FROM RMWeightProgression rmp
     JOIN Mesocycle m ON m.mesocycle_id = rmp.mesocycle_id
     WHERE m.program_id = ?
       AND rmp.exercise_name = ?
       AND m.mesocycle_number < ?
     ORDER BY m.mesocycle_number DESC
     LIMIT 1;`,
    [programId, exerciseName, mesocycleNumber]
  );
}

export async function incrementRmWeightProgressionsFromMesocycle(
  db,
  { programId, exerciseName, mesocycleNumber, delta }
) {
  await db.runAsync(
    `UPDATE RMWeightProgression
     SET progression_weight = progression_weight + ?
     WHERE exercise_name = ?
       AND mesocycle_id IN (
         SELECT mesocycle_id
         FROM Mesocycle
         WHERE program_id = ?
           AND mesocycle_number >= ?
       );`,
    [delta, exerciseName, programId, mesocycleNumber]
  );
}

export async function getMesocycleEstimatedSetProgressions(db, mesocycleId) {
  return db.getAllAsync(
    `SELECT
        m.mesocycle_id,
        m.mesocycle_number,
        es.exercise_name,
        es.estimated_weight,
        COALESCE(
          rmp.progression_weight,
          CASE
            WHEN m.mesocycle_number > 1
              THEN (m.mesocycle_number - 1) * 2.5
            ELSE 0
          END
        ) AS progression_weight
     FROM Mesocycle m
     LEFT JOIN Estimated_Set es
       ON es.program_id = m.program_id
     LEFT JOIN RMWeightProgression rmp
       ON rmp.mesocycle_id = m.mesocycle_id
      AND rmp.exercise_name = es.exercise_name
     WHERE m.mesocycle_id = ?
       AND es.exercise_name IS NOT NULL
     ORDER BY es.exercise_name COLLATE NOCASE ASC;`,
    [mesocycleId]
  );
}

export async function getMesocycleEstimatedSetProgressionsByProgram(db, programId) {
  return db.getAllAsync(
    `SELECT
        m.mesocycle_id,
        m.mesocycle_number,
        es.exercise_name,
        es.estimated_weight,
        COALESCE(
          rmp.progression_weight,
          CASE
            WHEN m.mesocycle_number > 1
              THEN (m.mesocycle_number - 1) * 2.5
            ELSE 0
          END
        ) AS progression_weight
     FROM Mesocycle m
     LEFT JOIN Estimated_Set es
       ON es.program_id = m.program_id
     LEFT JOIN RMWeightProgression rmp
       ON rmp.mesocycle_id = m.mesocycle_id
      AND rmp.exercise_name = es.exercise_name
     WHERE m.program_id = ?
       AND es.exercise_name IS NOT NULL
     ORDER BY m.mesocycle_number ASC, es.exercise_name COLLATE NOCASE ASC;`,
    [programId]
  );
}

export async function deleteRmWeightProgressionsByProgram(db, programId) {
  await db.runAsync(
    `DELETE FROM RMWeightProgression
     WHERE mesocycle_id IN (
       SELECT mesocycle_id
       FROM Mesocycle
       WHERE program_id = ?
     );`,
    [programId]
  );
}

export async function deleteRmWeightProgressionsByMesocycle(db, mesocycleId) {
  await db.runAsync(
    `DELETE FROM RMWeightProgression
     WHERE mesocycle_id = ?;`,
    [mesocycleId]
  );
}

export async function deleteRmWeightProgressionsByProgramExercise(
  db,
  { programId, exerciseName }
) {
  await db.runAsync(
    `DELETE FROM RMWeightProgression
     WHERE exercise_name = ?
       AND mesocycle_id IN (
         SELECT mesocycle_id
         FROM Mesocycle
         WHERE program_id = ?
       );`,
    [exerciseName, programId]
  );
}

export async function getEstimatedWeightBySetId(db, setId) {
  return db.getFirstAsync(
    `SELECT
        es.estimated_weight,
        COALESCE(
          rmp.progression_weight,
          CASE
            WHEN m.mesocycle_number > 1
              THEN (m.mesocycle_number - 1) * 2.5
            ELSE 0
          END
        ) AS progression_weight,
        es.estimated_weight + COALESCE(
          rmp.progression_weight,
          CASE
            WHEN m.mesocycle_number > 1
              THEN (m.mesocycle_number - 1) * 2.5
            ELSE 0
          END
        ) AS adjusted_estimated_weight
     FROM "Set" s
     JOIN Exercise_Instance e ON e.exercise_instance_id = s.exercise_instance_id
     JOIN Workout_Type_Instance w ON w.workout_id = e.workout_type_instance_id
     JOIN Day d ON d.day_id = w.day_id
     JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
     JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
     LEFT JOIN Estimated_Set es
       ON es.program_id = d.program_id
      AND es.exercise_name = e.exercise_name
     LEFT JOIN RMWeightProgression rmp
       ON rmp.mesocycle_id = m.mesocycle_id
      AND rmp.exercise_name = e.exercise_name
     WHERE s.sets_id = ?;`,
    [setId]
  );
}

export async function getTotalPlannedSetsByWorkout(db, workoutId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM "Set" s
     JOIN Exercise_Instance e ON e.exercise_instance_id = s.exercise_instance_id
     WHERE e.workout_type_instance_id = ?;`,
    [workoutId]
  );
}

export async function getDoneSetCountByWorkout(db, workoutId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS done_sets
     FROM "Set" s
     JOIN Exercise_Instance e ON e.exercise_instance_id = s.exercise_instance_id
     WHERE e.workout_type_instance_id = ?
       AND s.done = 1;`,
    [workoutId]
  );
}

export async function getExercisesByWorkout(db, workoutId) {
  return db.getAllAsync(
    `SELECT
        exercise_instance_id AS exercise_id,
        workout_type_instance_id AS workout_id,
        exercise_name,
        sets,
        done,
        visible_columns,
        note
     FROM Exercise_Instance
     WHERE workout_type_instance_id = ?;`,
    [workoutId]
  );
}

export async function getProgramExerciseNames(db, programId) {
  return db.getAllAsync(
    `SELECT DISTINCT e.exercise_name
     FROM Exercise_Instance e
     JOIN Workout_Type_Instance w ON w.workout_id = e.workout_type_instance_id
     JOIN Day d ON d.day_id = w.day_id
     WHERE d.program_id = ?
     ORDER BY e.exercise_name COLLATE NOCASE ASC;`,
    [programId]
  );
}

export async function getExerciseSummariesByWorkout(db, workoutId) {
  return db.getAllAsync(
    `SELECT exercise_name, sets
     FROM Exercise_Instance
     WHERE workout_type_instance_id = ?;`,
    [workoutId]
  );
}

export async function getSetsByWorkout(db, workoutId) {
  return db.getAllAsync(
    `SELECT s.*
     FROM "Set" s
     JOIN Exercise_Instance e ON e.exercise_instance_id = s.exercise_instance_id
     WHERE e.workout_type_instance_id = ?;`,
    [workoutId]
  );
}

export async function getExercisesByWorkoutId(db, workoutId) {
  return db.getAllAsync(
    `SELECT
        exercise_instance_id AS exercise_id,
        workout_type_instance_id AS workout_id,
        exercise_name,
        sets,
        visible_columns,
        note,
        done
     FROM Exercise_Instance
     WHERE workout_type_instance_id = ?;`,
    [workoutId]
  );
}

export async function getExercisesForCloudSync(db) {
  return db.getAllAsync(
    `SELECT
        exercise_instance_id,
        cloud_exercise_instance_id,
        remote_local_exercise_instance_id,
        workout_type_instance_id,
        exercise_name,
        sets,
        visible_columns,
        note,
        done,
        needs_sync
     FROM Exercise_Instance
     ORDER BY exercise_instance_id ASC;`
  );
}

export async function createExercise(
  db,
  {
    workoutId,
    exerciseName,
    sets = 0,
    visibleColumns = null,
    note = null,
    done = 0,
  }
) {
  return db.runAsync(
    `INSERT INTO Exercise_Instance (
      workout_type_instance_id,
      exercise_name,
      sets,
      visible_columns,
      note,
      done,
      needs_sync
    ) VALUES (?, ?, ?, ?, ?, ?, 1);`,
    [workoutId, exerciseName, sets, visibleColumns, note, done]
  );
}

export async function createExerciseFromCloud(
  db,
  {
    cloudExerciseInstanceId,
    remoteLocalExerciseInstanceId,
    workoutId,
    exerciseName,
    sets,
    visibleColumns,
    note,
    done,
  }
) {
  return db.runAsync(
    `INSERT INTO Exercise_Instance (
      cloud_exercise_instance_id,
      remote_local_exercise_instance_id,
      workout_type_instance_id,
      exercise_name,
      sets,
      visible_columns,
      note,
      done,
      needs_sync
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    [
      cloudExerciseInstanceId,
      remoteLocalExerciseInstanceId,
      workoutId,
      exerciseName,
      sets,
      visibleColumns,
      note,
      done ? 1 : 0,
    ]
  );
}

export async function updateExerciseFromCloud(
  db,
  {
    exerciseId,
    cloudExerciseInstanceId,
    remoteLocalExerciseInstanceId,
    workoutId,
    exerciseName,
    sets,
    visibleColumns,
    note,
    done,
  }
) {
  await db.runAsync(
    `UPDATE Exercise_Instance
     SET cloud_exercise_instance_id = ?,
         remote_local_exercise_instance_id = ?,
         workout_type_instance_id = ?,
         exercise_name = ?,
         sets = ?,
         visible_columns = ?,
         note = ?,
         done = ?,
         needs_sync = 0
     WHERE exercise_instance_id = ?;`,
    [
      cloudExerciseInstanceId,
      remoteLocalExerciseInstanceId,
      workoutId,
      exerciseName,
      sets,
      visibleColumns,
      note,
      done ? 1 : 0,
      exerciseId,
    ]
  );
}

export async function markExerciseSynced(
  db,
  {
    exerciseId,
    cloudExerciseInstanceId,
    remoteLocalExerciseInstanceId = null,
  }
) {
  await db.runAsync(
    `UPDATE Exercise_Instance
     SET cloud_exercise_instance_id = ?,
         remote_local_exercise_instance_id = COALESCE(
           ?,
           remote_local_exercise_instance_id,
           exercise_instance_id
         ),
         needs_sync = 0
     WHERE exercise_instance_id = ?;`,
    [cloudExerciseInstanceId, remoteLocalExerciseInstanceId, exerciseId]
  );
}

export async function updateExerciseCloudIdentity(
  db,
  {
    exerciseId,
    cloudExerciseInstanceId,
    remoteLocalExerciseInstanceId = null,
  }
) {
  await db.runAsync(
    `UPDATE Exercise_Instance
     SET cloud_exercise_instance_id = ?,
         remote_local_exercise_instance_id = COALESCE(
           ?,
           remote_local_exercise_instance_id,
           exercise_instance_id
         )
     WHERE exercise_instance_id = ?;`,
    [cloudExerciseInstanceId, remoteLocalExerciseInstanceId, exerciseId]
  );
}

export async function markExerciseForCloudResync(db, { exerciseId }) {
  await db.runAsync(
    `UPDATE Exercise_Instance
     SET cloud_exercise_instance_id = NULL,
         needs_sync = 1
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

export async function getExerciseSyncMetadata(db, exerciseId) {
  return db.getFirstAsync(
    `SELECT
        exercise_instance_id,
        cloud_exercise_instance_id,
        remote_local_exercise_instance_id,
        needs_sync
     FROM Exercise_Instance
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

export async function getQueuedExerciseInstanceDeletes(db) {
  return db.getAllAsync(
    `SELECT
        exercise_instance_sync_delete_id,
        cloud_exercise_instance_id,
        remote_local_exercise_instance_id,
        deleted_at
     FROM Exercise_Instance_Sync_Delete
     ORDER BY exercise_instance_sync_delete_id ASC;`
  );
}

export async function queueExerciseInstanceDeleteSync(
  db,
  {
    cloudExerciseInstanceId = null,
    remoteLocalExerciseInstanceId = null,
    deletedAt,
  }
) {
  await db.runAsync(
    `INSERT OR IGNORE INTO Exercise_Instance_Sync_Delete (
      cloud_exercise_instance_id,
      remote_local_exercise_instance_id,
      deleted_at
    ) VALUES (?, ?, ?);`,
    [cloudExerciseInstanceId, remoteLocalExerciseInstanceId, deletedAt]
  );
}

export async function deleteQueuedExerciseInstanceDelete(db, queueId) {
  await db.runAsync(
    `DELETE FROM Exercise_Instance_Sync_Delete
     WHERE exercise_instance_sync_delete_id = ?;`,
    [queueId]
  );
}

export async function getWorkoutIdByExercise(db, exerciseId) {
  return db.getFirstAsync(
    `SELECT workout_type_instance_id AS workout_id
     FROM Exercise_Instance
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

export async function deleteSetsByExercise(db, exerciseId) {
  await db.runAsync(
    `DELETE FROM "Set"
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

export async function deleteExerciseById(db, exerciseId) {
  await db.runAsync(
    `DELETE FROM Exercise_Instance
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

export async function countSetsByExercise(db, exerciseId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM "Set"
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

export async function createSet(
  db,
  {
    setNumber,
    exerciseId,
    date = null,
    personalRecord = 0,
    pause = null,
    rpe = null,
    weight = null,
    rmPercentage = null,
    reps = null,
    done = 0,
    failed = 0,
    amrap = 0,
    note = null,
  }
) {
  return db.runAsync(
    `INSERT INTO "Set" (
      set_number,
      exercise_instance_id,
      date,
      personal_record,
      pause,
      rpe,
      weight,
      rm_percentage,
      reps,
      done,
      failed,
      amrap,
      note,
      needs_sync
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
    [
      setNumber,
      exerciseId,
      date,
      personalRecord,
      pause,
      rpe,
      weight,
      rmPercentage,
      reps,
      done,
      failed,
      amrap,
      note,
    ]
  );
}

export async function getSetsForCloudSync(db) {
  return db.getAllAsync(
    `SELECT
        sets_id,
        cloud_set_id,
        remote_local_set_id,
        set_number,
        exercise_instance_id,
        date,
        personal_record,
        pause,
        rpe,
        weight,
        rm_percentage,
        reps,
        done,
        failed,
        amrap,
        note,
        needs_sync
     FROM "Set"
     ORDER BY sets_id ASC;`
  );
}

export async function createSetFromCloud(
  db,
  {
    cloudSetId,
    remoteLocalSetId,
    exerciseId,
    setNumber,
    date,
    personalRecord,
    pause,
    rpe,
    weight,
    rmPercentage,
    reps,
    done,
    failed,
    amrap,
    note,
  }
) {
  return db.runAsync(
    `INSERT INTO "Set" (
      cloud_set_id,
      remote_local_set_id,
      set_number,
      exercise_instance_id,
      date,
      personal_record,
      pause,
      rpe,
      weight,
      rm_percentage,
      reps,
      done,
      failed,
      amrap,
      note,
      needs_sync
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    [
      cloudSetId,
      remoteLocalSetId,
      setNumber,
      exerciseId,
      date,
      personalRecord ? 1 : 0,
      pause,
      rpe,
      weight,
      rmPercentage,
      reps,
      done ? 1 : 0,
      failed ? 1 : 0,
      amrap ? 1 : 0,
      note,
    ]
  );
}

export async function updateSetFromCloud(
  db,
  {
    setId,
    cloudSetId,
    remoteLocalSetId,
    exerciseId,
    setNumber,
    date,
    personalRecord,
    pause,
    rpe,
    weight,
    rmPercentage,
    reps,
    done,
    failed,
    amrap,
    note,
  }
) {
  await db.runAsync(
    `UPDATE "Set"
     SET cloud_set_id = ?,
         remote_local_set_id = ?,
         set_number = ?,
         exercise_instance_id = ?,
         date = ?,
         personal_record = ?,
         pause = ?,
         rpe = ?,
         weight = ?,
         rm_percentage = ?,
         reps = ?,
         done = ?,
         failed = ?,
         amrap = ?,
         note = ?,
         needs_sync = 0
     WHERE sets_id = ?;`,
    [
      cloudSetId,
      remoteLocalSetId,
      setNumber,
      exerciseId,
      date,
      personalRecord ? 1 : 0,
      pause,
      rpe,
      weight,
      rmPercentage,
      reps,
      done ? 1 : 0,
      failed ? 1 : 0,
      amrap ? 1 : 0,
      note,
      setId,
    ]
  );
}

export async function markSetSynced(
  db,
  { setId, cloudSetId, remoteLocalSetId = null }
) {
  await db.runAsync(
    `UPDATE "Set"
     SET cloud_set_id = ?,
         remote_local_set_id = COALESCE(
           ?,
           remote_local_set_id,
           sets_id
         ),
         needs_sync = 0
     WHERE sets_id = ?;`,
    [cloudSetId, remoteLocalSetId, setId]
  );
}

export async function updateSetCloudIdentity(
  db,
  { setId, cloudSetId, remoteLocalSetId = null }
) {
  await db.runAsync(
    `UPDATE "Set"
     SET cloud_set_id = ?,
         remote_local_set_id = COALESCE(
           ?,
           remote_local_set_id,
           sets_id
         )
     WHERE sets_id = ?;`,
    [cloudSetId, remoteLocalSetId, setId]
  );
}

export async function markSetForCloudResync(db, { setId }) {
  await db.runAsync(
    `UPDATE "Set"
     SET cloud_set_id = NULL,
         needs_sync = 1
     WHERE sets_id = ?;`,
    [setId]
  );
}

export async function getSetSyncMetadata(db, setId) {
  return db.getFirstAsync(
    `SELECT
        sets_id,
        cloud_set_id,
        remote_local_set_id,
        needs_sync
     FROM "Set"
     WHERE sets_id = ?;`,
    [setId]
  );
}

export async function getQueuedSetDeletes(db) {
  return db.getAllAsync(
    `SELECT
        set_sync_delete_id,
        cloud_set_id,
        remote_local_set_id,
        deleted_at
     FROM Set_Sync_Delete
     ORDER BY set_sync_delete_id ASC;`
  );
}

export async function queueSetDeleteSync(
  db,
  { cloudSetId = null, remoteLocalSetId = null, deletedAt }
) {
  await db.runAsync(
    `INSERT OR IGNORE INTO Set_Sync_Delete (
      cloud_set_id,
      remote_local_set_id,
      deleted_at
    ) VALUES (?, ?, ?);`,
    [cloudSetId, remoteLocalSetId, deletedAt]
  );
}

export async function deleteQueuedSetDelete(db, queueId) {
  await db.runAsync(
    `DELETE FROM Set_Sync_Delete
     WHERE set_sync_delete_id = ?;`,
    [queueId]
  );
}

export async function updateExerciseSetCount(db, exerciseId) {
  await db.runAsync(
    `UPDATE Exercise_Instance
     SET sets = (
       SELECT COUNT(*)
       FROM "Set"
       WHERE "Set".exercise_instance_id = Exercise_Instance.exercise_instance_id
     ),
         needs_sync = 1
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

export async function updateExerciseDoneFromSets(db, exerciseId) {
  await db.runAsync(
    `UPDATE Exercise_Instance
     SET done = (
       NOT EXISTS (
         SELECT 1
         FROM "Set"
         WHERE "Set".exercise_instance_id = Exercise_Instance.exercise_instance_id
           AND "Set".done = 0
       )
     ),
         needs_sync = 1
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

export async function updateExerciseVisibleColumns(
  db,
  { exerciseId, columns }
) {
  await db.runAsync(
    `UPDATE Exercise_Instance
     SET visible_columns = ?,
         needs_sync = 1
     WHERE exercise_instance_id = ?;`,
    [JSON.stringify(columns), exerciseId]
  );
}

export async function updateExerciseNote(db, { exerciseId, note }) {
  await db.runAsync(
    `UPDATE Exercise_Instance
     SET note = ?,
         needs_sync = 1
     WHERE exercise_instance_id = ?;`,
    [note, exerciseId]
  );
}

export async function updateSetDone(db, { setId, done }) {
  await db.runAsync(
    `UPDATE "Set"
     SET done = ?,
         needs_sync = 1
     WHERE sets_id = ?;`,
    [done ? 1 : 0, setId]
  );
}

export async function updateExerciseDoneBySet(db, setId) {
  await db.runAsync(
    `UPDATE Exercise_Instance
     SET done = (
       NOT EXISTS (
         SELECT 1
         FROM "Set"
         WHERE "Set".exercise_instance_id = Exercise_Instance.exercise_instance_id
           AND "Set".done = 0
       )
     ),
         needs_sync = 1
     WHERE exercise_instance_id = (
       SELECT exercise_instance_id
       FROM "Set"
       WHERE sets_id = ?
     );`,
    [setId]
  );
}

export async function updateWorkoutDoneFromExercises(db, workoutId) {
  await db.runAsync(
    `UPDATE Workout_Type_Instance
     SET done = (
       NOT EXISTS (
         SELECT 1
         FROM Exercise_Instance
         WHERE Exercise_Instance.workout_type_instance_id = Workout_Type_Instance.workout_id
           AND Exercise_Instance.done = 0
       )
     ),
         needs_sync = 1
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function getExerciseAndWorkoutBySetId(db, setId) {
  return db.getFirstAsync(
    `SELECT s.exercise_instance_id, e.workout_type_instance_id AS workout_id
     FROM "Set" s
     JOIN Exercise_Instance e ON e.exercise_instance_id = s.exercise_instance_id
     WHERE s.sets_id = ?;`,
    [setId]
  );
}

export async function deleteSetById(db, setId) {
  await db.runAsync(
    `DELETE FROM "Set"
     WHERE sets_id = ?;`,
    [setId]
  );
}

export async function getSetIdsByExercise(db, exerciseId) {
  return db.getAllAsync(
    `SELECT sets_id
     FROM "Set"
     WHERE exercise_instance_id = ?
     ORDER BY set_number ASC, sets_id ASC;`,
    [exerciseId]
  );
}

export async function updateSetNumber(db, { setId, setNumber }) {
  await db.runAsync(
    `UPDATE "Set"
     SET set_number = ?,
         needs_sync = 1
     WHERE sets_id = ?;`,
    [setNumber, setId]
  );
}

export async function updateSetField(db, { field, value, setId }) {
  await db.runAsync(
    `UPDATE "Set"
     SET ${field} = ?,
         needs_sync = 1
     WHERE sets_id = ?;`,
    [value, setId]
  );
}

export async function getExerciseSets(db, exerciseId) {
  return db.getAllAsync(
    `SELECT set_number, exercise_instance_id, pause, rpe, weight, rm_percentage, reps, done, failed, amrap, note
     FROM "Set"
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

export async function getExerciseSetCount(db, exerciseId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM "Set"
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

export async function updateSetByExerciseAndNumber(
  db,
  {
    exerciseId,
    setNumber,
    pause,
    rpe,
    weight,
    rmPercentage,
    reps,
    done,
    failed,
    amrap,
    note,
  }
) {
  await db.runAsync(
    `UPDATE "Set"
     SET pause = ?,
         rpe = ?,
         weight = ?,
         rm_percentage = ?,
         reps = ?,
         done = ?,
         failed = ?,
         amrap = ?,
         note = ?,
         needs_sync = 1
     WHERE exercise_instance_id = ?
       AND set_number = ?;`,
    [
      pause,
      rpe,
      weight,
      rmPercentage,
      reps,
      done,
      failed,
      amrap,
      note,
      exerciseId,
      setNumber,
    ]
  );
}

export async function updateExerciseDone(db, { exerciseId, done }) {
  await db.runAsync(
    `UPDATE Exercise_Instance
     SET done = ?,
         needs_sync = 1
     WHERE exercise_instance_id = ?;`,
    [done ? 1 : 0, exerciseId]
  );
}

export async function deleteSetsByWorkout(db, workoutId) {
  await db.runAsync(
    `DELETE FROM "Set"
     WHERE exercise_instance_id IN (
       SELECT exercise_instance_id
       FROM Exercise_Instance
       WHERE workout_type_instance_id = ?
     );`,
    [workoutId]
  );
}

export async function deleteExercisesByWorkout(db, workoutId) {
  await db.runAsync(
    `DELETE FROM Exercise_Instance
     WHERE workout_type_instance_id = ?;`,
    [workoutId]
  );
}

export async function getSetsByExercise(db, exerciseId) {
  return db.getAllAsync(
    `SELECT *
     FROM "Set"
     WHERE exercise_instance_id = ?;`,
    [exerciseId]
  );
}

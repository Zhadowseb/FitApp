export async function getExerciseStorage(db) {
  return db.getAllAsync(
    `SELECT exercise_name
     FROM Exercise_storage
     ORDER BY exercise_name;`
  );
}

export async function createExerciseStorage(db, exerciseName) {
  await db.runAsync(
    `INSERT INTO Exercise_storage (exercise_name)
     VALUES (?);`,
    [exerciseName]
  );
}

export async function getEstimatedSets(db, programId) {
  return db.getAllAsync(
    `SELECT estimated_set_id, estimated_weight, exercise_name
     FROM Estimated_Set
     WHERE program_id = ?;`,
    [programId]
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

export async function getEstimatedWeightBySetId(db, setId) {
  return db.getFirstAsync(
    `SELECT es.estimated_weight
     FROM Sets s
     JOIN Exercise e ON e.exercise_id = s.exercise_id
     JOIN Workout w ON w.workout_id = e.workout_id
     JOIN Day d ON d.day_id = w.day_id
     LEFT JOIN Estimated_Set es
       ON es.program_id = d.program_id
      AND es.exercise_name = e.exercise_name
     WHERE s.sets_id = ?;`,
    [setId]
  );
}

export async function getTotalPlannedSetsByWorkout(db, workoutId) {
  return db.getFirstAsync(
    `SELECT COALESCE(SUM(sets), 0) AS count
     FROM Exercise
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function getDoneSetCountByWorkout(db, workoutId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS done_sets
     FROM Sets s
     JOIN Exercise e ON e.exercise_id = s.exercise_id
     WHERE e.workout_id = ?
       AND s.done = 1;`,
    [workoutId]
  );
}

export async function getExercisesByWorkout(db, workoutId) {
  return db.getAllAsync(
    `SELECT
        exercise_id,
        exercise_name,
        sets,
        done,
        visible_columns,
        note
     FROM Exercise
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function getProgramExerciseNames(db, programId) {
  return db.getAllAsync(
    `SELECT DISTINCT e.exercise_name
     FROM Exercise e
     JOIN Workout w ON w.workout_id = e.workout_id
     JOIN Day d ON d.day_id = w.day_id
     WHERE d.program_id = ?
     ORDER BY e.exercise_name COLLATE NOCASE ASC;`,
    [programId]
  );
}

export async function getExerciseSummariesByWorkout(db, workoutId) {
  return db.getAllAsync(
    `SELECT exercise_name, sets
     FROM Exercise
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function getSetsByWorkout(db, workoutId) {
  return db.getAllAsync(
    `SELECT s.*
     FROM Sets s
     JOIN Exercise e ON e.exercise_id = s.exercise_id
     WHERE e.workout_id = ?;`,
    [workoutId]
  );
}

export async function getExercisesByWorkoutId(db, workoutId) {
  return db.getAllAsync(
    `SELECT *
     FROM Exercise
     WHERE workout_id = ?;`,
    [workoutId]
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
    `INSERT INTO Exercise (
      workout_id,
      exercise_name,
      sets,
      visible_columns,
      note,
      done
    ) VALUES (?, ?, ?, ?, ?, ?);`,
    [workoutId, exerciseName, sets, visibleColumns, note, done]
  );
}

export async function getWorkoutIdByExercise(db, exerciseId) {
  return db.getFirstAsync(
    `SELECT workout_id
     FROM Exercise
     WHERE exercise_id = ?;`,
    [exerciseId]
  );
}

export async function deleteSetsByExercise(db, exerciseId) {
  await db.runAsync(
    `DELETE FROM Sets
     WHERE exercise_id = ?;`,
    [exerciseId]
  );
}

export async function deleteExerciseById(db, exerciseId) {
  await db.runAsync(
    `DELETE FROM Exercise
     WHERE exercise_id = ?;`,
    [exerciseId]
  );
}

export async function countSetsByExercise(db, exerciseId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM Sets
     WHERE exercise_id = ?;`,
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
    `INSERT INTO Sets (
      set_number,
      exercise_id,
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
      note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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

export async function updateExerciseSetCount(db, exerciseId) {
  await db.runAsync(
    `UPDATE Exercise
     SET sets = (
       SELECT COUNT(*)
       FROM Sets
       WHERE Sets.exercise_id = Exercise.exercise_id
     )
     WHERE exercise_id = ?;`,
    [exerciseId]
  );
}

export async function updateExerciseDoneFromSets(db, exerciseId) {
  await db.runAsync(
    `UPDATE Exercise
     SET done = (
       NOT EXISTS (
         SELECT 1
         FROM Sets
         WHERE Sets.exercise_id = Exercise.exercise_id
           AND Sets.done = 0
       )
     )
     WHERE exercise_id = ?;`,
    [exerciseId]
  );
}

export async function updateExerciseVisibleColumns(
  db,
  { exerciseId, columns }
) {
  await db.runAsync(
    `UPDATE Exercise
     SET visible_columns = ?
     WHERE exercise_id = ?;`,
    [JSON.stringify(columns), exerciseId]
  );
}

export async function updateExerciseNote(db, { exerciseId, note }) {
  await db.runAsync(
    `UPDATE Exercise
     SET note = ?
     WHERE exercise_id = ?;`,
    [note, exerciseId]
  );
}

export async function updateSetDone(db, { setId, done }) {
  await db.runAsync(
    `UPDATE Sets
     SET done = ?
     WHERE sets_id = ?;`,
    [done ? 1 : 0, setId]
  );
}

export async function updateExerciseDoneBySet(db, setId) {
  await db.runAsync(
    `UPDATE Exercise
     SET done = (
       NOT EXISTS (
         SELECT 1
         FROM Sets
         WHERE Sets.exercise_id = Exercise.exercise_id
           AND Sets.done = 0
       )
     )
     WHERE exercise_id = (
       SELECT exercise_id
       FROM Sets
       WHERE sets_id = ?
     );`,
    [setId]
  );
}

export async function updateWorkoutDoneFromExercises(db, workoutId) {
  await db.runAsync(
    `UPDATE Workout
     SET done = (
       NOT EXISTS (
         SELECT 1
         FROM Exercise
         WHERE Exercise.workout_id = Workout.workout_id
           AND Exercise.done = 0
       )
     )
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function getExerciseAndWorkoutBySetId(db, setId) {
  return db.getFirstAsync(
    `SELECT s.exercise_id, e.workout_id
     FROM Sets s
     JOIN Exercise e ON e.exercise_id = s.exercise_id
     WHERE s.sets_id = ?;`,
    [setId]
  );
}

export async function deleteSetById(db, setId) {
  await db.runAsync(
    `DELETE FROM Sets
     WHERE sets_id = ?;`,
    [setId]
  );
}

export async function getSetIdsByExercise(db, exerciseId) {
  return db.getAllAsync(
    `SELECT sets_id
     FROM Sets
     WHERE exercise_id = ?
     ORDER BY set_number ASC, sets_id ASC;`,
    [exerciseId]
  );
}

export async function updateSetNumber(db, { setId, setNumber }) {
  await db.runAsync(
    `UPDATE Sets
     SET set_number = ?
     WHERE sets_id = ?;`,
    [setNumber, setId]
  );
}

export async function updateSetField(db, { field, value, setId }) {
  await db.runAsync(
    `UPDATE Sets
     SET ${field} = ?
     WHERE sets_id = ?;`,
    [value, setId]
  );
}

export async function getExerciseSets(db, exerciseId) {
  return db.getAllAsync(
    `SELECT set_number, pause, rpe, weight, rm_percentage, reps, done, failed, amrap, note
     FROM Sets
     WHERE exercise_id = ?;`,
    [exerciseId]
  );
}

export async function getExerciseSetCount(db, exerciseId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM Sets
     WHERE exercise_id = ?;`,
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
    `UPDATE Sets
     SET pause = ?,
         rpe = ?,
         weight = ?,
         rm_percentage = ?,
         reps = ?,
         done = ?,
         failed = ?,
         amrap = ?,
         note = ?
     WHERE exercise_id = ?
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
    `UPDATE Exercise
     SET done = ?
     WHERE exercise_id = ?;`,
    [done ? 1 : 0, exerciseId]
  );
}

export async function deleteSetsByWorkout(db, workoutId) {
  await db.runAsync(
    `DELETE FROM Sets
     WHERE exercise_id IN (
       SELECT exercise_id
       FROM Exercise
       WHERE workout_id = ?
     );`,
    [workoutId]
  );
}

export async function deleteExercisesByWorkout(db, workoutId) {
  await db.runAsync(
    `DELETE FROM Exercise
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function getSetsByExercise(db, exerciseId) {
  return db.getAllAsync(
    `SELECT *
     FROM Sets
     WHERE exercise_id = ?;`,
    [exerciseId]
  );
}

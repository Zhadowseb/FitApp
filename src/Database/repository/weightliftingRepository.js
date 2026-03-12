import { refreshWorkoutHierarchyCompletion } from "./workoutRepository";
import { withTransaction } from "./shared";

export const DEFAULT_VISIBLE_COLUMNS = {
  rest: true,
  set: true,
  x: true,
  reps: true,
  rpe: true,
  weight: true,
  done: true,
};

async function syncExerciseSetCount(db, exerciseId) {
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

async function renumberExerciseSets(db, exerciseId) {
  const sets = await db.getAllAsync(
    `SELECT sets_id
     FROM Sets
     WHERE exercise_id = ?
     ORDER BY set_number ASC, sets_id ASC;`,
    [exerciseId]
  );

  let setNumber = 1;
  for (const set of sets) {
    await db.runAsync(
      `UPDATE Sets
       SET set_number = ?
       WHERE sets_id = ?;`,
      [setNumber, set.sets_id]
    );
    setNumber += 1;
  }
}

async function refreshExerciseCompletion(db, exerciseId) {
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

export async function getStrengthWorkoutSummary(db, workoutId) {
  const total = await db.getFirstAsync(
    `SELECT COALESCE(SUM(sets), 0) AS count
     FROM Exercise
     WHERE workout_id = ?;`,
    [workoutId]
  );

  const done = await db.getFirstAsync(
    `SELECT COUNT(*) AS done_sets
     FROM Sets s
     JOIN Exercise e ON e.exercise_id = s.exercise_id
     WHERE e.workout_id = ?
       AND s.done = 1;`,
    [workoutId]
  );

  return {
    totalSets: total?.count ?? 0,
    doneSets: done?.done_sets ?? 0,
  };
}

export async function getWorkoutExercises(db, workoutId) {
  const exercises = await db.getAllAsync(
    `SELECT
        exercise_id,
        exercise_name,
        sets,
        done,
        visible_columns
     FROM Exercise
     WHERE workout_id = ?;`,
    [workoutId]
  );

  const sets = await db.getAllAsync(
    `SELECT s.*
     FROM Sets s
     JOIN Exercise e ON e.exercise_id = s.exercise_id
     WHERE e.workout_id = ?;`,
    [workoutId]
  );

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
        ? JSON.parse(exercise.visible_columns)
        : DEFAULT_VISIBLE_COLUMNS,
    };
  });
}

export async function addExerciseToWorkout(db, { workoutId, exerciseName }) {
  await withTransaction(db, async () => {
    await db.runAsync(
      `INSERT INTO Exercise (workout_id, exercise_name, sets)
       VALUES (?, ?, ?);`,
      [workoutId, exerciseName, 0]
    );

    await db.runAsync(
      `UPDATE Workout
       SET done = 0
       WHERE workout_id = ?;`,
      [workoutId]
    );

    await refreshWorkoutHierarchyCompletion(db, workoutId);
  });
}

export async function deleteExercise(db, exerciseId) {
  await withTransaction(db, async () => {
    const exercise = await db.getFirstAsync(
      `SELECT workout_id
       FROM Exercise
       WHERE exercise_id = ?;`,
      [exerciseId]
    );

    await db.runAsync(
      `DELETE FROM Sets
       WHERE exercise_id = ?;`,
      [exerciseId]
    );

    await db.runAsync(
      `DELETE FROM Exercise
       WHERE exercise_id = ?;`,
      [exerciseId]
    );

    if (exercise?.workout_id) {
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
        [exercise.workout_id]
      );

      await refreshWorkoutHierarchyCompletion(db, exercise.workout_id);
    }
  });
}

export async function addSetToExercise(db, exerciseId) {
  await withTransaction(db, async () => {
    const exercise = await db.getFirstAsync(
      `SELECT workout_id
       FROM Exercise
       WHERE exercise_id = ?;`,
      [exerciseId]
    );

    const row = await db.getFirstAsync(
      `SELECT COUNT(*) AS count
       FROM Sets
       WHERE exercise_id = ?;`,
      [exerciseId]
    );

    await db.runAsync(
      `INSERT INTO Sets (set_number, exercise_id)
       VALUES (?, ?);`,
      [(row?.count ?? 0) + 1, exerciseId]
    );

    await syncExerciseSetCount(db, exerciseId);
    await refreshExerciseCompletion(db, exerciseId);

    if (exercise?.workout_id) {
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
        [exercise.workout_id]
      );

      await refreshWorkoutHierarchyCompletion(db, exercise.workout_id);
    }
  });
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

export async function updateStrengthSetDone(db, { workoutId, setId, done }) {
  await withTransaction(db, async () => {
    await db.runAsync(
      `UPDATE Sets
       SET done = ?
       WHERE sets_id = ?;`,
      [done ? 1 : 0, setId]
    );

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

    await refreshWorkoutHierarchyCompletion(db, workoutId);
  });
}

export async function deleteSet(db, setId) {
  await withTransaction(db, async () => {
    const set = await db.getFirstAsync(
      `SELECT s.exercise_id, e.workout_id
       FROM Sets s
       JOIN Exercise e ON e.exercise_id = s.exercise_id
       WHERE s.sets_id = ?;`,
      [setId]
    );

    if (!set) {
      return;
    }

    await db.runAsync(
      `DELETE FROM Sets
       WHERE sets_id = ?;`,
      [setId]
    );

    await renumberExerciseSets(db, set.exercise_id);
    await syncExerciseSetCount(db, set.exercise_id);
    await refreshExerciseCompletion(db, set.exercise_id);

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
      [set.workout_id]
    );

    await refreshWorkoutHierarchyCompletion(db, set.workout_id);
  });
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
    `SELECT set_number, pause, rpe, weight, reps, done, failed, note
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

export async function initializeExerciseSets(db, { exerciseId, count }) {
  await withTransaction(db, async () => {
    for (let index = 1; index <= count; index += 1) {
      await db.runAsync(
        `INSERT INTO Sets (set_number, exercise_id)
         VALUES (?, ?);`,
        [index, exerciseId]
      );
    }

    await syncExerciseSetCount(db, exerciseId);
  });
}

export async function saveExerciseSets(db, { exerciseId, sets }) {
  await withTransaction(db, async () => {
    const exercise = await db.getFirstAsync(
      `SELECT workout_id
       FROM Exercise
       WHERE exercise_id = ?;`,
      [exerciseId]
    );

    for (const set of sets) {
      await db.runAsync(
        `UPDATE Sets
         SET pause = ?,
             rpe = ?,
             weight = ?,
             reps = ?,
             done = ?,
             failed = ?,
             note = ?
         WHERE exercise_id = ?
           AND set_number = ?;`,
        [
          set.pause,
          set.rpe,
          set.weight,
          set.reps,
          set.done ? 1 : 0,
          set.failed ? 1 : 0,
          set.note,
          exerciseId,
          set.set_number,
        ]
      );
    }

    await refreshExerciseCompletion(db, exerciseId);

    if (exercise?.workout_id) {
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
        [exercise.workout_id]
      );

      await refreshWorkoutHierarchyCompletion(db, exercise.workout_id);
    }
  });
}

export async function updateExerciseDone(db, { exerciseId, done }) {
  await withTransaction(db, async () => {
    const exercise = await db.getFirstAsync(
      `SELECT workout_id
       FROM Exercise
       WHERE exercise_id = ?;`,
      [exerciseId]
    );

    await db.runAsync(
      `UPDATE Exercise
       SET done = ?
       WHERE exercise_id = ?;`,
      [done ? 1 : 0, exerciseId]
    );

    if (exercise?.workout_id) {
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
        [exercise.workout_id]
      );

      await refreshWorkoutHierarchyCompletion(db, exercise.workout_id);
    }
  });
}

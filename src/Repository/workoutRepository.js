export async function getWorkoutHierarchyIds(db, workoutId) {
  return db.getFirstAsync(
    `SELECT
        d.day_id,
        d.microcycle_id,
        mc.mesocycle_id
     FROM Workout w
     JOIN Day d ON d.day_id = w.day_id
     JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
     WHERE w.workout_id = ?;`,
    [workoutId]
  );
}

export async function getDayHierarchyIds(db, dayId) {
  return db.getFirstAsync(
    `SELECT
        d.day_id,
        d.microcycle_id,
        mc.mesocycle_id
     FROM Day d
     JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
     WHERE d.day_id = ?;`,
    [dayId]
  );
}

export async function getWorkoutTimerState(db, workoutId) {
  return db.getFirstAsync(
    `SELECT
        done,
        original_start_time,
        timer_start,
        elapsed_time
     FROM Workout
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function persistWorkoutTimerState(
  db,
  { workoutId, timerStart, elapsedTime }
) {
  await db.runAsync(
    `UPDATE Workout
     SET timer_start = ?,
         elapsed_time = ?
     WHERE workout_id = ?;`,
    [timerStart, elapsedTime, workoutId]
  );
}

export async function updateWorkoutElapsedTime(db, { workoutId, elapsedTime }) {
  await db.runAsync(
    `UPDATE Workout
     SET elapsed_time = ?
     WHERE workout_id = ?;`,
    [elapsedTime, workoutId]
  );
}

export async function getWorkoutOriginalStartTime(db, workoutId) {
  return db.getFirstAsync(
    `SELECT original_start_time
     FROM Workout
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function setWorkoutOriginalStartTime(db, { workoutId, startTime }) {
  await db.runAsync(
    `UPDATE Workout
     SET original_start_time = ?
     WHERE workout_id = ?;`,
    [startTime, workoutId]
  );
}

export async function getWorkoutStartTimestamp(db, workoutId) {
  return db.getFirstAsync(
    `SELECT start_ts
     FROM Workout
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function setWorkoutStartTimestamp(db, { workoutId, startTs }) {
  await db.runAsync(
    `UPDATE Workout
     SET start_ts = ?
     WHERE workout_id = ?;`,
    [startTs, workoutId]
  );
}

export async function stopWorkoutStopwatch(
  db,
  { workoutId, durationSeconds }
) {
  await db.runAsync(
    `UPDATE Workout
     SET start_ts = NULL,
         duration_seconds = ?
     WHERE workout_id = ?;`,
    [durationSeconds, workoutId]
  );
}

export async function updateWorkoutDone(db, { workoutId, done }) {
  await db.runAsync(
    `UPDATE Workout
     SET done = ?
     WHERE workout_id = ?;`,
    [done ? 1 : 0, workoutId]
  );
}

export async function resetWorkoutStateFields(db, workoutId) {
  await db.runAsync(
    `UPDATE Workout
     SET done = 0,
         original_start_time = NULL,
         timer_start = NULL,
         elapsed_time = 0
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function updateDayDoneFromWorkouts(db, dayId) {
  await db.runAsync(
    `UPDATE Day
     SET done = (
       NOT EXISTS (
         SELECT 1
         FROM Workout
         WHERE Workout.day_id = Day.day_id
           AND Workout.done = 0
       )
     )
     WHERE day_id = ?;`,
    [dayId]
  );
}

export async function updateMicrocycleDoneFromWorkouts(db, microcycleId) {
  await db.runAsync(
    `UPDATE Microcycle
     SET done = (
       NOT EXISTS (
         SELECT 1
         FROM Workout
         JOIN Day ON Day.day_id = Workout.day_id
         WHERE Day.microcycle_id = Microcycle.microcycle_id
           AND Workout.done = 0
       )
     )
     WHERE microcycle_id = ?;`,
    [microcycleId]
  );
}

export async function updateMesocycleDoneFromMicrocycles(db, mesocycleId) {
  await db.runAsync(
    `UPDATE Mesocycle
     SET done = (
       NOT EXISTS (
         SELECT 1
         FROM Microcycle
         WHERE Microcycle.mesocycle_id = Mesocycle.mesocycle_id
           AND Microcycle.done = 0
       )
     )
     WHERE mesocycle_id = ?;`,
    [mesocycleId]
  );
}

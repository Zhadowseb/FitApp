export async function createProgram(db, { programName, startDate, status }) {
  await db.runAsync(
    `INSERT INTO Program (program_name, start_date, status)
     VALUES (?, ?, ?);`,
    [programName, startDate, status]
  );
}

export async function getProgramsOverview(db) {
  return db.getAllAsync(
    `SELECT
        p.program_id,
        p.program_name,
        p.start_date,
        p.status,
        COALESCE(mesocycles.mesocycle_count, 0) AS mesocycle_count,
        COALESCE(microcycles.week_count, 0) AS week_count,
        COALESCE(days.day_count, 0) AS day_count,
        COALESCE(workouts.workout_count, 0) AS workout_count
     FROM Program p
     LEFT JOIN (
        SELECT
          program_id,
          COUNT(*) AS mesocycle_count
        FROM Mesocycle
        GROUP BY program_id
     ) mesocycles
       ON mesocycles.program_id = p.program_id
     LEFT JOIN (
        SELECT
          program_id,
          COUNT(*) AS week_count
        FROM Microcycle
        GROUP BY program_id
     ) microcycles
       ON microcycles.program_id = p.program_id
     LEFT JOIN (
        SELECT
          program_id,
          COUNT(*) AS day_count
        FROM Day
        GROUP BY program_id
     ) days
       ON days.program_id = p.program_id
     LEFT JOIN (
        SELECT
          d.program_id,
          COUNT(w.workout_id) AS workout_count
        FROM Day d
        LEFT JOIN Workout w
          ON w.day_id = d.day_id
        GROUP BY d.program_id
     ) workouts
       ON workouts.program_id = p.program_id
     ORDER BY p.start_date DESC, p.program_id DESC;`
  );
}

export async function getProgramStatus(db, programId) {
  return db.getFirstAsync(
    `SELECT status
     FROM Program
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function getProgramName(db, programId) {
  return db.getFirstAsync(
    `SELECT program_name
     FROM Program
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function getProgramBestExerciseSelections(db, programId) {
  return db.getAllAsync(
    `SELECT exercise_name, is_selected
     FROM Program_Best_Exercise
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function insertProgramBestExerciseSelection(
  db,
  { programId, exerciseName, isSelected = true }
) {
  await db.runAsync(
    `INSERT OR IGNORE INTO Program_Best_Exercise (
      program_id,
      exercise_name,
      is_selected
    ) VALUES (?, ?, ?);`,
    [programId, exerciseName, isSelected ? 1 : 0]
  );
}

export async function upsertProgramBestExerciseSelection(
  db,
  { programId, exerciseName, isSelected }
) {
  await db.runAsync(
    `INSERT INTO Program_Best_Exercise (
      program_id,
      exercise_name,
      is_selected
    ) VALUES (?, ?, ?)
     ON CONFLICT(program_id, exercise_name)
     DO UPDATE SET is_selected = excluded.is_selected;`,
    [programId, exerciseName, isSelected ? 1 : 0]
  );
}

export async function updateProgramStatus(db, { programId, status }) {
  await db.runAsync(
    `UPDATE Program
     SET status = ?
     WHERE program_id = ?;`,
    [status, programId]
  );
}

export async function updateProgramName(db, { programId, programName }) {
  await db.runAsync(
    `UPDATE Program
     SET program_name = ?
     WHERE program_id = ?;`,
    [programName, programId]
  );
}

export async function getProgramDayCount(db, programId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS total_days
     FROM Day
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function getDayByProgramAndDate(db, { programId, date }) {
  return db.getFirstAsync(
    `SELECT day_id, Weekday
     FROM Day
     WHERE program_id = ?
       AND date = ?;`,
    [programId, date]
  );
}

export async function getWorkoutsByDayId(db, dayId) {
  return db.getAllAsync(
    `SELECT workout_id, label, done, day_id
     FROM Workout
     WHERE day_id = ?;`,
    [dayId]
  );
}

export async function getWorkoutOptions(db, programId) {
  return db.getAllAsync(
    `SELECT w.workout_id, w.date
     FROM Workout w
     JOIN Day d ON d.day_id = w.day_id
     WHERE d.program_id = ?
     ORDER BY w.date;`,
    [programId]
  );
}

export async function getSetDoneStatesByDayId(db, dayId) {
  return db.getAllAsync(
    `SELECT s.done
     FROM Sets s
     JOIN Exercise e ON e.exercise_id = s.exercise_id
     JOIN Workout w ON w.workout_id = e.workout_id
     WHERE w.day_id = ?;`,
    [dayId]
  );
}

export async function getCompletedStrengthSetsByProgram(db, programId) {
  return db.getAllAsync(
    `SELECT
        e.exercise_name,
        s.weight,
        s.reps
     FROM Sets s
     JOIN Exercise e ON e.exercise_id = s.exercise_id
     JOIN Workout w ON w.workout_id = e.workout_id
     JOIN Day d ON d.day_id = w.day_id
     WHERE d.program_id = ?
       AND s.done = 1
       AND s.weight IS NOT NULL
       AND s.reps IS NOT NULL
     ORDER BY e.exercise_name COLLATE NOCASE ASC;`,
    [programId]
  );
}

export async function deleteSetsByProgram(db, programId) {
  await db.runAsync(
    `DELETE FROM Sets
     WHERE exercise_id IN (
       SELECT e.exercise_id
       FROM Exercise e
       JOIN Workout w ON w.workout_id = e.workout_id
       JOIN Day d ON d.day_id = w.day_id
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
       WHERE m.program_id = ?
     );`,
    [programId]
  );
}

export async function deleteExercisesByProgram(db, programId) {
  await db.runAsync(
    `DELETE FROM Exercise
     WHERE workout_id IN (
       SELECT w.workout_id
       FROM Workout w
       JOIN Day d ON d.day_id = w.day_id
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
       WHERE m.program_id = ?
     );`,
    [programId]
  );
}

export async function deleteRunsByProgram(db, programId) {
  await db.runAsync(
    `DELETE FROM Run
     WHERE workout_id IN (
       SELECT w.workout_id
       FROM Workout w
       JOIN Day d ON d.day_id = w.day_id
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
       WHERE m.program_id = ?
     );`,
    [programId]
  );
}

export async function deleteWorkoutsByProgram(db, programId) {
  await db.runAsync(
    `DELETE FROM Workout
     WHERE day_id IN (
       SELECT d.day_id
       FROM Day d
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
       WHERE m.program_id = ?
     );`,
    [programId]
  );
}

export async function deleteDaysByProgram(db, programId) {
  await db.runAsync(
    `DELETE FROM Day
     WHERE microcycle_id IN (
       SELECT mc.microcycle_id
       FROM Microcycle mc
       JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
       WHERE m.program_id = ?
     );`,
    [programId]
  );
}

export async function deleteMicrocyclesByProgram(db, programId) {
  await db.runAsync(
    `DELETE FROM Microcycle
     WHERE mesocycle_id IN (
       SELECT mesocycle_id
       FROM Mesocycle
       WHERE program_id = ?
     );`,
    [programId]
  );
}

export async function deleteEstimatedSetsByProgram(db, programId) {
  await db.runAsync(
    `DELETE FROM Estimated_Set
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function deleteProgramBestExercisesByProgram(db, programId) {
  await db.runAsync(
    `DELETE FROM Program_Best_Exercise
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function deleteMesocyclesByProgram(db, programId) {
  await db.runAsync(
    `DELETE FROM Mesocycle
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function deleteProgramById(db, programId) {
  await db.runAsync(
    `DELETE FROM Program
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function countMesocyclesByProgram(db, programId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM Mesocycle
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function countMicrocyclesByProgram(db, programId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM Microcycle
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function insertMesocycle(
  db,
  { programId, mesocycleNumber, weeks, focus }
) {
  return db.runAsync(
    `INSERT INTO Mesocycle (program_id, mesocycle_number, weeks, focus)
     VALUES (?, ?, ?, ?);`,
    [programId, mesocycleNumber, weeks, focus]
  );
}

export async function insertMicrocycle(
  db,
  { mesocycleId, programId, microcycleNumber }
) {
  return db.runAsync(
    `INSERT INTO Microcycle (mesocycle_id, program_id, microcycle_number)
     VALUES (?, ?, ?);`,
    [mesocycleId, programId, microcycleNumber]
  );
}

export async function insertDay(
  db,
  { microcycleId, programId, weekday, date }
) {
  return db.runAsync(
    `INSERT INTO Day (microcycle_id, program_id, Weekday, date)
     VALUES (?, ?, ?, ?);`,
    [microcycleId, programId, weekday, date]
  );
}

export async function getMesocyclesByProgram(db, programId) {
  return db.getAllAsync(
    `SELECT mesocycle_id, mesocycle_number, weeks, focus, done
     FROM Mesocycle
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function getMesocycleWorkoutCountsByProgram(db, programId) {
  return db.getAllAsync(
    `SELECT m.mesocycle_id, COUNT(w.workout_id) AS workout_count
     FROM Mesocycle m
     LEFT JOIN Microcycle mc ON mc.mesocycle_id = m.mesocycle_id
     LEFT JOIN Day d ON d.microcycle_id = mc.microcycle_id
     LEFT JOIN Workout w ON w.day_id = d.day_id
     WHERE m.program_id = ?
     GROUP BY m.mesocycle_id;`,
    [programId]
  );
}

export async function updateMesocycleFocus(db, { mesocycleId, focus }) {
  await db.runAsync(
    `UPDATE Mesocycle
     SET focus = ?
     WHERE mesocycle_id = ?;`,
    [focus, mesocycleId]
  );
}

export async function getMicrocyclesByMesocycle(db, mesocycleId) {
  return db.getAllAsync(
    `SELECT microcycle_id, microcycle_number, program_id, focus, done
     FROM Microcycle
     WHERE mesocycle_id = ?;`,
    [mesocycleId]
  );
}

export async function getMicrocyclesByMesocycleForInsert(db, mesocycleId) {
  return db.getAllAsync(
    `SELECT microcycle_id, microcycle_number
     FROM Microcycle
     WHERE mesocycle_id = ?;`,
    [mesocycleId]
  );
}

export async function getLastSundayByMicrocycle(db, microcycleId) {
  return db.getFirstAsync(
    `SELECT date
     FROM Day
     WHERE microcycle_id = ?
       AND Weekday = 'Sunday';`,
    [microcycleId]
  );
}

export async function incrementMesocycleWeeks(db, mesocycleId) {
  await db.runAsync(
    `UPDATE Mesocycle
     SET weeks = weeks + 1
     WHERE mesocycle_id = ?;`,
    [mesocycleId]
  );
}

export async function deleteSetsByMesocycle(db, mesocycleId) {
  await db.runAsync(
    `DELETE FROM Sets
     WHERE exercise_id IN (
       SELECT e.exercise_id
       FROM Exercise e
       JOIN Workout w ON w.workout_id = e.workout_id
       JOIN Day d ON d.day_id = w.day_id
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       WHERE mc.mesocycle_id = ?
     );`,
    [mesocycleId]
  );
}

export async function deleteExercisesByMesocycle(db, mesocycleId) {
  await db.runAsync(
    `DELETE FROM Exercise
     WHERE workout_id IN (
       SELECT w.workout_id
       FROM Workout w
       JOIN Day d ON d.day_id = w.day_id
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       WHERE mc.mesocycle_id = ?
     );`,
    [mesocycleId]
  );
}

export async function deleteRunsByMesocycle(db, mesocycleId) {
  await db.runAsync(
    `DELETE FROM Run
     WHERE workout_id IN (
       SELECT w.workout_id
       FROM Workout w
       JOIN Day d ON d.day_id = w.day_id
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       WHERE mc.mesocycle_id = ?
     );`,
    [mesocycleId]
  );
}

export async function deleteWorkoutsByMesocycle(db, mesocycleId) {
  await db.runAsync(
    `DELETE FROM Workout
     WHERE day_id IN (
       SELECT d.day_id
       FROM Day d
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       WHERE mc.mesocycle_id = ?
     );`,
    [mesocycleId]
  );
}

export async function deleteDaysByMesocycle(db, mesocycleId) {
  await db.runAsync(
    `DELETE FROM Day
     WHERE microcycle_id IN (
       SELECT microcycle_id
       FROM Microcycle
       WHERE mesocycle_id = ?
     );`,
    [mesocycleId]
  );
}

export async function deleteMicrocyclesByMesocycle(db, mesocycleId) {
  await db.runAsync(
    `DELETE FROM Microcycle
     WHERE mesocycle_id = ?;`,
    [mesocycleId]
  );
}

export async function deleteMesocycleById(db, mesocycleId) {
  await db.runAsync(
    `DELETE FROM Mesocycle
     WHERE mesocycle_id = ?;`,
    [mesocycleId]
  );
}

export async function getMesocycleOptions(db, programId) {
  return db.getAllAsync(
    `SELECT mesocycle_id, mesocycle_number
     FROM Mesocycle
     WHERE program_id = ?
     ORDER BY mesocycle_number;`,
    [programId]
  );
}

export async function getWeeksBeforeMesocycle(
  db,
  { programId, mesocycleNumber }
) {
  return db.getFirstAsync(
    `SELECT COALESCE(SUM(weeks), 0) AS total_weeks
     FROM Mesocycle
     WHERE program_id = ?
       AND mesocycle_number < ?;`,
    [programId, mesocycleNumber]
  );
}

export async function getMicrocycleNumberAndMesocycleNumber(
  db,
  { programId, microcycleId }
) {
  return db.getFirstAsync(
    `SELECT
        mc.microcycle_number,
        m.mesocycle_number
     FROM Microcycle mc
     JOIN Mesocycle m ON mc.mesocycle_id = m.mesocycle_id
     WHERE mc.microcycle_id = ?
       AND mc.program_id = ?;`,
    [microcycleId, programId]
  );
}

export async function updateMicrocycleFocus(db, { microcycleId, focus }) {
  await db.runAsync(
    `UPDATE Microcycle
     SET focus = ?
     WHERE microcycle_id = ?;`,
    [focus, microcycleId]
  );
}

export async function getTotalWorkoutCountByMicrocycle(db, microcycleId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM Workout w
     JOIN Day d ON w.day_id = d.day_id
     WHERE d.microcycle_id = ?;`,
    [microcycleId]
  );
}

export async function getDoneWorkoutCountByMicrocycle(db, microcycleId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM Workout w
     JOIN Day d ON w.day_id = d.day_id
     WHERE d.microcycle_id = ?
       AND w.done = 1;`,
    [microcycleId]
  );
}

export async function getDayByMicrocycleAndDate(
  db,
  { microcycleId, date }
) {
  return db.getFirstAsync(
    `SELECT day_id
     FROM Day
     WHERE microcycle_id = ?
       AND date = ?;`,
    [microcycleId, date]
  );
}

export async function getWorkoutLabelsByDay(db, dayId) {
  return db.getAllAsync(
    `SELECT label
     FROM Workout
     WHERE day_id = ?;`,
    [dayId]
  );
}

export async function getAllMicrocyclesByProgram(db, programId) {
  return db.getAllAsync(
    `SELECT microcycle_id, microcycle_number, mesocycle_id
     FROM Microcycle
     WHERE program_id = ?
     ORDER BY microcycle_number;`,
    [programId]
  );
}

export async function getDaysByMicrocycle(db, microcycleId) {
  return db.getAllAsync(
    `SELECT day_id, Weekday, date
     FROM Day
     WHERE microcycle_id = ?;`,
    [microcycleId]
  );
}

export async function getWorkoutsByDay(db, dayId) {
  return db.getAllAsync(
    `SELECT *
     FROM Workout
     WHERE day_id = ?;`,
    [dayId]
  );
}

export async function deleteSetsByMicrocycle(db, microcycleId) {
  await db.runAsync(
    `DELETE FROM Sets
     WHERE exercise_id IN (
       SELECT e.exercise_id
       FROM Exercise e
       JOIN Workout w ON w.workout_id = e.workout_id
       JOIN Day d ON d.day_id = w.day_id
       WHERE d.microcycle_id = ?
     );`,
    [microcycleId]
  );
}

export async function deleteExercisesByMicrocycle(db, microcycleId) {
  await db.runAsync(
    `DELETE FROM Exercise
     WHERE workout_id IN (
       SELECT w.workout_id
       FROM Workout w
       JOIN Day d ON d.day_id = w.day_id
       WHERE d.microcycle_id = ?
     );`,
    [microcycleId]
  );
}

export async function deleteRunsByMicrocycle(db, microcycleId) {
  await db.runAsync(
    `DELETE FROM Run
     WHERE workout_id IN (
       SELECT w.workout_id
       FROM Workout w
       JOIN Day d ON d.day_id = w.day_id
       WHERE d.microcycle_id = ?
     );`,
    [microcycleId]
  );
}

export async function deleteWorkoutsByMicrocycle(db, microcycleId) {
  await db.runAsync(
    `DELETE FROM Workout
     WHERE day_id IN (
       SELECT day_id
       FROM Day
       WHERE microcycle_id = ?
     );`,
    [microcycleId]
  );
}

export async function deleteDaysByMicrocycle(db, microcycleId) {
  await db.runAsync(
    `DELETE FROM Day
     WHERE microcycle_id = ?;`,
    [microcycleId]
  );
}

export async function deleteMicrocycleById(db, microcycleId) {
  await db.runAsync(
    `DELETE FROM Microcycle
     WHERE microcycle_id = ?;`,
    [microcycleId]
  );
}

export async function getDayByWeekdayAndMicrocycle(
  db,
  { weekday, microcycleId }
) {
  return db.getFirstAsync(
    `SELECT day_id, date, done
     FROM Day
     WHERE Weekday = ?
       AND microcycle_id = ?;`,
    [weekday, microcycleId]
  );
}

export async function createWorkout(db, { date, dayId, label }) {
  return db.runAsync(
    `INSERT INTO Workout (date, day_id, label)
     VALUES (?, ?, ?);`,
    [date, dayId, label]
  );
}

export async function copyWorkoutIntoDay(
  db,
  { date, dayId, workoutId }
) {
  return db.runAsync(
    `INSERT INTO Workout (date, day_id, label)
     SELECT ?, ?, label
     FROM Workout
     WHERE workout_id = ?;`,
    [date, dayId, workoutId]
  );
}

export async function getDayByDate(db, { programId, date }) {
  return db.getFirstAsync(
    `SELECT day_id
     FROM Day
     WHERE date = ?
       AND program_id = ?;`,
    [date, programId]
  );
}

export async function deleteWorkoutById(db, workoutId) {
  await db.runAsync(
    `DELETE FROM Workout
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function getMicrocycleMetadata(db, microcycleId) {
  return db.getFirstAsync(
    `SELECT mesocycle_id, microcycle_number
     FROM Microcycle
     WHERE microcycle_id = ?;`,
    [microcycleId]
  );
}

export async function getMesocycleMetadata(
  db,
  { mesocycleId, programId }
) {
  return db.getFirstAsync(
    `SELECT mesocycle_number
     FROM Mesocycle
     WHERE mesocycle_id = ?
       AND program_id = ?;`,
    [mesocycleId, programId]
  );
}

export async function getProgramMetadata(db, programId) {
  return db.getFirstAsync(
    `SELECT start_date
     FROM Program
     WHERE program_id = ?;`,
    [programId]
  );
}

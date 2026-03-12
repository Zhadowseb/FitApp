export async function getLocationLogsByWorkout(db, workoutId) {
  return db.getAllAsync(
    `SELECT *
     FROM LocationLog
     WHERE workout_id = ?
     ORDER BY timestamp ASC;`,
    [workoutId]
  );
}

export async function createLocationLog(
  db,
  { workoutId, latitude, longitude, accuracy, timestamp }
) {
  await db.runAsync(
    `INSERT INTO LocationLog (
      workout_id,
      latitude,
      longitude,
      accuracy,
      timestamp
    ) VALUES (?, ?, ?, ?, ?);`,
    [workoutId, latitude, longitude, accuracy, timestamp]
  );
}

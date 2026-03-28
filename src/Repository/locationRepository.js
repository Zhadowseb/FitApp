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

export async function createLocationDebugLog(
  db,
  {
    workoutId = null,
    latitude = null,
    longitude = null,
    accuracy = null,
    timestamp = null,
    accepted = 0,
    rejectionReason = null,
    distanceMeters = null,
    timeDiffSeconds = null,
    speedMetersPerSecond = null,
    createdAt = Date.now(),
  }
) {
  await db.runAsync(
    `INSERT INTO LocationDebugLog (
      workout_id,
      latitude,
      longitude,
      accuracy,
      timestamp,
      accepted,
      rejection_reason,
      distance_meters,
      time_diff_seconds,
      speed_meters_per_second,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      workoutId,
      latitude,
      longitude,
      accuracy,
      timestamp,
      accepted ? 1 : 0,
      rejectionReason,
      distanceMeters,
      timeDiffSeconds,
      speedMetersPerSecond,
      createdAt,
    ]
  );
}

export async function getLatestLocationLogByWorkout(db, workoutId) {
  return db.getFirstAsync(
    `SELECT *
     FROM LocationLog
     WHERE workout_id = ?
     ORDER BY timestamp DESC
     LIMIT 1;`,
    [workoutId]
  );
}

export async function deleteLocationLogsByWorkout(db, workoutId) {
  await db.runAsync(
    `DELETE FROM LocationLog
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function deleteLocationDebugLogsByWorkout(db, workoutId) {
  await db.runAsync(
    `DELETE FROM LocationDebugLog
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function getLocationDebugSummaryByWorkout(db, workoutId) {
  return db.getFirstAsync(
    `SELECT
        COUNT(*) AS total_callbacks,
        SUM(CASE WHEN accepted = 1 THEN 1 ELSE 0 END) AS accepted_count,
        SUM(CASE WHEN accepted = 0 THEN 1 ELSE 0 END) AS rejected_count,
        SUM(CASE WHEN rejection_reason = 'accuracy' THEN 1 ELSE 0 END) AS accuracy_rejections,
        SUM(CASE WHEN rejection_reason = 'too_short' THEN 1 ELSE 0 END) AS short_distance_rejections,
        SUM(CASE WHEN rejection_reason = 'too_fast' THEN 1 ELSE 0 END) AS too_fast_rejections,
        SUM(CASE WHEN rejection_reason = 'invalid_time' THEN 1 ELSE 0 END) AS invalid_time_rejections
     FROM LocationDebugLog
     WHERE workout_id = ?;`,
    [workoutId]
  );
}

export async function getRecentLocationDebugLogsByWorkout(
  db,
  workoutId,
  limit = 40
) {
  return db.getAllAsync(
    `SELECT *
     FROM LocationDebugLog
     WHERE workout_id = ?
     ORDER BY timestamp DESC, id DESC
     LIMIT ?;`,
    [workoutId, Number(limit)]
  );
}

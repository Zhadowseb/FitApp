import { withTransaction } from "./shared";

export async function getRunSets(db, { workoutId, type }) {
  return db.getAllAsync(
    `SELECT *
     FROM Run
     WHERE workout_id = ?
       AND type = ?
     ORDER BY set_number ASC;`,
    [workoutId, type]
  );
}

export async function getOrderedRunSetsForWorkout(db, workoutId) {
  return db.getAllAsync(
    `SELECT *
     FROM Run
     WHERE workout_id = ?
     ORDER BY
       CASE type
         WHEN 'WARMUP' THEN 1
         WHEN 'WORKING_SET' THEN 2
         WHEN 'COOLDOWN' THEN 3
       END,
       set_number ASC;`,
    [workoutId]
  );
}

export async function addRunSet(db, { workoutId, type }) {
  const row = await db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM Run
     WHERE workout_id = ?
       AND type = ?
       AND is_pause = 0;`,
    [workoutId, type]
  );

  await db.runAsync(
    `INSERT INTO Run (workout_id, type, set_number)
     VALUES (?, ?, ?);`,
    [workoutId, type, (row?.count ?? 0) + 1]
  );
}

export async function updateRunSetField(db, { runId, field, value }) {
  await db.runAsync(
    `UPDATE Run
     SET ${field} = ?
     WHERE Run_id = ?;`,
    [value, runId]
  );
}

export async function updateRunSetDone(db, { runId, done }) {
  await db.runAsync(
    `UPDATE Run
     SET done = ?
     WHERE Run_id = ?;`,
    [done ? 1 : 0, runId]
  );
}

export async function deleteRunSet(db, { runId, workoutId, type }) {
  await withTransaction(db, async () => {
    await db.runAsync(
      `DELETE FROM Run
       WHERE Run_id = ?;`,
      [runId]
    );

    await renumberWorkingRunSets(db, { workoutId, type });
  });
}

export async function renumberWorkingRunSets(db, { workoutId, type }) {
  const rows = await db.getAllAsync(
    `SELECT *
     FROM Run
     WHERE workout_id = ?
       AND type = ?
     ORDER BY set_number ASC;`,
    [workoutId, type]
  );

  let counter = 1;
  for (const row of rows) {
    if (!row.is_pause) {
      await db.runAsync(
        `UPDATE Run
         SET set_number = ?
         WHERE Run_id = ?;`,
        [counter, row.Run_id]
      );
      counter += 1;
    }
  }
}

export async function toggleRunSetPause(
  db,
  { runId, workoutId, type, isPause }
) {
  await withTransaction(db, async () => {
    await db.runAsync(
      `UPDATE Run
       SET is_pause = ?
       WHERE Run_id = ?;`,
      [isPause ? 1 : 0, runId]
    );

    await renumberWorkingRunSets(db, { workoutId, type });
  });
}

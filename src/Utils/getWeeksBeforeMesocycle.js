export async function getWeeksBeforeMesocycle({
  db,
  program_id,
  mesocycle_number,
}) {
  const row = await db.getFirstAsync(
    `SELECT COALESCE(SUM(weeks), 0) AS total_weeks
     FROM Mesocycle
     WHERE program_id = ?
       AND mesocycle_number < ?;`,
    [program_id, mesocycle_number]
  );

  return row?.total_weeks ?? 0;
}


export async function getGlobalWeekIndexFromMicrocycle({
  db,
  program_id,
  microcycle_id,
}) {
  // 1. Find microcycle + tilhørende mesocycle
  const micro = await db.getFirstAsync(
    `
    SELECT 
      mc.microcycle_number,
      m.mesocycle_number
    FROM Microcycle mc
    JOIN Mesocycle m ON mc.mesocycle_id = m.mesocycle_id
    WHERE mc.microcycle_id = ?
      AND mc.program_id = ?;
    `,
    [microcycle_id, program_id]
  );

  if (!micro) {
    throw new Error("Microcycle not found");
  }

  const { microcycle_number, mesocycle_number } = micro;

  // 2. Sum weeks fra alle tidligere mesocycles
  const row = await db.getFirstAsync(
    `
    SELECT COALESCE(SUM(weeks), 0) AS weeks_before
    FROM Mesocycle
    WHERE program_id = ?
      AND mesocycle_number < ?;
    `,
    [program_id, mesocycle_number]
  );

  const weeksBefore = row?.weeks_before ?? 0;

  // 3. Global week index (0-baseret)
  const globalWeekIndex = weeksBefore + (microcycle_number - 1);

  return globalWeekIndex;
}

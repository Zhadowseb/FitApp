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

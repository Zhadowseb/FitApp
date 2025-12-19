// src/services/programDateService.js
import { parseCustomDate, formatDate } from "../../../../../Utils/dateUtils";

export async function calculateProgramDay({db, program_id, microcycle_id, weekdayIndex,}) {
  const microcycle = await db.getFirstAsync(
    `SELECT mesocycle_id, microcycle_number
     FROM Microcycle
     WHERE microcycle_id = ?;`,
    [microcycle_id]
  );

  const mesocycle = await db.getFirstAsync(
    `SELECT mesocycle_number
     FROM Mesocycle
     WHERE mesocycle_id = ?
       AND program_id = ?;`,
    [microcycle.mesocycle_id, program_id]
  );

  const weeksBefore = await db.getFirstAsync(
    `SELECT COALESCE(SUM(weeks), 0) AS total_weeks
     FROM Mesocycle
     WHERE program_id = ?
       AND mesocycle_number < ?;`,
    [program_id, mesocycle.mesocycle_number]
  );

  const weekCount =
    weeksBefore.total_weeks + microcycle.microcycle_number;

  const program = await db.getFirstAsync(
    `SELECT start_date FROM Program WHERE program_id = ?;`,
    [program_id]
  );

  const daysFromStart = weekCount * 7 + weekdayIndex - 7;

  const date = parseCustomDate(program.start_date);
  date.setDate(date.getDate() + daysFromStart);

  return formatDate(date);
}

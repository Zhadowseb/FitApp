import { parseCustomDate, formatDate } from "../../../../Utils/dateUtils";
import { getWeeksBeforeMesocycle } from "../../../../Utils/getWeeksBeforeMesocycle";
import { programService as programRepository } from "../../../../Services";

export async function calculateProgramDay({
  db, 
  program_id, 
  microcycle_id, 
  weekdayIndex,
}) {

  const microcycle = await programRepository.getMicrocycleMetadata(db, microcycle_id);

  const mesocycle = await programRepository.getMesocycleMetadata(db, {
    mesocycleId: microcycle.mesocycle_id,
    programId: program_id,
  });

  const weeksBefore = await getWeeksBeforeMesocycle({
    db,
    program_id,
    mesocycle_number: mesocycle.mesocycle_number,
  });

  const weekCount =
    weeksBefore + microcycle.microcycle_number;

  const program = await programRepository.getProgramMetadata(db, program_id);

  const daysFromStart = weekCount * 7 + weekdayIndex - 7;

  const date = parseCustomDate(program.start_date);
  date.setDate(date.getDate() + daysFromStart);

  return formatDate(date);
}

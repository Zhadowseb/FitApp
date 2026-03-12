import { programRepository } from "../Database/repository";

export async function getWeeksBeforeMesocycle({
  db,
  program_id,
  mesocycle_number,
}) {
  return programRepository.getWeeksBeforeMesocycle(db, {
    programId: program_id,
    mesocycleNumber: mesocycle_number,
  });
}


export async function getGlobalWeekIndexFromMicrocycle({
  db,
  program_id,
  microcycle_id,
}) {
  // 1. Find microcycle + tilhørende mesocycle
  return programRepository.getGlobalWeekIndexFromMicrocycle(db, {
    programId: program_id,
    microcycleId: microcycle_id,
  });
}

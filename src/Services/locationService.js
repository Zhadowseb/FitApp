import { locationRepository } from "../Repository";

export async function getLocationLogsByWorkout(db, workoutId) {
  return locationRepository.getLocationLogsByWorkout(db, workoutId);
}

export async function createLocationLog(
  db,
  { workoutId, latitude, longitude, accuracy, timestamp }
) {
  await locationRepository.createLocationLog(db, {
    workoutId,
    latitude,
    longitude,
    accuracy,
    timestamp,
  });
}

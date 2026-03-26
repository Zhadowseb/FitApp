import * as Location from "expo-location";
import { Platform } from "react-native";

import { locationRepository, workoutRepository } from "../Repository";
import { calculateDistance } from "../Utils/locationUtils";
import { withTransaction } from "./shared";

export const RUN_LOCATION_TASK = "background-location-task";

const MAX_ACCEPTED_ACCURACY_METERS = 35;
const MIN_SEGMENT_DISTANCE_METERS = 4;
const MAX_SEGMENT_SPEED_METERS_PER_SECOND = 8.5;

function normalizeLocationPoint(point) {
  const latitude = Number(point?.latitude);
  const longitude = Number(point?.longitude);
  const accuracy = Number(point?.accuracy);
  const timestamp = Number(point?.timestamp);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return {
    latitude,
    longitude,
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
    timestamp,
  };
}

function normalizeExpoLocationObject(location) {
  return normalizeLocationPoint({
    latitude: location?.coords?.latitude,
    longitude: location?.coords?.longitude,
    accuracy: location?.coords?.accuracy,
    timestamp: location?.timestamp,
  });
}

function isAcceptedAccuracy(point) {
  return (
    point?.accuracy === null ||
    point?.accuracy <= MAX_ACCEPTED_ACCURACY_METERS
  );
}

function shouldIncludeSegment(previousPoint, nextPoint) {
  if (!previousPoint || !nextPoint) {
    return false;
  }

  if (!isAcceptedAccuracy(nextPoint)) {
    return false;
  }

  const distanceMeters = calculateDistance(
    previousPoint.latitude,
    previousPoint.longitude,
    nextPoint.latitude,
    nextPoint.longitude
  );

  if (distanceMeters < MIN_SEGMENT_DISTANCE_METERS) {
    return false;
  }

  const timeDiffSeconds = (nextPoint.timestamp - previousPoint.timestamp) / 1000;

  if (!Number.isFinite(timeDiffSeconds) || timeDiffSeconds <= 0) {
    return false;
  }

  const speedMetersPerSecond = distanceMeters / timeDiffSeconds;

  if (speedMetersPerSecond > MAX_SEGMENT_SPEED_METERS_PER_SECOND) {
    return false;
  }

  return true;
}

function getLocationTrackingOptions() {
  return {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 2000,
    distanceInterval: 2,
    deferredUpdatesDistance: 0,
    deferredUpdatesInterval: 1000,
    pausesUpdatesAutomatically: false,
    activityType: Location.ActivityType.Fitness,
    foregroundService: {
      notificationTitle: "FitVen is tracking your run",
      notificationBody: "Distance and pace update while your workout is running.",
      notificationColor: "#d97706",
      killServiceOnDestroy: false,
    },
  };
}

async function ensureForegroundLocationPermission() {
  let foregroundPermission = await Location.getForegroundPermissionsAsync();

  if (!foregroundPermission.granted) {
    foregroundPermission = await Location.requestForegroundPermissionsAsync();
  }

  if (!foregroundPermission.granted) {
    throw new Error("Location permission was not granted.");
  }
}

async function ensureBackgroundLocationPermission({ requestIfMissing = true } = {}) {
  const backgroundLocationAvailable =
    await Location.isBackgroundLocationAvailableAsync();

  if (!backgroundLocationAvailable) {
    throw new Error("Background location is not available on this device.");
  }

  let backgroundPermission = await Location.getBackgroundPermissionsAsync();

  if (!backgroundPermission.granted && requestIfMissing) {
    backgroundPermission = await Location.requestBackgroundPermissionsAsync();
  }

  if (!backgroundPermission.granted) {
    throw new Error("Background location permission was not granted.");
  }
}

async function ensureLocationServicesEnabled() {
  let servicesEnabled = await Location.hasServicesEnabledAsync();

  if (!servicesEnabled && Platform.OS === "android") {
    try {
      await Location.enableNetworkProviderAsync();
    } catch {
      // If the user dismisses the dialog we fall through to the final check.
    }

    servicesEnabled = await Location.hasServicesEnabledAsync();
  }

  if (!servicesEnabled) {
    throw new Error("Location services are turned off.");
  }
}

async function setActiveWorkout(db, workoutId) {
  await withTransaction(db, async () => {
    await workoutRepository.clearActiveWorkoutFlags(db);
    await workoutRepository.setWorkoutActiveFlag(db, {
      workoutId,
      isActive: true,
    });
  });
}

export async function clearTrackedRunData(db, workoutId) {
  await locationRepository.deleteLocationLogsByWorkout(db, workoutId);
}

export async function getLocationLogsByWorkout(db, workoutId) {
  return locationRepository.getLocationLogsByWorkout(db, workoutId);
}

export async function getTrackedRunSummary(db, workoutId) {
  const logs = await locationRepository.getLocationLogsByWorkout(db, workoutId);
  let totalDistanceMeters = 0;
  let previousAcceptedPoint = null;

  for (const log of logs) {
    const currentPoint = normalizeLocationPoint(log);

    if (!currentPoint || !isAcceptedAccuracy(currentPoint)) {
      continue;
    }

    if (!previousAcceptedPoint) {
      previousAcceptedPoint = currentPoint;
      continue;
    }

    if (shouldIncludeSegment(previousAcceptedPoint, currentPoint)) {
      totalDistanceMeters += calculateDistance(
        previousAcceptedPoint.latitude,
        previousAcceptedPoint.longitude,
        currentPoint.latitude,
        currentPoint.longitude
      );

      previousAcceptedPoint = currentPoint;
    }
  }

  return {
    totalDistanceMeters,
    totalDistanceKm: totalDistanceMeters / 1000,
    pointCount: logs.length,
  };
}

export async function recordTrackedLocations(db, locations) {
  const workout = await workoutRepository.getActiveWorkoutForTracking(db);

  if (!workout?.workout_id) {
    return;
  }

  const normalizedLocations = locations
    .map(normalizeExpoLocationObject)
    .filter(Boolean)
    .sort((left, right) => left.timestamp - right.timestamp);

  if (!normalizedLocations.length) {
    return;
  }

  let previousAcceptedPoint = normalizeLocationPoint(
    await locationRepository.getLatestLocationLogByWorkout(db, workout.workout_id)
  );

  for (const location of normalizedLocations) {
    if (!isAcceptedAccuracy(location)) {
      continue;
    }

    if (previousAcceptedPoint && !shouldIncludeSegment(previousAcceptedPoint, location)) {
      continue;
    }

    await locationRepository.createLocationLog(db, {
      workoutId: workout.workout_id,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: location.timestamp,
    });

    previousAcceptedPoint = location;
  }
}

export async function startRunTracking(db, workoutId, { resetLogs = false } = {}) {
  await ensureLocationServicesEnabled();
  await ensureForegroundLocationPermission();
  await ensureBackgroundLocationPermission();

  if (resetLogs) {
    await clearTrackedRunData(db, workoutId);
  }

  await setActiveWorkout(db, workoutId);

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(RUN_LOCATION_TASK);

  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(
      RUN_LOCATION_TASK,
      getLocationTrackingOptions()
    );
  }
}

export async function ensureRunTracking(db, workoutId) {
  await ensureLocationServicesEnabled();
  await ensureForegroundLocationPermission();
  await ensureBackgroundLocationPermission({ requestIfMissing: false });
  await setActiveWorkout(db, workoutId);

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(RUN_LOCATION_TASK);

  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(
      RUN_LOCATION_TASK,
      getLocationTrackingOptions()
    );
  }
}

export async function syncRunTrackingState(db) {
  await workoutRepository.normalizeActiveWorkoutFlags(db);

  const activeWorkout = await workoutRepository.getActiveWorkoutForTracking(db);
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(RUN_LOCATION_TASK);

  if (activeWorkout?.workout_id || !hasStarted) {
    return;
  }

  await Location.stopLocationUpdatesAsync(RUN_LOCATION_TASK);
}

export async function stopRunTracking(db) {
  await workoutRepository.clearActiveWorkoutFlags(db);

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(RUN_LOCATION_TASK);

  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(RUN_LOCATION_TASK);
  }
}

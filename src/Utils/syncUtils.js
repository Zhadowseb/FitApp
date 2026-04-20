let lastIssuedSyncVersion = 0;

export const SQLITE_UUID_SQL = `
  lower(hex(randomblob(4))) || '-' ||
  lower(hex(randomblob(2))) || '-' ||
  '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
  substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
  lower(hex(randomblob(6)))
`;

export function normalizeSyncId(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function normalizeSyncVersion(value, fallbackValue = 0) {
  if (value === null || value === undefined || value === "") {
    return fallbackValue;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.trunc(numericValue) : fallbackValue;
}

export function createNextSyncVersion(previousVersion = null) {
  const previousNumericVersion = normalizeSyncVersion(previousVersion, 0);
  const nextVersion = Math.max(
    Date.now(),
    previousNumericVersion + 1,
    lastIssuedSyncVersion + 1
  );

  lastIssuedSyncVersion = nextVersion;
  return nextVersion;
}

export function normalizeDeletedAt(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

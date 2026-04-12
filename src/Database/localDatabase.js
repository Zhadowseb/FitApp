import * as SQLite from "expo-sqlite";

import { initializeDatabase } from "./db";

const LEGACY_DATABASE_NAME = "datab.db";
const ANONYMOUS_DATABASE_NAME = "datab-anon.db";
const USER_DATABASE_PREFIX = "datab-user";
const ACTIVE_DATABASE_NAME_STORAGE_KEY = "fitapp.active-database-name";
const LEGACY_DATABASE_OWNER_STORAGE_KEY = "fitapp.legacy-database-owner-user-id";

const LEGACY_COPY_TABLE_ORDER = [
  "Program",
  "Program_Sync_Delete",
  "Program_Best_Exercise",
  "Mesocycle",
  "Mesocycle_Sync_Delete",
  "Microcycle",
  "Microcycle_Sync_Delete",
  "Day",
  "Workout_Type",
  "Workout_Type_Instance",
  "Workout_Type_Instance_Sync_Delete",
  "Exercise",
  "Exercise_Instance",
  "Exercise_Instance_Sync_Delete",
  "Set",
  "Set_Sync_Delete",
  "Estimated_Set",
  "RMWeightProgression",
  "Run",
  "LocationLog",
  "LocationDebugLog",
];

const USER_DATA_TABLES = [
  "Program",
  "Mesocycle",
  "Microcycle",
  "Day",
  "Workout_Type_Instance",
  "Exercise_Instance",
  "Set",
  "Estimated_Set",
  "RMWeightProgression",
  "Run",
];

function getLocalStorage() {
  return globalThis.localStorage ?? null;
}

function quoteIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function getStoredValue(key) {
  const storage = getLocalStorage();

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredValue(key, value) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  try {
    if (value === null || value === undefined || value === "") {
      storage.removeItem(key);
      return;
    }

    storage.setItem(key, String(value));
  } catch {
    // Ignore local storage write failures so auth still works.
  }
}

function sanitizeUserIdForDatabaseName(userId) {
  return String(userId)
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function listTableNames(db) {
  const rows = await db.getAllAsync(
    `SELECT name
     FROM sqlite_master
     WHERE type = 'table'
       AND name NOT LIKE 'sqlite_%'
     ORDER BY name ASC;`
  );

  return rows.map((row) => row.name).filter(Boolean);
}

async function tableHasRows(db, tableName) {
  const row = await db.getFirstAsync(
    `SELECT 1 AS has_row
     FROM ${quoteIdentifier(tableName)}
     LIMIT 1;`
  );

  return Boolean(row?.has_row);
}

async function databaseHasUserData(db) {
  for (const tableName of USER_DATA_TABLES) {
    if (await tableHasRows(db, tableName)) {
      return true;
    }
  }

  return false;
}

async function copyTableRows(sourceDb, targetDb, tableName) {
  const [sourceColumns, targetColumns] = await Promise.all([
    sourceDb.getAllAsync(`PRAGMA table_info(${quoteIdentifier(tableName)});`),
    targetDb.getAllAsync(`PRAGMA table_info(${quoteIdentifier(tableName)});`),
  ]);

  const targetColumnNames = targetColumns.map((column) => column.name);
  const sharedColumnNames = sourceColumns
    .map((column) => column.name)
    .filter((columnName) => targetColumnNames.includes(columnName));

  if (sharedColumnNames.length === 0) {
    return;
  }

  const columnListSql = sharedColumnNames.map(quoteIdentifier).join(", ");
  const placeholdersSql = sharedColumnNames.map(() => "?").join(", ");

  for await (const row of sourceDb.getEachAsync(
    `SELECT ${columnListSql}
     FROM ${quoteIdentifier(tableName)};`
  )) {
    const values = sharedColumnNames.map((columnName) =>
      Object.prototype.hasOwnProperty.call(row, columnName) ? row[columnName] : null
    );

    await targetDb.runAsync(
      `INSERT OR REPLACE INTO ${quoteIdentifier(tableName)} (${columnListSql})
       VALUES (${placeholdersSql});`,
      values
    );
  }
}

export function getLegacyDatabaseName() {
  return LEGACY_DATABASE_NAME;
}

export function getAnonymousDatabaseName() {
  return ANONYMOUS_DATABASE_NAME;
}

export function getDatabaseNameForUserId(userId) {
  if (!userId) {
    return ANONYMOUS_DATABASE_NAME;
  }

  return `${USER_DATABASE_PREFIX}-${sanitizeUserIdForDatabaseName(userId)}.db`;
}

export function getActiveDatabaseName() {
  return (
    getStoredValue(ACTIVE_DATABASE_NAME_STORAGE_KEY) ??
    ANONYMOUS_DATABASE_NAME
  );
}

export function setActiveDatabaseName(databaseName) {
  setStoredValue(ACTIVE_DATABASE_NAME_STORAGE_KEY, databaseName);
}

export async function migrateLegacySharedDatabaseToUserDatabase({
  userId,
  targetDatabaseName,
  targetDb,
}) {
  if (!userId || !targetDb || !targetDatabaseName) {
    return false;
  }

  if (targetDatabaseName === LEGACY_DATABASE_NAME) {
    return false;
  }

  const claimedOwnerUserId = getStoredValue(LEGACY_DATABASE_OWNER_STORAGE_KEY);

  if (claimedOwnerUserId && claimedOwnerUserId !== userId) {
    return false;
  }

  if (await databaseHasUserData(targetDb)) {
    if (!claimedOwnerUserId) {
      setStoredValue(LEGACY_DATABASE_OWNER_STORAGE_KEY, userId);
    }

    return false;
  }

  const legacyDb = await SQLite.openDatabaseAsync(LEGACY_DATABASE_NAME);

  try {
    await initializeDatabase(legacyDb);

    const sourceTableNames = await listTableNames(legacyDb);
    const sourceTableNameSet = new Set(sourceTableNames);
    const orderedTableNames = [
      ...LEGACY_COPY_TABLE_ORDER.filter((tableName) =>
        sourceTableNameSet.has(tableName)
      ),
      ...sourceTableNames.filter(
        (tableName) => !LEGACY_COPY_TABLE_ORDER.includes(tableName)
      ),
    ];

    await targetDb.execAsync("BEGIN IMMEDIATE;");

    try {
      for (const tableName of orderedTableNames) {
        await copyTableRows(legacyDb, targetDb, tableName);
      }

      await targetDb.execAsync("COMMIT;");
    } catch (error) {
      await targetDb.execAsync("ROLLBACK;");
      throw error;
    }

    setStoredValue(LEGACY_DATABASE_OWNER_STORAGE_KEY, userId);
    return true;
  } finally {
    await legacyDb.closeAsync();
  }
}

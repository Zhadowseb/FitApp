import { programSchemaSql } from './schema/program';
import {
  initializeWeightliftingData,
  weightliftingSchemaSql,
} from './schema/weightlifting';
import { runningSchemaSql } from './schema/running';
import { locationSchemaSql } from './schema/location';

async function ensureColumnExists(db, tableName, columnName, columnDefinition) {
  const columns = await db.getAllAsync(`PRAGMA table_info(${tableName});`);

  if (columns.some((column) => column.name === columnName)) {
    return;
  }

  await db.execAsync(
    `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`
  );
}

async function ensureTableColumns(db, tableName, columns) {
  for (const [columnName, columnDefinition] of columns) {
    await ensureColumnExists(db, tableName, columnName, columnDefinition);
  }
}

export async function initializeDatabase(db) {
  await db.execAsync(`
    ${programSchemaSql}
    ${weightliftingSchemaSql}
    ${runningSchemaSql}
    ${locationSchemaSql}

    PRAGMA journal_mode = WAL;
  `);

  await ensureTableColumns(db, "Program", [
    ["status", "TEXT NOT NULL DEFAULT 'NOT_STARTED'"],
  ]);

  await ensureTableColumns(db, "Mesocycle", [
    ["weeks", "INTEGER NOT NULL DEFAULT 0"],
    ["focus", 'TEXT DEFAULT "No focus set"'],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
  ]);

  await ensureTableColumns(db, "Microcycle", [
    ["focus", 'TEXT DEFAULT "No focus"'],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
  ]);

  await ensureTableColumns(db, "Day", [
    ["done", "INTEGER NOT NULL DEFAULT 0"],
  ]);

  await ensureTableColumns(db, "Workout", [
    ["label", "TEXT"],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
    ["is_active", "INTEGER DEFAULT 0"],
    ["original_start_time", "INTEGER"],
    ["timer_start", "INTEGER"],
    ["elapsed_time", "INTEGER DEFAULT 0"],
  ]);

  await ensureTableColumns(db, "Exercise", [
    ["visible_columns", "TEXT"],
    ["note", "TEXT"],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
  ]);

  await ensureTableColumns(db, "Sets", [
    ["date", "TEXT"],
    ["personal_record", "INTEGER NOT NULL DEFAULT 0"],
    ["pause", "INTEGER"],
    ["rpe", "INTEGER"],
    ["weight", "INTEGER"],
    ["rm_percentage", "INTEGER"],
    ["reps", "INTEGER"],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
    ["failed", "INTEGER NOT NULL DEFAULT 0"],
    ["amrap", "INTEGER NOT NULL DEFAULT 0"],
    ["note", "TEXT"],
  ]);

  await ensureTableColumns(db, "Run", [
    ["type", "TEXT NOT NULL DEFAULT 'WORKING_SET'"],
    ["is_pause", "INTEGER NOT NULL DEFAULT 0"],
    ["distance", "INTEGER"],
    ["pace", "TEXT"],
    ["time", "INTEGER"],
    ["heartrate", "INTEGER"],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
  ]);

  await db.execAsync(`
    UPDATE Exercise
    SET sets = (
      SELECT COUNT(*)
      FROM Sets
      WHERE Sets.exercise_id = Exercise.exercise_id
    );
  `);

  await initializeWeightliftingData(db);

  /*
  await db.execAsync(`
    ALTER TABLE Workout ADD COLUMN is_active INTEGER DEFAULT 0;
  `);
  */

  /*
  await db.execAsync(`
    ALTER TABLE Exercise ADD COLUMN visible_columns TEXT;

  `);
  */

  /*
  await db.execAsync(`
    DROP TABLE IF EXISTS Run;
  `);
  /*


  //Drop all tables:
  /*
  await db.execAsync(`
    DROP TABLE IF EXISTS Program;
    DROP TABLE IF EXISTS Sets;
    DROP TABLE IF EXISTS Exercise_storage;
    DROP TABLE IF EXISTS Exercise;
    DROP TABLE IF EXISTS Workout;
    DROP TABLE IF EXISTS Day;
    DROP TABLE IF EXISTS Microcycle;
    DROP TABLE IF EXISTS Mesocycle;
  `);
  */
}

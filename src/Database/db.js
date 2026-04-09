import { programSchemaSql } from './schema/program';
import {
  initializeWeightliftingData,
  weightliftingSchemaSql,
} from './schema/weightlifting';
import { runningSchemaSql } from './schema/running';
import { locationSchemaSql } from './schema/location';

const DEFAULT_WORKOUT_TYPES = [
  ["Resistance", "Resistance"],
  ["Upperbody", "Upperbody"],
  ["Legs", "Legs"],
  ["StrengthTraining", "StrengthTraining"],
  ["Run", "Run"],
];

function quoteIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

async function ensureColumnExists(db, tableName, columnName, columnDefinition) {
  const columns = await db.getAllAsync(
    `PRAGMA table_info(${quoteIdentifier(tableName)});`
  );

  if (columns.some((column) => column.name === columnName)) {
    return;
  }

  await db.execAsync(
    `ALTER TABLE ${quoteIdentifier(tableName)} ADD COLUMN ${columnName} ${columnDefinition};`
  );
}

async function ensureTableColumns(db, tableName, columns) {
  for (const [columnName, columnDefinition] of columns) {
    await ensureColumnExists(db, tableName, columnName, columnDefinition);
  }
}

async function getTableColumns(db, tableName) {
  return db.getAllAsync(`PRAGMA table_info(${quoteIdentifier(tableName)});`);
}

function hasColumn(columns, columnName) {
  return columns.some((column) => column.name === columnName);
}

function isExerciseCatalogTable(columns) {
  return (
    (hasColumn(columns, "exercise_name") || hasColumn(columns, "name")) &&
    !hasColumn(columns, "workout_id") &&
    !hasColumn(columns, "workout_type_instance_id")
  );
}

function isExerciseInstanceTable(columns) {
  return hasColumn(columns, "workout_id") || hasColumn(columns, "workout_type_instance_id");
}

async function migrateWeightliftingTableNames(db) {
  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    const legacyExerciseColumns = await getTableColumns(db, "Exercise");
    const legacyExerciseStorageColumns = await getTableColumns(db, "Exercise_storage");
    const exerciseInstanceColumns = await getTableColumns(db, "Exercise_Instance");

    if (
      legacyExerciseColumns.length &&
      isExerciseInstanceTable(legacyExerciseColumns) &&
      !exerciseInstanceColumns.length
    ) {
      await db.execAsync(`
        ALTER TABLE Exercise RENAME TO Exercise_Instance;
      `);
    }

    const exerciseColumns = await getTableColumns(db, "Exercise");

    if (legacyExerciseStorageColumns.length) {
      if (!exerciseColumns.length) {
        await db.execAsync(`
          ALTER TABLE Exercise_storage RENAME TO Exercise;
        `);
      } else if (!isExerciseCatalogTable(exerciseColumns)) {
        throw new Error(
          "Could not rename Exercise_storage to Exercise because the Exercise table name is already occupied."
        );
      }
    }

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function migrateWorkoutTableName(db) {
  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    const legacyWorkoutColumns = await getTableColumns(db, "Workout");
    const workoutTypeInstanceColumns = await getTableColumns(
      db,
      "Workout_Type_Instance"
    );

    if (legacyWorkoutColumns.length && !workoutTypeInstanceColumns.length) {
      await db.execAsync(`
        ALTER TABLE Workout RENAME TO Workout_Type_Instance;
      `);
    }

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function migrateExerciseCatalogSchema(db) {
  const exerciseColumns = await getTableColumns(db, "Exercise");

  if (!exerciseColumns.length) {
    return;
  }

  const hasLegacyNameColumn = hasColumn(exerciseColumns, "exercise_name");
  const hasNameColumn = hasColumn(exerciseColumns, "name");
  const hasNicknameColumn = hasColumn(exerciseColumns, "nickname");

  if (
    !hasLegacyNameColumn &&
    hasNameColumn &&
    hasNicknameColumn &&
    !hasColumn(exerciseColumns, "primary_muscle_group_count") &&
    !hasColumn(exerciseColumns, "secondary_muscle_group_count")
  ) {
    return;
  }

  const nameColumn = hasNameColumn ? "name" : hasLegacyNameColumn ? "exercise_name" : null;

  if (!nameColumn) {
    return;
  }

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS Exercise_next;

      CREATE TABLE Exercise_next (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        nickname TEXT
      );

      INSERT OR IGNORE INTO Exercise_next (
        exercise_id,
        name,
        nickname
      )
      SELECT
        exercise_id,
        ${nameColumn},
        ${hasNicknameColumn ? "nickname" : "NULL"}
      FROM Exercise
      WHERE TRIM(COALESCE(${nameColumn}, '')) <> ''
      ORDER BY exercise_id ASC;

      DROP TABLE Exercise;
      ALTER TABLE Exercise_next RENAME TO Exercise;
    `);

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function migrateExerciseInstanceSchema(db) {
  const exerciseInstanceColumns = await getTableColumns(db, "Exercise_Instance");

  if (!exerciseInstanceColumns.length) {
    return;
  }

  const hasLegacyIdColumn = hasColumn(exerciseInstanceColumns, "exercise_id");
  const hasNewIdColumn = hasColumn(
    exerciseInstanceColumns,
    "exercise_instance_id"
  );
  const hasLegacyWorkoutColumn = hasColumn(
    exerciseInstanceColumns,
    "workout_id"
  );
  const hasNewWorkoutColumn = hasColumn(
    exerciseInstanceColumns,
    "workout_type_instance_id"
  );

  if (
    !hasLegacyIdColumn &&
    hasNewIdColumn &&
    !hasLegacyWorkoutColumn &&
    hasNewWorkoutColumn
  ) {
    return;
  }

  const idColumn = hasNewIdColumn
    ? "exercise_instance_id"
    : hasLegacyIdColumn
      ? "exercise_id"
      : null;
  const workoutColumn = hasNewWorkoutColumn
    ? "workout_type_instance_id"
    : hasLegacyWorkoutColumn
      ? "workout_id"
      : null;

  if (!idColumn || !workoutColumn) {
    return;
  }

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS Exercise_Instance_next;

      CREATE TABLE Exercise_Instance_next (
        exercise_instance_id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_type_instance_id INTEGER NOT NULL,
        exercise_name TEXT NOT NULL,
        sets INTEGER NOT NULL DEFAULT 0,
        visible_columns TEXT,
        note TEXT,
        done INTEGER NOT NULL DEFAULT 0
      );

      INSERT INTO Exercise_Instance_next (
        exercise_instance_id,
        workout_type_instance_id,
        exercise_name,
        sets,
        visible_columns,
        note,
        done
      )
      SELECT
        ${idColumn},
        ${workoutColumn},
        exercise_name,
        COALESCE(sets, 0),
        ${hasColumn(exerciseInstanceColumns, "visible_columns") ? "visible_columns" : "NULL"},
        ${hasColumn(exerciseInstanceColumns, "note") ? "note" : "NULL"},
        ${hasColumn(exerciseInstanceColumns, "done") ? "COALESCE(done, 0)" : "0"}
      FROM Exercise_Instance;

      DROP TABLE Exercise_Instance;
      ALTER TABLE Exercise_Instance_next RENAME TO Exercise_Instance;
    `);

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function migrateSetSchema(db) {
  const legacySetColumns = await getTableColumns(db, "Sets");
  const setColumns = await getTableColumns(db, "Set");
  const sourceTable = setColumns.length ? "Set" : legacySetColumns.length ? "Sets" : null;
  const sourceColumns = setColumns.length ? setColumns : legacySetColumns;

  if (!sourceTable || !sourceColumns.length) {
    return;
  }

  const hasLegacyExerciseColumn = hasColumn(sourceColumns, "exercise_id");
  const hasNewExerciseColumn = hasColumn(sourceColumns, "exercise_instance_id");

  if (sourceTable === "Set" && !hasLegacyExerciseColumn && hasNewExerciseColumn) {
    return;
  }

  const exerciseColumn = hasNewExerciseColumn
    ? "exercise_instance_id"
    : hasLegacyExerciseColumn
      ? "exercise_id"
      : null;

  if (!exerciseColumn) {
    return;
  }

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS "Set_next";

      CREATE TABLE "Set_next" (
        sets_id INTEGER PRIMARY KEY AUTOINCREMENT,
        set_number INTEGER NOT NULL,
        exercise_instance_id INTEGER NOT NULL,
        date TEXT,
        personal_record INTEGER NOT NULL DEFAULT 0,
        pause INTEGER,
        rpe INTEGER,
        weight INTEGER,
        rm_percentage INTEGER,
        reps INTEGER,
        done INTEGER NOT NULL DEFAULT 0,
        failed INTEGER NOT NULL DEFAULT 0,
        amrap INTEGER NOT NULL DEFAULT 0,
        note TEXT
      );

      INSERT INTO "Set_next" (
        sets_id,
        set_number,
        exercise_instance_id,
        date,
        personal_record,
        pause,
        rpe,
        weight,
        rm_percentage,
        reps,
        done,
        failed,
        amrap,
        note
      )
      SELECT
        sets_id,
        set_number,
        ${exerciseColumn},
        ${hasColumn(sourceColumns, "date") ? "date" : "NULL"},
        ${hasColumn(sourceColumns, "personal_record") ? "COALESCE(personal_record, 0)" : "0"},
        ${hasColumn(sourceColumns, "pause") ? "pause" : "NULL"},
        ${hasColumn(sourceColumns, "rpe") ? "rpe" : "NULL"},
        ${hasColumn(sourceColumns, "weight") ? "weight" : "NULL"},
        ${hasColumn(sourceColumns, "rm_percentage") ? "rm_percentage" : "NULL"},
        ${hasColumn(sourceColumns, "reps") ? "reps" : "NULL"},
        ${hasColumn(sourceColumns, "done") ? "COALESCE(done, 0)" : "0"},
        ${hasColumn(sourceColumns, "failed") ? "COALESCE(failed, 0)" : "0"},
        ${hasColumn(sourceColumns, "amrap") ? "COALESCE(amrap, 0)" : "0"},
        ${hasColumn(sourceColumns, "note") ? "note" : "NULL"}
      FROM ${quoteIdentifier(sourceTable)};

      DROP TABLE ${quoteIdentifier(sourceTable)};
      ALTER TABLE "Set_next" RENAME TO "Set";
    `);

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function migrateMicrocycleProgramIdRemoval(db) {
  const microcycleColumns = await getTableColumns(db, "Microcycle");

  if (
    !microcycleColumns.length ||
    !microcycleColumns.some((column) => column.name === "program_id")
  ) {
    return;
  }

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS Microcycle_next;

      CREATE TABLE Microcycle_next (
        microcycle_id INTEGER PRIMARY KEY AUTOINCREMENT,
        mesocycle_id INTEGER NOT NULL,
        microcycle_number INTEGER NOT NULL,
        focus TEXT DEFAULT "No focus",
        done INTEGER NOT NULL DEFAULT 0
      );

      INSERT INTO Microcycle_next (
        microcycle_id,
        mesocycle_id,
        microcycle_number,
        focus,
        done
      )
      SELECT
        microcycle_id,
        mesocycle_id,
        microcycle_number,
        focus,
        done
      FROM Microcycle;

      DROP TABLE Microcycle;
      ALTER TABLE Microcycle_next RENAME TO Microcycle;
    `);

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function backfillWorkoutTypeInstances(db) {
  await db.execAsync(`
    UPDATE Workout_Type_Instance
    SET workout_type = label
    WHERE TRIM(COALESCE(workout_type, '')) = ''
      AND TRIM(COALESCE(label, '')) <> '';

    UPDATE Workout_Type_Instance
    SET label = workout_type
    WHERE TRIM(COALESCE(label, '')) = ''
      AND TRIM(COALESCE(workout_type, '')) <> '';
  `);
}

async function initializeWorkoutTypes(db) {
  for (const [name, displayName] of DEFAULT_WORKOUT_TYPES) {
    await db.runAsync(
      `INSERT OR IGNORE INTO Workout_Type (name, display_name)
       VALUES (?, ?);`,
      [name, displayName]
    );
  }

  await db.execAsync(`
    INSERT OR IGNORE INTO Workout_Type (name, display_name)
    SELECT DISTINCT workout_type, workout_type
    FROM Workout_Type_Instance
    WHERE TRIM(COALESCE(workout_type, '')) <> '';
  `);
}

async function repairWorkoutTrackingState(db) {
  await db.execAsync(`
    UPDATE Workout_Type_Instance
    SET is_active = 0
    WHERE is_active = 1
      AND (timer_start IS NULL OR done = 1);
  `);

  const activeWorkouts = await db.getAllAsync(`
    SELECT workout_id
    FROM Workout_Type_Instance
    WHERE is_active = 1
      AND timer_start IS NOT NULL
      AND done = 0
    ORDER BY timer_start DESC, workout_id DESC;
  `);

  if (activeWorkouts.length <= 1) {
    return;
  }

  const [, ...staleWorkouts] = activeWorkouts;

  for (const staleWorkout of staleWorkouts) {
    await db.runAsync(
      `UPDATE Workout_Type_Instance
       SET is_active = 0
       WHERE workout_id = ?;`,
      [staleWorkout.workout_id]
    );
  }
}

async function repairStrengthTrainingState(db) {
  await db.execAsync(`
    UPDATE Exercise_Instance
    SET visible_columns = NULL
    WHERE TRIM(COALESCE(visible_columns, '')) IN ('', 'undefined', 'null', '[object Object]');

    UPDATE Exercise_Instance
    SET done = (
      NOT EXISTS (
        SELECT 1
        FROM "Set"
        WHERE "Set".exercise_instance_id = Exercise_Instance.exercise_instance_id
          AND "Set".done = 0
      )
    );

    UPDATE Workout_Type_Instance
    SET done = (
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM Run
          WHERE Run.workout_id = Workout_Type_Instance.workout_id
        ) THEN Workout_Type_Instance.done
        ELSE NOT EXISTS (
          SELECT 1
          FROM Exercise_Instance
          WHERE Exercise_Instance.workout_type_instance_id = Workout_Type_Instance.workout_id
            AND Exercise_Instance.done = 0
        )
      END
    )
    WHERE EXISTS (
      SELECT 1
      FROM Exercise_Instance
      WHERE Exercise_Instance.workout_type_instance_id = Workout_Type_Instance.workout_id
    );
  `);
}

async function repairRunSetState(db) {
  await db.execAsync(`
    UPDATE Run
    SET type = CASE
      WHEN type IS NULL THEN 'WORKING_SET'
      WHEN UPPER(REPLACE(REPLACE(TRIM(type), '-', '_'), ' ', '_')) IN ('WARMUP', 'WARM_UP')
        THEN 'WARMUP'
      WHEN UPPER(REPLACE(REPLACE(TRIM(type), '-', '_'), ' ', '_')) IN ('COOLDOWN', 'COOL_DOWN')
        THEN 'COOLDOWN'
      ELSE 'WORKING_SET'
    END;

    UPDATE Run
    SET done = COALESCE(done, 0),
        is_pause = COALESCE(is_pause, 0)
    WHERE done IS NULL
       OR is_pause IS NULL;
  `);
}

async function repairProgramDateFormats(db) {
  await db.execAsync(`
    UPDATE Program
    SET start_date = substr(start_date, 9, 2) || '.' || substr(start_date, 6, 2) || '.' || substr(start_date, 1, 4)
    WHERE start_date LIKE '____-__-__';
  `);
}

export async function initializeDatabase(db) {
  await migrateWeightliftingTableNames(db);
  await migrateWorkoutTableName(db);
  await migrateExerciseCatalogSchema(db);
  await migrateExerciseInstanceSchema(db);
  await migrateSetSchema(db);

  await db.execAsync(`
    ${programSchemaSql}
    ${weightliftingSchemaSql}
    ${runningSchemaSql}
    ${locationSchemaSql}

    PRAGMA journal_mode = WAL;
  `);

  await ensureTableColumns(db, "Program", [
    ["cloud_program_id", "INTEGER"],
    ["remote_local_program_id", "INTEGER"],
    ["status", "TEXT NOT NULL DEFAULT 'NOT_STARTED'"],
    ["needs_sync", "INTEGER NOT NULL DEFAULT 1"],
  ]);

  await ensureTableColumns(db, "Mesocycle", [
    ["cloud_mesocycle_id", "INTEGER"],
    ["weeks", "INTEGER NOT NULL DEFAULT 0"],
    ["focus", 'TEXT DEFAULT "No focus set"'],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
    ["needs_sync", "INTEGER NOT NULL DEFAULT 1"],
  ]);

  await ensureTableColumns(db, "Microcycle", [
    ["focus", 'TEXT DEFAULT "No focus"'],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
  ]);
  await migrateMicrocycleProgramIdRemoval(db);
  await ensureTableColumns(db, "Microcycle", [
    ["focus", 'TEXT DEFAULT "No focus"'],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
  ]);

  await ensureTableColumns(db, "Day", [
    ["done", "INTEGER NOT NULL DEFAULT 0"],
  ]);

  await ensureTableColumns(db, "Workout_Type_Instance", [
    ["workout_type", "TEXT"],
    ["label", "TEXT"],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
    ["is_active", "INTEGER DEFAULT 0"],
    ["original_start_time", "INTEGER"],
    ["timer_start", "INTEGER"],
    ["elapsed_time", "INTEGER DEFAULT 0"],
  ]);
  await ensureTableColumns(db, "Workout_Type", [
    ["display_name", "TEXT"],
  ]);
  await backfillWorkoutTypeInstances(db);
  await initializeWorkoutTypes(db);

  await ensureTableColumns(db, "Exercise", [["nickname", "TEXT"]]);

  await ensureTableColumns(db, "Exercise_Instance", [
    ["exercise_name", "TEXT NOT NULL DEFAULT ''"],
    ["sets", "INTEGER NOT NULL DEFAULT 0"],
    ["visible_columns", "TEXT"],
    ["note", "TEXT"],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
  ]);

  await ensureTableColumns(db, "Set", [
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
    UPDATE Exercise_Instance
    SET sets = (
      SELECT COUNT(*)
      FROM "Set"
      WHERE "Set".exercise_instance_id = Exercise_Instance.exercise_instance_id
    );
  `);

  await repairWorkoutTrackingState(db);
  await repairStrengthTrainingState(db);
  await repairRunSetState(db);
  await repairProgramDateFormats(db);

  await initializeWeightliftingData(db);

  /*
  await db.execAsync(`
    ALTER TABLE Workout_Type_Instance ADD COLUMN is_active INTEGER DEFAULT 0;
  `);
  */

  /*
  await db.execAsync(`
    ALTER TABLE Exercise_Instance ADD COLUMN visible_columns TEXT;

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
    DROP TABLE IF EXISTS "Set";
    DROP TABLE IF EXISTS Exercise;
    DROP TABLE IF EXISTS Exercise_Instance;
    DROP TABLE IF EXISTS Workout_Type_Instance;
    DROP TABLE IF EXISTS Day;
    DROP TABLE IF EXISTS Microcycle;
    DROP TABLE IF EXISTS Mesocycle;
  `);
  */
}

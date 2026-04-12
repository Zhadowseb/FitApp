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
        cloud_exercise_instance_id INTEGER,
        remote_local_exercise_instance_id INTEGER,
        workout_type_instance_id INTEGER NOT NULL,
        exercise_name TEXT NOT NULL,
        sets INTEGER NOT NULL DEFAULT 0,
        visible_columns TEXT,
        note TEXT,
        done INTEGER NOT NULL DEFAULT 0,
        needs_sync INTEGER NOT NULL DEFAULT 1
      );

      INSERT INTO Exercise_Instance_next (
        exercise_instance_id,
        cloud_exercise_instance_id,
        remote_local_exercise_instance_id,
        workout_type_instance_id,
        exercise_name,
        sets,
        visible_columns,
        note,
        done,
        needs_sync
      )
      SELECT
        ${idColumn},
        ${hasColumn(exerciseInstanceColumns, "cloud_exercise_instance_id") ? "cloud_exercise_instance_id" : "NULL"},
        ${hasColumn(exerciseInstanceColumns, "remote_local_exercise_instance_id") ? "remote_local_exercise_instance_id" : "NULL"},
        ${workoutColumn},
        exercise_name,
        COALESCE(sets, 0),
        ${hasColumn(exerciseInstanceColumns, "visible_columns") ? "visible_columns" : "NULL"},
        ${hasColumn(exerciseInstanceColumns, "note") ? "note" : "NULL"},
        ${hasColumn(exerciseInstanceColumns, "done") ? "COALESCE(done, 0)" : "0"},
        ${hasColumn(exerciseInstanceColumns, "needs_sync") ? "COALESCE(needs_sync, 1)" : "1"}
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
        cloud_set_id INTEGER,
        remote_local_set_id INTEGER,
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
        note TEXT,
        needs_sync INTEGER NOT NULL DEFAULT 1
      );

      INSERT INTO "Set_next" (
        sets_id,
        cloud_set_id,
        remote_local_set_id,
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
        note,
        needs_sync
      )
      SELECT
        sets_id,
        ${hasColumn(sourceColumns, "cloud_set_id") ? "cloud_set_id" : "NULL"},
        ${hasColumn(sourceColumns, "remote_local_set_id") ? "remote_local_set_id" : "NULL"},
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
        ${hasColumn(sourceColumns, "note") ? "note" : "NULL"},
        ${hasColumn(sourceColumns, "needs_sync") ? "COALESCE(needs_sync, 1)" : "1"}
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
    const hasCloudMicrocycleId = hasColumn(
      microcycleColumns,
      "cloud_microcycle_id"
    );
    const hasNeedsSync = hasColumn(microcycleColumns, "needs_sync");

    await db.execAsync(`
      DROP TABLE IF EXISTS Microcycle_next;

      CREATE TABLE Microcycle_next (
        microcycle_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloud_microcycle_id INTEGER,
        mesocycle_id INTEGER NOT NULL,
        microcycle_number INTEGER NOT NULL,
        focus TEXT DEFAULT "No focus",
        done INTEGER NOT NULL DEFAULT 0,
        needs_sync INTEGER NOT NULL DEFAULT 1
      );

      INSERT INTO Microcycle_next (
        microcycle_id,
        cloud_microcycle_id,
        mesocycle_id,
        microcycle_number,
        focus,
        done,
        needs_sync
      )
      SELECT
        microcycle_id,
        ${hasCloudMicrocycleId ? "cloud_microcycle_id" : "NULL"},
        mesocycle_id,
        microcycle_number,
        focus,
        done,
        ${hasNeedsSync ? "needs_sync" : "1"}
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

async function migrateProgramRemoteLocalIdRemoval(db) {
  const programColumns = await getTableColumns(db, "Program");

  if (!programColumns.length || !hasColumn(programColumns, "remote_local_program_id")) {
    return;
  }

  const hasCloudProgramId = hasColumn(programColumns, "cloud_program_id");
  const hasProgramName = hasColumn(programColumns, "program_name");
  const hasStartDate = hasColumn(programColumns, "start_date");
  const hasStatus = hasColumn(programColumns, "status");
  const hasNeedsSync = hasColumn(programColumns, "needs_sync");

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS Program_next;

      CREATE TABLE Program_next (
        program_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloud_program_id INTEGER,
        program_name TEXT,
        start_date TEXT NOT NULL,
        status TEXT
          DEFAULT 'NOT_STARTED'
          NOT NULL
          CHECK (status IN ('COMPLETE', 'ACTIVE', 'NOT_STARTED')),
        needs_sync INTEGER NOT NULL DEFAULT 1
      );

      INSERT INTO Program_next (
        program_id,
        cloud_program_id,
        program_name,
        start_date,
        status,
        needs_sync
      )
      SELECT
        program_id,
        ${hasCloudProgramId ? "cloud_program_id" : "NULL"},
        ${hasProgramName ? "program_name" : "NULL"},
        ${hasStartDate ? "start_date" : "''"},
        ${hasStatus ? "status" : "'NOT_STARTED'"},
        ${hasNeedsSync ? "needs_sync" : "1"}
      FROM Program;

      DROP TABLE Program;
      ALTER TABLE Program_next RENAME TO Program;
    `);

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function migrateMesocycleRemoteLocalIdRemoval(db) {
  const mesocycleColumns = await getTableColumns(db, "Mesocycle");

  if (
    !mesocycleColumns.length ||
    !hasColumn(mesocycleColumns, "remote_local_mesocycle_id")
  ) {
    return;
  }

  const hasCloudMesocycleId = hasColumn(mesocycleColumns, "cloud_mesocycle_id");
  const hasProgramId = hasColumn(mesocycleColumns, "program_id");
  const hasMesocycleNumber = hasColumn(mesocycleColumns, "mesocycle_number");
  const hasWeeks = hasColumn(mesocycleColumns, "weeks");
  const hasFocus = hasColumn(mesocycleColumns, "focus");
  const hasDone = hasColumn(mesocycleColumns, "done");

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS Mesocycle_next;

      CREATE TABLE Mesocycle_next (
        mesocycle_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloud_mesocycle_id INTEGER,
        program_id INTEGER NOT NULL,
        mesocycle_number INTEGER NOT NULL,
        weeks INTEGER NOT NULL DEFAULT 0,
        focus TEXT DEFAULT "No focus set",
        done INTEGER NOT NULL DEFAULT 0,
        needs_sync INTEGER NOT NULL DEFAULT 1
      );

      INSERT INTO Mesocycle_next (
        mesocycle_id,
        cloud_mesocycle_id,
        program_id,
        mesocycle_number,
        weeks,
        focus,
        done,
        needs_sync
      )
      SELECT
        mesocycle_id,
        ${hasCloudMesocycleId ? "cloud_mesocycle_id" : "NULL"},
        ${hasProgramId ? "program_id" : "0"},
        ${hasMesocycleNumber ? "mesocycle_number" : "0"},
        ${hasWeeks ? "weeks" : "0"},
        ${hasFocus ? "focus" : "'No focus set'"},
        ${hasDone ? "done" : "0"},
        1
      FROM Mesocycle;

      DROP TABLE Mesocycle;
      ALTER TABLE Mesocycle_next RENAME TO Mesocycle;

      UPDATE Microcycle
      SET needs_sync = 1;
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

async function restoreLocalWorkoutTypeCatalogSchema(db) {
  const workoutTypeColumns = await getTableColumns(db, "Workout_Type");

  if (!workoutTypeColumns.length) {
    return;
  }

  const hasLegacyId = hasColumn(workoutTypeColumns, "workout_type_id");
  const hasId = hasColumn(workoutTypeColumns, "id");
  const hasName = hasColumn(workoutTypeColumns, "name");
  const hasDisplayName = hasColumn(workoutTypeColumns, "display_name");

  if (hasLegacyId && hasName && hasDisplayName) {
    return;
  }

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Workout_Type_next (
        workout_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT
      );

      INSERT OR IGNORE INTO Workout_Type_next (
        workout_type_id,
        name,
        display_name
      )
      SELECT
        ${
          hasLegacyId
              ? "workout_type_id"
            : hasId
              ? "id"
              : "NULL"
        },
        name,
        ${
          hasDisplayName
            ? "COALESCE(display_name, name)"
            : "name"
        }
      FROM Workout_Type
      WHERE TRIM(COALESCE(name, '')) <> '';

      DROP TABLE Workout_Type;
      ALTER TABLE Workout_Type_next RENAME TO Workout_Type;
    `);

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
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

async function migrateWorkoutTypeInstanceDeleteQueueSchema(db) {
  const queueColumns = await getTableColumns(db, "Workout_Type_Instance_Sync_Delete");

  if (!queueColumns.length) {
    return;
  }

  const hasCloudId = hasColumn(queueColumns, "cloud_workout_type_instance_id");
  const hasRemoteLocalId = hasColumn(
    queueColumns,
    "remote_local_workout_type_instance_id"
  );
  const cloudIdColumn = queueColumns.find(
    (column) => column.name === "cloud_workout_type_instance_id"
  );
  const cloudIdIsRequired = Number(cloudIdColumn?.notnull ?? 0) === 1;

  if (hasCloudId && hasRemoteLocalId && !cloudIdIsRequired) {
    return;
  }

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Workout_Type_Instance_Sync_Delete_next (
        workout_type_instance_sync_delete_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloud_workout_type_instance_id INTEGER UNIQUE,
        remote_local_workout_type_instance_id INTEGER UNIQUE,
        deleted_at TEXT
      );

      INSERT OR IGNORE INTO Workout_Type_Instance_Sync_Delete_next (
        workout_type_instance_sync_delete_id,
        cloud_workout_type_instance_id,
        remote_local_workout_type_instance_id,
        deleted_at
      )
      SELECT
        workout_type_instance_sync_delete_id,
        ${
          hasCloudId ? "cloud_workout_type_instance_id" : "NULL"
        },
        ${
          hasRemoteLocalId ? "remote_local_workout_type_instance_id" : "NULL"
        },
        deleted_at
      FROM Workout_Type_Instance_Sync_Delete;

      DROP TABLE Workout_Type_Instance_Sync_Delete;
      ALTER TABLE Workout_Type_Instance_Sync_Delete_next RENAME TO Workout_Type_Instance_Sync_Delete;
    `);

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function migrateExerciseInstanceDeleteQueueSchema(db) {
  const queueColumns = await getTableColumns(db, "Exercise_Instance_Sync_Delete");

  if (!queueColumns.length) {
    return;
  }

  const hasCloudId = hasColumn(queueColumns, "cloud_exercise_instance_id");
  const hasRemoteLocalId = hasColumn(
    queueColumns,
    "remote_local_exercise_instance_id"
  );
  const cloudIdColumn = queueColumns.find(
    (column) => column.name === "cloud_exercise_instance_id"
  );
  const cloudIdIsRequired = Number(cloudIdColumn?.notnull ?? 0) === 1;

  if (hasCloudId && hasRemoteLocalId && !cloudIdIsRequired) {
    return;
  }

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Exercise_Instance_Sync_Delete_next (
        exercise_instance_sync_delete_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloud_exercise_instance_id INTEGER UNIQUE,
        remote_local_exercise_instance_id INTEGER UNIQUE,
        deleted_at TEXT
      );

      INSERT OR IGNORE INTO Exercise_Instance_Sync_Delete_next (
        exercise_instance_sync_delete_id,
        cloud_exercise_instance_id,
        remote_local_exercise_instance_id,
        deleted_at
      )
      SELECT
        exercise_instance_sync_delete_id,
        ${hasCloudId ? "cloud_exercise_instance_id" : "NULL"},
        ${hasRemoteLocalId ? "remote_local_exercise_instance_id" : "NULL"},
        deleted_at
      FROM Exercise_Instance_Sync_Delete;

      DROP TABLE Exercise_Instance_Sync_Delete;
      ALTER TABLE Exercise_Instance_Sync_Delete_next RENAME TO Exercise_Instance_Sync_Delete;
    `);

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function migrateSetDeleteQueueSchema(db) {
  const queueColumns = await getTableColumns(db, "Set_Sync_Delete");

  if (!queueColumns.length) {
    return;
  }

  const hasCloudId = hasColumn(queueColumns, "cloud_set_id");
  const hasRemoteLocalId = hasColumn(queueColumns, "remote_local_set_id");
  const cloudIdColumn = queueColumns.find(
    (column) => column.name === "cloud_set_id"
  );
  const cloudIdIsRequired = Number(cloudIdColumn?.notnull ?? 0) === 1;

  if (hasCloudId && hasRemoteLocalId && !cloudIdIsRequired) {
    return;
  }

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Set_Sync_Delete_next (
        set_sync_delete_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloud_set_id INTEGER UNIQUE,
        remote_local_set_id INTEGER UNIQUE,
        deleted_at TEXT
      );

      INSERT OR IGNORE INTO Set_Sync_Delete_next (
        set_sync_delete_id,
        cloud_set_id,
        remote_local_set_id,
        deleted_at
      )
      SELECT
        set_sync_delete_id,
        ${hasCloudId ? "cloud_set_id" : "NULL"},
        ${hasRemoteLocalId ? "remote_local_set_id" : "NULL"},
        deleted_at
      FROM Set_Sync_Delete;

      DROP TABLE Set_Sync_Delete;
      ALTER TABLE Set_Sync_Delete_next RENAME TO Set_Sync_Delete;
    `);

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function getAppMetadataValue(db, metadataKey) {
  const row = await db.getFirstAsync(
    `SELECT metadata_value
     FROM App_Metadata
     WHERE metadata_key = ?;`,
    [metadataKey]
  );

  return row?.metadata_value ?? null;
}

async function setAppMetadataValue(db, metadataKey, metadataValue) {
  await db.runAsync(
    `INSERT INTO App_Metadata (metadata_key, metadata_value)
     VALUES (?, ?)
     ON CONFLICT(metadata_key)
     DO UPDATE SET metadata_value = excluded.metadata_value;`,
    [metadataKey, metadataValue]
  );
}

async function repairCloudParentForeignKeySyncState(db) {
  const metadataKey = "cloud_parent_fk_resync_v1";
  const alreadyApplied = await getAppMetadataValue(db, metadataKey);

  if (alreadyApplied === "done") {
    return;
  }

  await db.execAsync("BEGIN IMMEDIATE;");

  try {
    await db.execAsync(`
      UPDATE Program
      SET cloud_program_id = NULL,
          needs_sync = 1
      WHERE cloud_program_id IS NOT NULL;

      UPDATE Mesocycle
      SET cloud_mesocycle_id = NULL,
          needs_sync = 1
      WHERE cloud_mesocycle_id IS NOT NULL;

      UPDATE Microcycle
      SET cloud_microcycle_id = NULL,
          needs_sync = 1
      WHERE cloud_microcycle_id IS NOT NULL;
    `);

    await setAppMetadataValue(db, metadataKey, "done");
    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
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
    ["remote_local_mesocycle_id", "INTEGER"],
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
    ["cloud_microcycle_id", "INTEGER"],
    ["focus", 'TEXT DEFAULT "No focus"'],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
    ["needs_sync", "INTEGER NOT NULL DEFAULT 1"],
  ]);

  await db.execAsync(`
    UPDATE Program
    SET remote_local_program_id = COALESCE(remote_local_program_id, program_id)
    WHERE remote_local_program_id IS NULL;

    UPDATE Mesocycle
    SET remote_local_mesocycle_id = COALESCE(remote_local_mesocycle_id, mesocycle_id)
    WHERE remote_local_mesocycle_id IS NULL;
  `);

  await ensureTableColumns(db, "Day", [
    ["cloud_day_id", "INTEGER"],
    ["remote_local_day_id", "INTEGER"],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
    ["needs_sync", "INTEGER NOT NULL DEFAULT 1"],
  ]);

  await db.execAsync(`
    UPDATE Day
    SET remote_local_day_id = COALESCE(remote_local_day_id, day_id)
    WHERE remote_local_day_id IS NULL;
  `);

  await ensureTableColumns(db, "Workout_Type_Instance", [
    ["cloud_workout_type_instance_id", "INTEGER"],
    ["remote_local_workout_type_instance_id", "INTEGER"],
    ["workout_type", "TEXT"],
    ["label", "TEXT"],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
    ["needs_sync", "INTEGER NOT NULL DEFAULT 1"],
    ["is_active", "INTEGER DEFAULT 0"],
    ["original_start_time", "INTEGER"],
    ["timer_start", "INTEGER"],
    ["elapsed_time", "INTEGER DEFAULT 0"],
  ]);
  await restoreLocalWorkoutTypeCatalogSchema(db);
  await ensureTableColumns(db, "Workout_Type", [
    ["display_name", "TEXT"],
  ]);
  await migrateWorkoutTypeInstanceDeleteQueueSchema(db);
  await db.execAsync(`
    UPDATE Workout_Type_Instance
    SET remote_local_workout_type_instance_id = COALESCE(remote_local_workout_type_instance_id, workout_id)
    WHERE remote_local_workout_type_instance_id IS NULL;
  `);
  await backfillWorkoutTypeInstances(db);
  await initializeWorkoutTypes(db);

  await ensureTableColumns(db, "Exercise", [["nickname", "TEXT"]]);

  await ensureTableColumns(db, "Exercise_Instance", [
    ["cloud_exercise_instance_id", "INTEGER"],
    ["remote_local_exercise_instance_id", "INTEGER"],
    ["exercise_name", "TEXT NOT NULL DEFAULT ''"],
    ["sets", "INTEGER NOT NULL DEFAULT 0"],
    ["visible_columns", "TEXT"],
    ["note", "TEXT"],
    ["done", "INTEGER NOT NULL DEFAULT 0"],
    ["needs_sync", "INTEGER NOT NULL DEFAULT 1"],
  ]);
  await migrateExerciseInstanceDeleteQueueSchema(db);
  await db.execAsync(`
    UPDATE Exercise_Instance
    SET remote_local_exercise_instance_id = COALESCE(
      remote_local_exercise_instance_id,
      exercise_instance_id
    )
    WHERE remote_local_exercise_instance_id IS NULL;

    UPDATE Exercise_Instance
    SET needs_sync = COALESCE(needs_sync, 1)
    WHERE needs_sync IS NULL;
  `);

  await ensureTableColumns(db, "Set", [
    ["cloud_set_id", "INTEGER"],
    ["remote_local_set_id", "INTEGER"],
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
    ["needs_sync", "INTEGER NOT NULL DEFAULT 1"],
  ]);
  await migrateSetDeleteQueueSchema(db);
  await db.execAsync(`
    UPDATE "Set"
    SET remote_local_set_id = COALESCE(remote_local_set_id, sets_id)
    WHERE remote_local_set_id IS NULL;

    UPDATE "Set"
    SET needs_sync = COALESCE(needs_sync, 1)
    WHERE needs_sync IS NULL;
  `);

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
  await repairCloudParentForeignKeySyncState(db);

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


export async function initializeDatabase(db) {
  await db.execAsync(`
    
    CREATE TABLE IF NOT EXISTS Exercise_storage (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_name TEXT NOT NULL
    );

    /* ============================= */
    /* ============================= */
    /* ===== Program Structure ===== */
    /* ============================= */
    /* ============================= */

    CREATE TABLE IF NOT EXISTS Program (
      program_id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_name TEXT,
      start_date TEXT NOT NULL,
      status TEXT 
        DEFAULT 'NOT_STARTED'
        NOT NULL 
        CHECK (status IN ('COMPLETE', 'ACTIVE', 'NOT_STARTED'))
    );

    CREATE TABLE IF NOT EXISTS Mesocycle(
        mesocycle_id INTEGER PRIMARY KEY AUTOINCREMENT,
        program_id INTEGER NOT NULL,
        mesocycle_number INTEGER NOT NULL,
        weeks INTEGER NOT NULL DEFAULT 0,
        focus TEXT DEFAULT "No focus set",
        done INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Microcycle(
        microcycle_id INTEGER PRIMARY KEY AUTOINCREMENT,
        mesocycle_id INTEGER NOT NULL,
        program_id INTEGER NOT NULL,
        microcycle_number INTEGER NOT NULL,
        focus TEXT DEFAULT "No focus",
        done INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Day (
        day_id INTEGER PRIMARY KEY AUTOINCREMENT,
        microcycle_id INTEGER NOT NULL,
        program_id INTEGER NOT NULL,
        Weekday TEXT NOT NULL,
        date TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Workout (
        workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        label TEXT, 
        done INTEGER NOT NULL DEFAULT 0,
        start_ts INTEGER NOT NULL DEFAULT 0,
        duration_seconds INTEGER NOT NULL DEFAULT 0
    );

    /* ============================= */
    /* ============================= */
    /* ===== Weightlifting ========= */
    /* ============================= */
    /* ============================= */

    CREATE TABLE IF NOT EXISTS Exercise (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        exercise_name TEXT NOT NULL,
        sets INTEGER NOT NULL,

        done INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Sets (
        sets_id INTEGER PRIMARY KEY AUTOINCREMENT,
        set_number INTEGER NOT NULL,
        exercise_id TEXT NOT NULL,
        date TEXT,

        personal_record INTEGER NOT NULL DEFAULT 0,
        
        pause INTEGER,
        rpe INTEGER,
        weight INTEGER,
        reps INTEGER,

        done INTEGER NOT NULL DEFAULT 0,
        failed INTEGER NOT NULL DEFAULT 0,
        note TEXT
    );

    CREATE TABLE IF NOT EXISTS Estimated_Set (
        estimated_set_id INTEGER PRIMARY KEY AUTOINCREMENT,
        program_id INTEGER NOT NULL,
        exercise_name TEXT NOT NULL,
        estimated_weight INTEGER NOT NULL DEFAULT 0
    );
  
    /* ============================= */
    /* ============================= */
    /* =========== Running ========= */
    /* ============================= */
    /* ============================= */

    CREATE TABLE IF NOT EXISTS Run (
        Run_id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        type TEXT 
          DEFAULT 'WORKING_SET'
          NOT NULL 
          CHECK (type IN ('WARMUP', 'WORKING_SET', 'COOLDOWN')),
        
        set_number INTEGER NOT NULL,
        is_pause INTEGER NOT NULL DEFAULT 0,
        distance INTEGER,
        pace TEXT,
        time INTEGER,
        heartrate INTEGER,

        done INTEGER NOT NULL DEFAULT 0
    );


    PRAGMA journal_mode = WAL;

    `
  );

  const standard_exercises = [
    'Squat',
    'Bench Press',
    'Deadlift',
    'Overhead Press',
    'Barbell Row',
    'Pull-Up',
    'Dip'
  ];

  const check_exercises_init = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM Exercise_storage;`
  );

  if (check_exercises_init.count === 0){
    const placeholders = standard_exercises.map(() => "(?)").join(", ");
    await db.runAsync(
      `INSERT INTO Exercise_storage (exercise_name) VALUES ${placeholders};`,
      standard_exercises
    );
  }

  /*
  await db.execAsync(`
    ALTER TABLE Workout ADD COLUMN duration_seconds INTEGER;
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

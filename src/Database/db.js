
export async function initializeDatabase(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Program (
      program_id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_name TEXT,
      start_date DATE,
      end_date DATE,
      status TEXT 
        DEFAULT 'NOT_STARTED'
        NOT NULL 
        CHECK (status IN ('COMPLETE', 'ACTIVE', 'NOT_STARTED'))
    );

    CREATE TABLE IF NOT EXISTS Sets (
        sets_id INTEGER PRIMARY KEY AUTOINCREMENT,
        set_number INTEGER NOT NULL,
        date TEXT,

        personal_record INTEGER NOT NULL DEFAULT 0,
        
        exercise_id TEXT NOT NULL,
        pause INTEGER,
        rpe INTEGER,
        weight INTEGER,
        reps INTEGER,

        done INTEGER NOT NULL DEFAULT 0,
        failed INTEGER NOT NULL DEFAULT 0,
        note TEXT
    );

    CREATE TABLE IF NOT EXISTS Exercise_storage (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_name TEXT NOT NULL
    );
        
    CREATE TABLE IF NOT EXISTS Exercise (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        exercise_name TEXT NOT NULL,
        sets INTEGER NOT NULL,

        done INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Workout (
        workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS Day (
        day_id INTEGER PRIMARY KEY AUTOINCREMENT,
        Weekday TEXT NOT NULL,
        date TEXT NOT NULL
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
    DROP TABLE IF EXISTS Workout;
  `);
  */

  //Drop all tables:
  /*
  await db.execAsync(`
    DROP TABLE IF EXISTS Program;
    DROP TABLE IF EXISTS Sets;
    DROP TABLE IF EXISTS Exercise_storage;
    DROP TABLE IF EXISTS Exercise;
    DROP TABLE IF EXISTS Workout;
    DROP TABLE IF EXISTS Day;
  `);
  */
}

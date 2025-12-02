
export async function initializeDatabase(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone_number TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Sets (
        sets_id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        personal_record INTEGER NOT NULL DEFAULT 0,
        exercise_id TEXT NOT NULL,
        rpe INTEGER,
        weight INTEGER,
        reps INTEGER
    );

    CREATE TABLE IF NOT EXISTS Exercise_storage (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_name TEXT NOT NULL
    );
        
    CREATE TABLE IF NOT EXISTS Exercise (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_name TEXT NOT NULL,
        sets INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Workout (
        workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL
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

  if (!check_exercises_init || check_exercises_init.count === 0) {
    for(const name of standard_exercises){
      await db.runAsync(
        `INSERT INTO Exercise_storage (exercise_name) VALUES (?);`,
        [name]);
    }
  }

}

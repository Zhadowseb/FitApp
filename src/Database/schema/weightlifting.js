export const weightliftingSchemaSql = `

  CREATE TABLE IF NOT EXISTS Exercise_storage (
      exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Exercise (
      exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      sets INTEGER NOT NULL,
      visible_columns TEXT,
      note TEXT,

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
      rm_percentage INTEGER,
      reps INTEGER,

      done INTEGER NOT NULL DEFAULT 0,
      failed INTEGER NOT NULL DEFAULT 0,
      amrap INTEGER NOT NULL DEFAULT 0,
      note TEXT
  );

  CREATE TABLE IF NOT EXISTS Estimated_Set (
      estimated_set_id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      estimated_weight INTEGER NOT NULL DEFAULT 0
  );
`;

export async function initializeWeightliftingData(db) {
  const standardExercises = [
    'Squat',
    'Bench Press',
    'Deadlift',
    'Overhead Press',
    'Barbell Row',
    'Pull-Up',
    'Dip',
  ];

  const checkExercisesInit = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM Exercise_storage;`
  );

  if (checkExercisesInit.count === 0) {
    const placeholders = standardExercises.map(() => '(?)').join(', ');
    await db.runAsync(
      `INSERT INTO Exercise_storage (exercise_name) VALUES ${placeholders};`,
      standardExercises
    );
  }
}

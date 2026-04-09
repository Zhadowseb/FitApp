export const weightliftingSchemaSql = `

  CREATE TABLE IF NOT EXISTS Exercise (
      exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      nickname TEXT
  );

  CREATE TABLE IF NOT EXISTS Exercise_Instance (
      exercise_instance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_type_instance_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      sets INTEGER NOT NULL DEFAULT 0,
      visible_columns TEXT,
      note TEXT,

      done INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS "Set" (
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

  CREATE TABLE IF NOT EXISTS Estimated_Set (
      estimated_set_id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      estimated_weight INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS RMWeightProgression (
      rm_weight_progression_id INTEGER PRIMARY KEY AUTOINCREMENT,
      mesocycle_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      progression_weight REAL NOT NULL DEFAULT 0,

      UNIQUE(mesocycle_id, exercise_name)
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
    `SELECT COUNT(*) as count FROM Exercise;`
  );

  if (checkExercisesInit.count === 0) {
    const placeholders = standardExercises.map(() => '(?)').join(', ');
    await db.runAsync(
      `INSERT INTO Exercise (name) VALUES ${placeholders};`,
      standardExercises
    );
  }
}

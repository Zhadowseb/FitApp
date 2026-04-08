export const programSchemaSql = `

  CREATE TABLE IF NOT EXISTS Program (
    program_id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_name TEXT,
    start_date TEXT NOT NULL,
    status TEXT
      DEFAULT 'NOT_STARTED'
      NOT NULL
      CHECK (status IN ('COMPLETE', 'ACTIVE', 'NOT_STARTED'))
  );

  CREATE TABLE IF NOT EXISTS Program_Best_Exercise (
    program_best_exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    is_selected INTEGER NOT NULL DEFAULT 1,

    UNIQUE(program_id, exercise_name)
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

      /*======Workout Timer=======*/
      is_active INTEGER DEFAULT 0,
      original_start_time INTEGER,
      timer_start INTEGER,
      elapsed_time INTEGER DEFAULT 0
  );
`;

import { programSchemaSql } from './schema/program';
import {
  initializeWeightliftingData,
  weightliftingSchemaSql,
} from './schema/weightlifting';
import { runningSchemaSql } from './schema/running';
import { locationSchemaSql } from './schema/location';

export async function initializeDatabase(db) {
  await db.execAsync(`
    ${programSchemaSql}
    ${weightliftingSchemaSql}
    ${runningSchemaSql}
    ${locationSchemaSql}

    PRAGMA journal_mode = WAL;
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

export const locationSchemaSql = `

  CREATE TABLE IF NOT EXISTS LocationLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER,
    latitude REAL,
    longitude REAL,
    accuracy REAL,
    timestamp INTEGER
  );
`;

export async function initDay ({db, microcycle_id, program_id, day, program_day}) {
    try {
        await db.runAsync(
            `INSERT INTO Day (microcycle_id, program_id, Weekday, date, done)
            SELECT ?, ?, ?, ?, 0
            WHERE NOT EXISTS (SELECT 1 FROM Day WHERE date = ?);`,
            [microcycle_id, program_id, day, program_day, program_day]
        );
    } catch (err) {
        console.error("Error ensuring Day exists:", err);
    }
}
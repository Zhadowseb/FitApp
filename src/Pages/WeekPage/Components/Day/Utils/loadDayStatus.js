export async function loadWorkoutCount ({program_day}) {

    const count_row = await db.getFirstAsync(
        `SELECT COUNT(*) AS workout_count FROM Workout WHERE date = ?;`,
            [program_day]
    );

    const count = count_row?.workout_count ?? 0;

    return {count};
}

export async function loadDayStatus ({program_day}) {

    const day_row = await db.getFirstAsync(
        `SELECT done FROM Day WHERE date = ?`,
        [program_day]
    );

    const done = day_row?.done === 1;

    return {done};
}

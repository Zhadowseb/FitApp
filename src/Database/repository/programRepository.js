import { formatDate, parseCustomDate } from "../../Utils/dateUtils";
import { withTransaction } from "./shared";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

async function refreshHierarchyCompletionByIds(
  db,
  { dayId, microcycleId, mesocycleId }
) {
  if (dayId) {
    await db.runAsync(
      `UPDATE Day
       SET done = (
         NOT EXISTS (
           SELECT 1
           FROM Workout
           WHERE Workout.day_id = Day.day_id
             AND Workout.done = 0
         )
       )
       WHERE day_id = ?;`,
      [dayId]
    );
  }

  if (microcycleId) {
    await db.runAsync(
      `UPDATE Microcycle
       SET done = (
         NOT EXISTS (
           SELECT 1
           FROM Workout
           JOIN Day ON Day.day_id = Workout.day_id
           WHERE Day.microcycle_id = Microcycle.microcycle_id
             AND Workout.done = 0
         )
       )
       WHERE microcycle_id = ?;`,
      [microcycleId]
    );
  }

  if (mesocycleId) {
    await db.runAsync(
      `UPDATE Mesocycle
       SET done = (
         NOT EXISTS (
           SELECT 1
           FROM Microcycle
           WHERE Microcycle.mesocycle_id = Mesocycle.mesocycle_id
             AND Microcycle.done = 0
         )
       )
       WHERE mesocycle_id = ?;`,
      [mesocycleId]
    );
  }
}

async function cloneWorkoutContents(db, { sourceWorkoutId, targetWorkoutId }) {
  const exercises = await db.getAllAsync(
    `SELECT *
     FROM Exercise
     WHERE workout_id = ?;`,
    [sourceWorkoutId]
  );

  for (const exercise of exercises) {
    const exerciseResult = await db.runAsync(
      `INSERT INTO Exercise (
        workout_id,
        exercise_name,
        sets,
        visible_columns,
        done
      ) VALUES (?, ?, ?, ?, 0);`,
      [
        targetWorkoutId,
        exercise.exercise_name,
        exercise.sets,
        exercise.visible_columns,
      ]
    );

    const sets = await db.getAllAsync(
      `SELECT *
       FROM Sets
       WHERE exercise_id = ?;`,
      [exercise.exercise_id]
    );

    for (const set of sets) {
      await db.runAsync(
        `INSERT INTO Sets (
          set_number,
          exercise_id,
          date,
          personal_record,
          pause,
          rpe,
          weight,
          reps,
          done,
          failed,
          note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?);`,
        [
          set.set_number,
          exerciseResult.lastInsertRowId,
          set.date,
          set.personal_record,
          set.pause,
          set.rpe,
          set.weight,
          set.reps,
          set.note,
        ]
      );
    }
  }

  const runSets = await db.getAllAsync(
    `SELECT *
     FROM Run
     WHERE workout_id = ?
     ORDER BY
       CASE type
         WHEN 'WARMUP' THEN 1
         WHEN 'WORKING_SET' THEN 2
         WHEN 'COOLDOWN' THEN 3
       END,
       set_number ASC;`,
    [sourceWorkoutId]
  );

  for (const runSet of runSets) {
    await db.runAsync(
      `INSERT INTO Run (
        workout_id,
        type,
        set_number,
        is_pause,
        distance,
        pace,
        time,
        heartrate,
        done
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        targetWorkoutId,
        runSet.type,
        runSet.set_number,
        runSet.is_pause,
        runSet.distance,
        runSet.pace,
        runSet.time,
        runSet.heartrate,
      ]
    );
  }
}

export async function createProgram(db, { programName, startDate, status }) {
  await db.runAsync(
    `INSERT INTO Program (program_name, start_date, status)
     VALUES (?, ?, ?);`,
    [programName, startDate, status]
  );
}

export async function getProgramsOverview(db) {
  return db.getAllAsync(
    `SELECT
        p.program_id,
        p.program_name,
        p.start_date,
        p.status,
        COALESCE(mesocycles.mesocycle_count, 0) AS mesocycle_count,
        COALESCE(microcycles.week_count, 0) AS week_count,
        COALESCE(days.day_count, 0) AS day_count,
        COALESCE(workouts.workout_count, 0) AS workout_count
     FROM Program p
     LEFT JOIN (
        SELECT
          program_id,
          COUNT(*) AS mesocycle_count
        FROM Mesocycle
        GROUP BY program_id
     ) mesocycles
       ON mesocycles.program_id = p.program_id
     LEFT JOIN (
        SELECT
          program_id,
          COUNT(*) AS week_count
        FROM Microcycle
        GROUP BY program_id
     ) microcycles
       ON microcycles.program_id = p.program_id
     LEFT JOIN (
        SELECT
          program_id,
          COUNT(*) AS day_count
        FROM Day
        GROUP BY program_id
     ) days
       ON days.program_id = p.program_id
     LEFT JOIN (
        SELECT
          d.program_id,
          COUNT(w.workout_id) AS workout_count
        FROM Day d
        LEFT JOIN Workout w
          ON w.day_id = d.day_id
        GROUP BY d.program_id
     ) workouts
       ON workouts.program_id = p.program_id
     ORDER BY p.start_date DESC, p.program_id DESC;`
  );
}

export async function getProgramStatus(db, programId) {
  return db.getFirstAsync(
    `SELECT status
     FROM Program
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function getProgramName(db, programId) {
  return db.getFirstAsync(
    `SELECT program_name
     FROM Program
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function updateProgramStatus(db, { programId, status }) {
  await db.runAsync(
    `UPDATE Program
     SET status = ?
     WHERE program_id = ?;`,
    [status, programId]
  );
}

export async function updateProgramName(db, { programId, programName }) {
  await db.runAsync(
    `UPDATE Program
     SET program_name = ?
     WHERE program_id = ?;`,
    [programName, programId]
  );
}

export async function getProgramDayCount(db, programId) {
  return db.getFirstAsync(
    `SELECT COUNT(*) AS total_days
     FROM Day
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function getTodayProgramSnapshot(db, { programId, date }) {
  const day = await db.getFirstAsync(
    `SELECT day_id, Weekday
     FROM Day
     WHERE program_id = ?
       AND date = ?;`,
    [programId, date]
  );

  if (!day) {
    return null;
  }

  const workouts = await db.getAllAsync(
    `SELECT workout_id, label
     FROM Workout
     WHERE day_id = ?;`,
    [day.day_id]
  );

  const sets = await db.getAllAsync(
    `SELECT s.done
     FROM Sets s
     JOIN Exercise e ON e.exercise_id = s.exercise_id
     JOIN Workout w ON w.workout_id = e.workout_id
     WHERE w.day_id = ?;`,
    [day.day_id]
  );

  return {
    day,
    workouts,
    counts: {
      total: sets.length,
      done: sets.filter((set) => set.done === 1).length,
    },
  };
}

export async function deleteProgram(db, programId) {
  await withTransaction(db, async () => {
    await db.runAsync(
      `DELETE FROM Sets
       WHERE exercise_id IN (
         SELECT e.exercise_id
         FROM Exercise e
         JOIN Workout w ON w.workout_id = e.workout_id
         JOIN Day d ON d.day_id = w.day_id
         JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
         JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
         WHERE m.program_id = ?
       );`,
      [programId]
    );

    await db.runAsync(
      `DELETE FROM Exercise
       WHERE workout_id IN (
         SELECT w.workout_id
         FROM Workout w
         JOIN Day d ON d.day_id = w.day_id
         JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
         JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
         WHERE m.program_id = ?
       );`,
      [programId]
    );

    await db.runAsync(
      `DELETE FROM Run
       WHERE workout_id IN (
         SELECT w.workout_id
         FROM Workout w
         JOIN Day d ON d.day_id = w.day_id
         JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
         JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
         WHERE m.program_id = ?
       );`,
      [programId]
    );

    await db.runAsync(
      `DELETE FROM Workout
       WHERE day_id IN (
         SELECT d.day_id
         FROM Day d
         JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
         JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
         WHERE m.program_id = ?
       );`,
      [programId]
    );

    await db.runAsync(
      `DELETE FROM Day
       WHERE microcycle_id IN (
         SELECT mc.microcycle_id
         FROM Microcycle mc
         JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
         WHERE m.program_id = ?
       );`,
      [programId]
    );

    await db.runAsync(
      `DELETE FROM Microcycle
       WHERE mesocycle_id IN (
         SELECT mesocycle_id
         FROM Mesocycle
         WHERE program_id = ?
       );`,
      [programId]
    );

    await db.runAsync(
      `DELETE FROM Estimated_Set
       WHERE program_id = ?;`,
      [programId]
    );

    await db.runAsync(
      `DELETE FROM Mesocycle
       WHERE program_id = ?;`,
      [programId]
    );

    await db.runAsync(
      `DELETE FROM Program
       WHERE program_id = ?;`,
      [programId]
    );
  });
}

export async function createMesocycle(
  db,
  { programId, startDate, weeks, focus }
) {
  return withTransaction(db, async () => {
    const mesocycleCount = await db.getFirstAsync(
      `SELECT COUNT(*) AS count
       FROM Mesocycle
       WHERE program_id = ?;`,
      [programId]
    );

    const weekCount = await db.getFirstAsync(
      `SELECT COUNT(*) AS count
       FROM Microcycle
       WHERE program_id = ?;`,
      [programId]
    );

    const mesocycleResult = await db.runAsync(
      `INSERT INTO Mesocycle (program_id, mesocycle_number, weeks, focus)
       VALUES (?, ?, ?, ?);`,
      [programId, (mesocycleCount?.count ?? 0) + 1, weeks, focus]
    );

    for (let week = 1; week <= weeks; week += 1) {
      const microcycleResult = await db.runAsync(
        `INSERT INTO Microcycle (mesocycle_id, program_id, microcycle_number)
         VALUES (?, ?, ?);`,
        [mesocycleResult.lastInsertRowId, programId, week]
      );

      for (let dayIndex = 0; dayIndex < WEEK_DAYS.length; dayIndex += 1) {
        const currentDay =
          (weekCount?.count ?? 0) * 7 +
          (week * 7 - 7) +
          dayIndex;

        const date = parseCustomDate(startDate);
        date.setDate(date.getDate() + currentDay);

        await db.runAsync(
          `INSERT INTO Day (microcycle_id, program_id, Weekday, date)
           VALUES (?, ?, ?, ?);`,
          [
            microcycleResult.lastInsertRowId,
            programId,
            WEEK_DAYS[dayIndex],
            formatDate(date),
          ]
        );
      }
    }

    return mesocycleResult.lastInsertRowId;
  });
}

export async function getMesocyclesByProgram(db, programId) {
  return db.getAllAsync(
    `SELECT mesocycle_id, mesocycle_number, weeks, focus, done
     FROM Mesocycle
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function getMesocycleWorkoutCountsByProgram(db, programId) {
  return db.getAllAsync(
    `SELECT m.mesocycle_id, COUNT(w.workout_id) AS workout_count
     FROM Mesocycle m
     LEFT JOIN Microcycle mc ON mc.mesocycle_id = m.mesocycle_id
     LEFT JOIN Day d ON d.microcycle_id = mc.microcycle_id
     LEFT JOIN Workout w ON w.day_id = d.day_id
     WHERE m.program_id = ?
     GROUP BY m.mesocycle_id;`,
    [programId]
  );
}

export async function updateMesocycleFocus(db, { mesocycleId, focus }) {
  await db.runAsync(
    `UPDATE Mesocycle
     SET focus = ?
     WHERE mesocycle_id = ?;`,
    [focus, mesocycleId]
  );
}

export async function addWeekToMesocycle(db, { mesocycleId, programId }) {
  return withTransaction(db, async () => {
    const weeks = await db.getAllAsync(
      `SELECT microcycle_id, microcycle_number
       FROM Microcycle
       WHERE mesocycle_id = ?;`,
      [mesocycleId]
    );

    const lastWeek = weeks[weeks.length - 1];
    const lastDay = await db.getFirstAsync(
      `SELECT date
       FROM Day
       WHERE microcycle_id = ?
         AND Weekday = 'Sunday';`,
      [lastWeek.microcycle_id]
    );

    const microcycleResult = await db.runAsync(
      `INSERT INTO Microcycle (mesocycle_id, program_id, microcycle_number)
       VALUES (?, ?, ?);`,
      [mesocycleId, programId, weeks.length + 1]
    );

    for (let dayIndex = 0; dayIndex < WEEK_DAYS.length; dayIndex += 1) {
      const date = parseCustomDate(lastDay.date);
      date.setDate(date.getDate() + dayIndex + 1);

      await db.runAsync(
        `INSERT INTO Day (microcycle_id, program_id, Weekday, date)
         VALUES (?, ?, ?, ?);`,
        [
          microcycleResult.lastInsertRowId,
          programId,
          WEEK_DAYS[dayIndex],
          formatDate(date),
        ]
      );
    }

    await db.runAsync(
      `UPDATE Mesocycle
       SET weeks = weeks + 1
       WHERE mesocycle_id = ?;`,
      [mesocycleId]
    );

    return microcycleResult.lastInsertRowId;
  });
}

export async function deleteMesocycle(db, mesocycleId) {
  await withTransaction(db, async () => {
    await db.runAsync(
      `DELETE FROM Sets
       WHERE exercise_id IN (
         SELECT e.exercise_id
         FROM Exercise e
         JOIN Workout w ON w.workout_id = e.workout_id
         JOIN Day d ON d.day_id = w.day_id
         JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
         WHERE mc.mesocycle_id = ?
       );`,
      [mesocycleId]
    );

    await db.runAsync(
      `DELETE FROM Exercise
       WHERE workout_id IN (
         SELECT w.workout_id
         FROM Workout w
         JOIN Day d ON d.day_id = w.day_id
         JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
         WHERE mc.mesocycle_id = ?
       );`,
      [mesocycleId]
    );

    await db.runAsync(
      `DELETE FROM Run
       WHERE workout_id IN (
         SELECT w.workout_id
         FROM Workout w
         JOIN Day d ON d.day_id = w.day_id
         JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
         WHERE mc.mesocycle_id = ?
       );`,
      [mesocycleId]
    );

    await db.runAsync(
      `DELETE FROM Workout
       WHERE day_id IN (
         SELECT d.day_id
         FROM Day d
         JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
         WHERE mc.mesocycle_id = ?
       );`,
      [mesocycleId]
    );

    await db.runAsync(
      `DELETE FROM Day
       WHERE microcycle_id IN (
         SELECT microcycle_id
         FROM Microcycle
         WHERE mesocycle_id = ?
       );`,
      [mesocycleId]
    );

    await db.runAsync(
      `DELETE FROM Microcycle
       WHERE mesocycle_id = ?;`,
      [mesocycleId]
    );

    await db.runAsync(
      `DELETE FROM Mesocycle
       WHERE mesocycle_id = ?;`,
      [mesocycleId]
    );
  });
}

export async function getMesocycleOptions(db, programId) {
  return db.getAllAsync(
    `SELECT mesocycle_id, mesocycle_number
     FROM Mesocycle
     WHERE program_id = ?
     ORDER BY mesocycle_number;`,
    [programId]
  );
}

export async function getWeeksBeforeMesocycle(
  db,
  { programId, mesocycleNumber }
) {
  const row = await db.getFirstAsync(
    `SELECT COALESCE(SUM(weeks), 0) AS total_weeks
     FROM Mesocycle
     WHERE program_id = ?
       AND mesocycle_number < ?;`,
    [programId, mesocycleNumber]
  );

  return row?.total_weeks ?? 0;
}

export async function getGlobalWeekIndexFromMicrocycle(
  db,
  { programId, microcycleId }
) {
  const microcycle = await db.getFirstAsync(
    `SELECT
        mc.microcycle_number,
        m.mesocycle_number
     FROM Microcycle mc
     JOIN Mesocycle m ON mc.mesocycle_id = m.mesocycle_id
     WHERE mc.microcycle_id = ?
       AND mc.program_id = ?;`,
    [microcycleId, programId]
  );

  if (!microcycle) {
    throw new Error("Microcycle not found");
  }

  const weeksBefore = await getWeeksBeforeMesocycle(db, {
    programId,
    mesocycleNumber: microcycle.mesocycle_number,
  });

  return weeksBefore + (microcycle.microcycle_number - 1);
}

export async function getMicrocyclesByMesocycle(db, mesocycleId) {
  return db.getAllAsync(
    `SELECT microcycle_id, microcycle_number, program_id, focus, done
     FROM Microcycle
     WHERE mesocycle_id = ?;`,
    [mesocycleId]
  );
}

export async function updateMicrocycleFocus(db, { microcycleId, focus }) {
  await db.runAsync(
    `UPDATE Microcycle
     SET focus = ?
     WHERE microcycle_id = ?;`,
    [focus, microcycleId]
  );
}

export async function getMicrocycleWorkoutCounts(db, microcycleId) {
  const total = await db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM Workout w
     JOIN Day d ON w.day_id = d.day_id
     WHERE d.microcycle_id = ?;`,
    [microcycleId]
  );

  const done = await db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM Workout w
     JOIN Day d ON w.day_id = d.day_id
     WHERE d.microcycle_id = ?
       AND w.done = 1;`,
    [microcycleId]
  );

  return {
    total: total?.count ?? 0,
    done: done?.count ?? 0,
  };
}

export async function getDayByMicrocycleAndDate(
  db,
  { microcycleId, date }
) {
  return db.getFirstAsync(
    `SELECT day_id
     FROM Day
     WHERE microcycle_id = ?
       AND date = ?;`,
    [microcycleId, date]
  );
}

export async function getWorkoutLabelsByDay(db, dayId) {
  return db.getAllAsync(
    `SELECT label
     FROM Workout
     WHERE day_id = ?;`,
    [dayId]
  );
}

export async function getMicrocycleOptions(db, programId) {
  const mesocycles = await db.getAllAsync(
    `SELECT mesocycle_id, mesocycle_number
     FROM Mesocycle
     WHERE program_id = ?
     ORDER BY mesocycle_number;`,
    [programId]
  );

  const microcycles = await db.getAllAsync(
    `SELECT microcycle_id, microcycle_number, mesocycle_id
     FROM Microcycle
     WHERE program_id = ?
     ORDER BY microcycle_number;`,
    [programId]
  );

  return { mesocycles, microcycles };
}

export async function copyMicrocycleWorkouts(
  db,
  { sourceMicrocycleId, targetMicrocycleId }
) {
  await withTransaction(db, async () => {
    const sourceDays = await db.getAllAsync(
      `SELECT day_id, Weekday
       FROM Day
       WHERE microcycle_id = ?;`,
      [sourceMicrocycleId]
    );

    const targetDays = await db.getAllAsync(
      `SELECT day_id, Weekday, date
       FROM Day
       WHERE microcycle_id = ?;`,
      [targetMicrocycleId]
    );

    const targetDayMap = {};
    for (const day of targetDays) {
      targetDayMap[day.Weekday] = day;
    }

    for (const sourceDay of sourceDays) {
      const targetDay = targetDayMap[sourceDay.Weekday];
      if (!targetDay) {
        continue;
      }

      const workouts = await db.getAllAsync(
        `SELECT *
         FROM Workout
         WHERE day_id = ?;`,
        [sourceDay.day_id]
      );

      for (const workout of workouts) {
        const workoutResult = await db.runAsync(
          `INSERT INTO Workout (day_id, date, label, done)
           VALUES (?, ?, ?, 0);`,
          [targetDay.day_id, targetDay.date, workout.label]
        );

        await cloneWorkoutContents(db, {
          sourceWorkoutId: workout.workout_id,
          targetWorkoutId: workoutResult.lastInsertRowId,
        });

        const targetHierarchy = await db.getFirstAsync(
          `SELECT d.day_id, d.microcycle_id, mc.mesocycle_id
           FROM Day d
           JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
           WHERE d.day_id = ?;`,
          [targetDay.day_id]
        );

        await refreshHierarchyCompletionByIds(db, {
          dayId: targetHierarchy?.day_id,
          microcycleId: targetHierarchy?.microcycle_id,
          mesocycleId: targetHierarchy?.mesocycle_id,
        });
      }
    }
  });
}

export async function deleteMicrocycle(db, microcycleId) {
  await withTransaction(db, async () => {
    await db.runAsync(
      `DELETE FROM Sets
       WHERE exercise_id IN (
         SELECT e.exercise_id
         FROM Exercise e
         JOIN Workout w ON w.workout_id = e.workout_id
         JOIN Day d ON d.day_id = w.day_id
         WHERE d.microcycle_id = ?
       );`,
      [microcycleId]
    );

    await db.runAsync(
      `DELETE FROM Exercise
       WHERE workout_id IN (
         SELECT w.workout_id
         FROM Workout w
         JOIN Day d ON d.day_id = w.day_id
         WHERE d.microcycle_id = ?
       );`,
      [microcycleId]
    );

    await db.runAsync(
      `DELETE FROM Run
       WHERE workout_id IN (
         SELECT w.workout_id
         FROM Workout w
         JOIN Day d ON d.day_id = w.day_id
         WHERE d.microcycle_id = ?
       );`,
      [microcycleId]
    );

    await db.runAsync(
      `DELETE FROM Workout
       WHERE day_id IN (
         SELECT day_id
         FROM Day
         WHERE microcycle_id = ?
       );`,
      [microcycleId]
    );

    await db.runAsync(
      `DELETE FROM Day
       WHERE microcycle_id = ?;`,
      [microcycleId]
    );

    await db.runAsync(
      `DELETE FROM Microcycle
       WHERE microcycle_id = ?;`,
      [microcycleId]
    );
  });
}

export async function getDayDetails(db, { microcycleId, weekday }) {
  const day = await db.getFirstAsync(
    `SELECT day_id, date, done
     FROM Day
     WHERE Weekday = ?
       AND microcycle_id = ?;`,
    [weekday, microcycleId]
  );

  if (!day?.day_id) {
    return null;
  }

  const workouts = await db.getAllAsync(
    `SELECT workout_id, label, done, day_id
     FROM Workout
     WHERE day_id = ?;`,
    [day.day_id]
  );

  const workoutExercises = [];
  for (const workout of workouts) {
    const exercises = await db.getAllAsync(
      `SELECT exercise_name, sets
       FROM Exercise
       WHERE workout_id = ?;`,
      [workout.workout_id]
    );

    workoutExercises.push({
      workout_id: workout.workout_id,
      label: workout.label,
      exercises,
    });
  }

  return {
    ...day,
    workouts,
    workoutExercises,
    workoutsDone: day.done === 1,
  };
}

export async function getDayByDate(db, { programId, date }) {
  return db.getFirstAsync(
    `SELECT day_id
     FROM Day
     WHERE date = ?
       AND program_id = ?;`,
    [date, programId]
  );
}

export async function createWorkoutForDay(db, { date, dayId, label }) {
  return withTransaction(db, async () => {
    const workout = await db.runAsync(
      `INSERT INTO Workout (date, day_id, label)
       VALUES (?, ?, ?);`,
      [date, dayId, label]
    );

    const hierarchy = await db.getFirstAsync(
      `SELECT d.day_id, d.microcycle_id, mc.mesocycle_id
       FROM Day d
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       WHERE d.day_id = ?;`,
      [dayId]
    );

    await refreshHierarchyCompletionByIds(db, {
      dayId: hierarchy?.day_id,
      microcycleId: hierarchy?.microcycle_id,
      mesocycleId: hierarchy?.mesocycle_id,
    });

    return workout;
  });
}

export async function copyWorkoutToDate(
  db,
  { workoutId, programId, date }
) {
  return withTransaction(db, async () => {
    const targetDay = await getDayByDate(db, {
      programId,
      date: formatDate(date),
    });

    if (!targetDay?.day_id) {
      return null;
    }

    const workoutResult = await db.runAsync(
      `INSERT INTO Workout (date, day_id, label)
       SELECT ?, ?, label
       FROM Workout
       WHERE workout_id = ?;`,
      [formatDate(date), targetDay.day_id, workoutId]
    );

    await cloneWorkoutContents(db, {
      sourceWorkoutId: workoutId,
      targetWorkoutId: workoutResult.lastInsertRowId,
    });

    const hierarchy = await db.getFirstAsync(
      `SELECT d.day_id, d.microcycle_id, mc.mesocycle_id
       FROM Day d
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       WHERE d.day_id = ?;`,
      [targetDay.day_id]
    );

    await refreshHierarchyCompletionByIds(db, {
      dayId: hierarchy?.day_id,
      microcycleId: hierarchy?.microcycle_id,
      mesocycleId: hierarchy?.mesocycle_id,
    });

    return workoutResult.lastInsertRowId;
  });
}

export async function deleteWorkout(db, workoutId) {
  await withTransaction(db, async () => {
    const hierarchy = await db.getFirstAsync(
      `SELECT d.day_id, d.microcycle_id, mc.mesocycle_id
       FROM Workout w
       JOIN Day d ON d.day_id = w.day_id
       JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
       WHERE w.workout_id = ?;`,
      [workoutId]
    );

    await db.runAsync(
      `DELETE FROM Sets
       WHERE exercise_id IN (
         SELECT exercise_id
         FROM Exercise
         WHERE workout_id = ?
       );`,
      [workoutId]
    );

    await db.runAsync(
      `DELETE FROM Exercise
       WHERE workout_id = ?;`,
      [workoutId]
    );

    await db.runAsync(
      `DELETE FROM Run
       WHERE workout_id = ?;`,
      [workoutId]
    );

    await db.runAsync(
      `DELETE FROM Workout
       WHERE workout_id = ?;`,
      [workoutId]
    );

    await refreshHierarchyCompletionByIds(db, {
      dayId: hierarchy?.day_id,
      microcycleId: hierarchy?.microcycle_id,
      mesocycleId: hierarchy?.mesocycle_id,
    });
  });
}

export async function getWorkoutOptions(db, programId) {
  return db.getAllAsync(
    `SELECT w.workout_id, w.date
     FROM Workout w
     JOIN Day d ON d.day_id = w.day_id
     WHERE d.program_id = ?
     ORDER BY w.date;`,
    [programId]
  );
}

export async function getMicrocycleMetadata(db, microcycleId) {
  return db.getFirstAsync(
    `SELECT mesocycle_id, microcycle_number
     FROM Microcycle
     WHERE microcycle_id = ?;`,
    [microcycleId]
  );
}

export async function getMesocycleMetadata(
  db,
  { mesocycleId, programId }
) {
  return db.getFirstAsync(
    `SELECT mesocycle_number
     FROM Mesocycle
     WHERE mesocycle_id = ?
       AND program_id = ?;`,
    [mesocycleId, programId]
  );
}

export async function getProgramMetadata(db, programId) {
  return db.getFirstAsync(
    `SELECT start_date
     FROM Program
     WHERE program_id = ?;`,
    [programId]
  );
}

export async function withTransaction(db, callback) {
  await db.execAsync("BEGIN TRANSACTION");

  try {
    const result = await callback();
    await db.execAsync("COMMIT");
    return result;
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
}

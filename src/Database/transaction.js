let transactionCounter = 0;

function getSavepointName() {
  transactionCounter += 1;
  return `codex_txn_${transactionCounter}`;
}

export async function withTransaction(db, callback) {
  const savepointName = getSavepointName();

  await db.execAsync(`SAVEPOINT ${savepointName}`);

  try {
    const result = await callback();
    await db.execAsync(`RELEASE SAVEPOINT ${savepointName}`);
    return result;
  } catch (error) {
    try {
      await db.execAsync(`ROLLBACK TO SAVEPOINT ${savepointName}`);
    } finally {
      await db.execAsync(`RELEASE SAVEPOINT ${savepointName}`);
    }

    throw error;
  }
}

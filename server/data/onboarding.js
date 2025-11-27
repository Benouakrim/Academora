// Persistent onboarding store backed by Neon (PostgreSQL).
// Falls back gracefully and self-initializes the table if missing.
import pool from '../database/pool.js';

async function ensureTable() {
  // Run lightweight existence check once per process startup.
  if (ensureTable._done) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS user_onboarding (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      account_type TEXT,
      answers JSONB DEFAULT '{}'::jsonb,
      metadata JSONB DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`);
    ensureTable._done = true;
  } catch (err) {
    console.error('[Onboarding] Failed ensuring user_onboarding table:', err.message);
  }
}
ensureTable._done = false;

export async function upsertUserOnboarding(userId, accountType, answers, metadata = {}) {
  if (!userId) throw new Error('userId required for onboarding upsert');
  await ensureTable();

  const client = pool;
  let existing = null;
  try {
    const res = await client.query('SELECT account_type, answers, metadata, updated_at FROM user_onboarding WHERE user_id = $1', [userId]);
    existing = res.rows[0] || null;
  } catch (selErr) {
    console.error('[Onboarding] Select failed:', selErr.message);
  }

  const mergedAnswers = { ...(existing?.answers || {}), ...(answers || {}) };
  const nowIso = new Date().toISOString();
  const prevMeta = existing?.metadata || {};
  const recordMeta = {
    firstCompletedAt: prevMeta.firstCompletedAt || metadata.completedAt || nowIso,
    completedAt: metadata.completedAt || nowIso,
    stepsCompleted: metadata.stepsCompleted || prevMeta.stepsCompleted || 0,
    version: (prevMeta.version || 0) + 1,
  };

  const finalAccountType = accountType || existing?.account_type || null;

  try {
    if (existing) {
      await client.query(
        `UPDATE user_onboarding
         SET account_type = $2,
             answers = $3,
             metadata = $4,
             updated_at = NOW()
         WHERE user_id = $1`,
        [userId, finalAccountType, JSON.stringify(mergedAnswers), JSON.stringify(recordMeta)]
      );
    } else {
      await client.query(
        `INSERT INTO user_onboarding (user_id, account_type, answers, metadata)
         VALUES ($1, $2, $3, $4)`,
        [userId, finalAccountType, JSON.stringify(mergedAnswers), JSON.stringify(recordMeta)]
      );
    }
  } catch (upErr) {
    console.error('[Onboarding] Upsert failed:', upErr.message);
    throw upErr;
  }

  return {
    userId,
    accountType: finalAccountType,
    answers: mergedAnswers,
    metadata: recordMeta,
    updatedAt: nowIso,
  };
}

export async function getUserOnboarding(userId) {
  if (!userId) return null;
  await ensureTable();
  try {
    const res = await pool.query('SELECT user_id, account_type, answers, metadata, updated_at FROM user_onboarding WHERE user_id = $1', [userId]);
    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      userId: row.user_id,
      accountType: row.account_type,
      answers: row.answers || {},
      metadata: row.metadata || {},
      updatedAt: row.updated_at,
    };
  } catch (err) {
    console.error('[Onboarding] Retrieval failed:', err.message);
    return null;
  }
}

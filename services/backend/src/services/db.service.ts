import { Pool } from 'pg';
import { ExamSession, Alert } from '@sentinel-ai/types';

const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_OKt24VeGxsSD@ep-cold-field-axgysjiu-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const pool = new Pool({
  connectionString: NEON_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initDb() {
  console.log('[Postgres DB] Initializing Neon Database Schema...');
  const client = await pool.connect();
  try {
    // 1. Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_sessions (
        session_id VARCHAR(50) PRIMARY KEY,
        exam_id VARCHAR(50),
        candidate_id VARCHAR(50),
        candidate_name VARCHAR(100),
        status VARCHAR(20),
        current_risk_score DOUBLE PRECISION,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP,
        submissions JSONB DEFAULT '{}'::jsonb
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS alert_logs (
        alert_id VARCHAR(50) PRIMARY KEY,
        session_id VARCHAR(50) REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
        candidate_name VARCHAR(100),
        alert_level VARCHAR(20),
        risk_score DOUBLE PRECISION,
        explainability_text TEXT,
        status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Check if sessions are empty, if so, seed them
    const res = await client.query('SELECT count(*) FROM exam_sessions');
    const count = parseInt(res.rows[0].count, 10);
    if (count === 0) {
      console.log('[Postgres DB] Seeding initial mock sessions to Neon database...');
      const candidates = [
        { id: 'cand_alex_01', name: 'Rohan Singh', initialRisk: 0.12, status: 'IN_PROGRESS' },
        { id: 'cand_sarah_02', name: 'Priya Sharma', initialRisk: 0.78, status: 'IN_PROGRESS' },
        { id: 'cand_michael_03', name: 'Aarav Patel', initialRisk: 0.45, status: 'IN_PROGRESS' },
        { id: 'cand_elena_04', name: 'Ananya Iyer', initialRisk: 0.88, status: 'IN_PROGRESS' },
        { id: 'cand_david_05', name: 'Vikram Verma', initialRisk: 0.05, status: 'IN_PROGRESS' }
      ];

      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        const sessionId = `sess_${i + 100}`;
        await client.query(`
          INSERT INTO exam_sessions 
            (session_id, exam_id, candidate_id, candidate_name, status, current_risk_score, started_at, submissions)
          VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          sessionId,
          'exam_cs101',
          c.id,
          c.name,
          c.status,
          c.initialRisk,
          new Date(Date.now() - 15 * 60 * 1000),
          JSON.stringify({})
        ]);
      }

      // Seed mock alerts as well
      await client.query(`
        INSERT INTO alert_logs 
          (alert_id, session_id, candidate_name, alert_level, risk_score, explainability_text, status, created_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8),
          ($9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        'alt_01', 'sess_103', 'Ananya Iyer', 'CRITICAL', 0.88, 'Flagged due to: 2 faces detected in frame; Secondary device(s) visible: smartphone. Primary risk driver: Camera Tampering.', 'PENDING', new Date(),
        'alt_02', 'sess_101', 'Priya Sharma', 'HIGH', 0.78, 'Flagged due to: Unusually large text insertion from external clipboard. Primary risk driver: Clipboard Paste Anomaly.', 'PENDING', new Date(Date.now() - 2 * 60 * 1000)
      ]);
      console.log('[Postgres DB] Seeding completed.');
    } else {
      // Update existing records to Indian names
      await client.query(`UPDATE exam_sessions SET candidate_name = 'Rohan Singh' WHERE session_id = 'sess_100' OR candidate_name = 'Alex Johnson'`);
      await client.query(`UPDATE exam_sessions SET candidate_name = 'Priya Sharma' WHERE session_id = 'sess_101' OR candidate_name = 'Sarah Connor'`);
      await client.query(`UPDATE exam_sessions SET candidate_name = 'Aarav Patel' WHERE session_id = 'sess_102' OR candidate_name = 'Michael Chen'`);
      await client.query(`UPDATE exam_sessions SET candidate_name = 'Ananya Iyer' WHERE session_id = 'sess_103' OR candidate_name = 'Elena Rostova'`);
      await client.query(`UPDATE exam_sessions SET candidate_name = 'Vikram Verma' WHERE session_id = 'sess_104' OR candidate_name = 'David Smith'`);
      
      await client.query(`UPDATE alert_logs SET candidate_name = 'Ananya Iyer' WHERE candidate_name = 'Elena Rostova' OR session_id = 'sess_103'`);
      await client.query(`UPDATE alert_logs SET candidate_name = 'Priya Sharma' WHERE candidate_name = 'Sarah Connor' OR session_id = 'sess_101'`);
      console.log('[Postgres DB] Schema verified. Existing records updated with Indian candidate names.');
    }
  } catch (err) {
    console.error('[Postgres DB] Database initialization failed:', err);
  } finally {
    client.release();
  }
}

// DB Data queries helper functions
export async function dbGetAllSessions(): Promise<ExamSession[]> {
  const res = await pool.query('SELECT * FROM exam_sessions ORDER BY started_at ASC');
  return res.rows.map(row => ({
    sessionId: row.session_id,
    examId: row.exam_id,
    candidateId: row.candidate_id,
    candidateName: row.candidate_name,
    status: row.status,
    currentRiskScore: row.current_risk_score,
    startedAt: row.started_at ? row.started_at.toISOString() : undefined,
    endedAt: row.submitted_at ? row.submitted_at.toISOString() : undefined,
    submissions: row.submissions
  }));
}

export async function dbGetSession(sessionId: string): Promise<ExamSession | undefined> {
  const res = await pool.query('SELECT * FROM exam_sessions WHERE session_id = $1', [sessionId]);
  if (res.rows.length === 0) return undefined;
  const row = res.rows[0];
  return {
    sessionId: row.session_id,
    examId: row.exam_id,
    candidateId: row.candidate_id,
    candidateName: row.candidate_name,
    status: row.status,
    currentRiskScore: row.current_risk_score,
    startedAt: row.started_at ? row.started_at.toISOString() : undefined,
    endedAt: row.submitted_at ? row.submitted_at.toISOString() : undefined,
    submissions: row.submissions
  };
}

export async function dbUpdateSessionRisk(sessionId: string, riskScore: number): Promise<void> {
  await pool.query('UPDATE exam_sessions SET current_risk_score = $1 WHERE session_id = $2', [riskScore, sessionId]);
}

export async function dbSubmitAnswer(sessionId: string, questionId: string, answerText: string, selectedOptions?: string[]): Promise<ExamSession | undefined> {
  const session = await dbGetSession(sessionId);
  if (!session) return undefined;

  session.submissions[questionId] = {
    questionId,
    answerText,
    selectedOptions,
    updatedAt: new Date().toISOString()
  };

  await pool.query('UPDATE exam_sessions SET submissions = $1 WHERE session_id = $2', [JSON.stringify(session.submissions), sessionId]);
  return session;
}

export async function dbSaveAlert(alert: Alert): Promise<void> {
  await pool.query(`
    INSERT INTO alert_logs 
      (alert_id, session_id, candidate_name, alert_level, risk_score, explainability_text, status, created_at)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (alert_id) DO UPDATE SET 
      risk_score = EXCLUDED.risk_score,
      alert_level = EXCLUDED.alert_level,
      explainability_text = EXCLUDED.explainability_text
  `, [
    alert.alertId,
    alert.sessionId,
    alert.candidateName,
    alert.alertLevel,
    alert.riskScore,
    alert.explainabilityText,
    alert.status,
    new Date(alert.createdAt)
  ]);
}

export async function dbGetAllAlerts(): Promise<Alert[]> {
  const res = await pool.query('SELECT * FROM alert_logs ORDER BY created_at DESC');
  return res.rows.map(row => ({
    alertId: row.alert_id,
    sessionId: row.session_id,
    candidateName: row.candidate_name,
    alertLevel: row.alert_level,
    riskScore: row.risk_score,
    explainabilityText: row.explainability_text,
    status: row.status,
    createdAt: row.created_at.toISOString()
  }));
}

export async function dbUpdateAlertStatus(alertId: string, status: string): Promise<void> {
  await pool.query('UPDATE alert_logs SET status = $1 WHERE alert_id = $2', [status, alertId]);
}

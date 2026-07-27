import crypto from 'crypto';
import { AuditLogEntry } from '@sentinel-ai/types';

export class AuditService {
  private ledger: AuditLogEntry[] = [];
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.recordAction('SYSTEM_INIT', 'SYSTEM', 'inst_mit_01', { message: 'SHA-256 Audit Ledger Initialized' });
  }

  public recordAction(
    action: string,
    userId: string,
    institutionId: string,
    payload: Record<string, any>
  ): AuditLogEntry {
    const timestamp = new Date().toISOString();
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const prevEntryHash = this.lastHash;

    const rawContent = JSON.stringify({
      logId,
      institutionId,
      timestamp,
      userId,
      action,
      payload,
      prevEntryHash
    });

    const entryHash = crypto.createHash('sha256').update(rawContent).digest('hex');

    const entry: AuditLogEntry = {
      logId,
      institutionId,
      timestamp,
      userId,
      action,
      payload,
      prevEntryHash,
      entryHash
    };

    this.ledger.push(entry);
    this.lastHash = entryHash;

    return entry;
  }

  public getLedger(): AuditLogEntry[] {
    return [...this.ledger];
  }

  public verifyIntegrity(): { isValid: boolean; brokenAtLogId?: string } {
    let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (const entry of this.ledger) {
      if (entry.prevEntryHash !== expectedPrevHash) {
        return { isValid: false, brokenAtLogId: entry.logId };
      }

      const rawContent = JSON.stringify({
        logId: entry.logId,
        institutionId: entry.institutionId,
        timestamp: entry.timestamp,
        userId: entry.userId,
        action: entry.action,
        payload: entry.payload,
        prevEntryHash: entry.prevEntryHash
      });

      const recomputedHash = crypto.createHash('sha256').update(rawContent).digest('hex');
      if (recomputedHash !== entry.entryHash) {
        return { isValid: false, brokenAtLogId: entry.logId };
      }

      expectedPrevHash = entry.entryHash;
    }

    return { isValid: true };
  }
}

import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';
import { TaskLedgerEntrySchema } from '../../schemas/log-entries.js';

const SAMPLE_SIZE = 20;

export const log002: Check = {
  id: 'LOG-002',
  name: 'Task Ledger Schema',
  category: 'logs',
  maxSeverity: 'warn',
  description: `Reads the last ${SAMPLE_SIZE} lines of logs/task-ledger.jsonl and validates each against the expected schema. Flags malformed entries that may indicate a broken write path or format drift.`,
  reads: ['logs/task-ledger.jsonl'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'logs', 'task-ledger.jsonl');
    if (!await ctx.fs.fileExists(p)) return null; // LOG-001 owns the missing-file case

    const lines = await ctx.fs.readJsonl(p);
    if (lines.length === 0) return null; // empty file is valid

    const sample = lines.slice(-SAMPLE_SIZE);
    let malformed = 0;

    for (const line of sample) {
      if (typeof line === 'object' && line !== null && '_parseError' in line) {
        malformed++;
        continue;
      }
      if (!TaskLedgerEntrySchema.safeParse(line).success) {
        malformed++;
      }
    }

    if (malformed === 0) return null;

    return {
      checkId: 'LOG-002',
      checkName: 'Task Ledger Schema',
      category: 'logs',
      severity: 'warn',
      confidence: 'probable',
      message: `${malformed} of last ${sample.length} task ledger entries have schema issues`,
      remediation: [
        'Inspect logs/task-ledger.jsonl for malformed lines.',
        'Required fields: id (string), agent (string), task (string), status (string), started_at (string).',
      ],
      checkedAt: new Date().toISOString(),
      meta: { malformedCount: malformed, sampleSize: sample.length },
    };
  },
};

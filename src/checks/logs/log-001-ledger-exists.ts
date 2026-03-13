import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

export const log001: Check = {
  id: 'LOG-001',
  name: 'Task Ledger Exists',
  category: 'logs',
  maxSeverity: 'error',
  description:
    'Verifies logs/task-ledger.jsonl exists. The task ledger is the canonical record of all agent work — task IDs, owners, status, and notes. Its absence means work is being done with no audit trail.',
  reads: ['logs/task-ledger.jsonl'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'logs', 'task-ledger.jsonl');
    if (await ctx.fs.fileExists(p)) return null;
    return {
      checkId: 'LOG-001',
      checkName: 'Task Ledger Exists',
      category: 'logs',
      severity: 'error',
      confidence: 'definite',
      message: 'logs/task-ledger.jsonl is missing',
      remediation: [
        'Create the logs/ directory and initialize task-ledger.jsonl (empty file is valid).',
        `mkdir -p ${path.join(ctx.workspaceRoot, 'logs')} && touch ${p}`,
      ],
      checkedAt: new Date().toISOString(),
      meta: { path: p },
    };
  },
};

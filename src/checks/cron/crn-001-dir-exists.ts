import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

export const crn001: Check = {
  id: 'CRN-001',
  name: 'Cron Directory Exists',
  category: 'cron',
  maxSeverity: 'warn',
  description:
    'Verifies the cron/ directory exists. OpenClaw stores cron job definition files here as individual JSON files. A missing directory suggests automation has never been configured.',
  reads: ['cron/'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'cron');
    if (await ctx.fs.dirExists(p)) return null;
    return {
      checkId: 'CRN-001',
      checkName: 'Cron Directory Exists',
      category: 'cron',
      severity: 'warn',
      confidence: 'definite',
      message: 'cron/ directory does not exist',
      remediation: ['Create the cron/ directory for storing cron job definition JSON files.'],
      checkedAt: new Date().toISOString(),
      meta: { path: p },
    };
  },
};

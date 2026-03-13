import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

export const ws003: Check = {
  id: 'WS-003',
  name: 'USER.md Present',
  category: 'workspace',
  maxSeverity: 'warn',
  description:
    'Verifies USER.md exists at the workspace root. This file provides human operator context (name, role, communication preferences) that agents use to personalize their behavior.',
  reads: ['USER.md'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'USER.md');
    if (await ctx.fs.fileExists(p)) return null;
    return {
      checkId: 'WS-003',
      checkName: 'USER.md Present',
      category: 'workspace',
      severity: 'warn',
      confidence: 'definite',
      message: 'USER.md is missing — agents lack human operator context',
      remediation: [
        'Create USER.md with operator name, role, goals, and communication preferences.',
      ],
      checkedAt: new Date().toISOString(),
      meta: { path: p },
    };
  },
};

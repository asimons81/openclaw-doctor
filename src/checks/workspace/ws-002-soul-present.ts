import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

export const ws002: Check = {
  id: 'WS-002',
  name: 'SOUL.md Present',
  category: 'workspace',
  maxSeverity: 'error',
  description:
    'Verifies SOUL.md exists at the workspace root. This file defines the primary agent identity, tone, and operational principles. Its absence breaks agent continuity across sessions.',
  reads: ['SOUL.md'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'SOUL.md');
    if (await ctx.fs.fileExists(p)) return null;
    return {
      checkId: 'WS-002',
      checkName: 'SOUL.md Present',
      category: 'workspace',
      severity: 'error',
      confidence: 'definite',
      message: 'SOUL.md is missing from workspace root',
      remediation: ['Create SOUL.md with agent identity, tone, and operational principles.'],
      checkedAt: new Date().toISOString(),
      meta: { path: p },
    };
  },
};

import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

export const ws004: Check = {
  id: 'WS-004',
  name: 'AGENTS.md Present',
  category: 'workspace',
  maxSeverity: 'error',
  description:
    'Verifies AGENTS.md exists at the workspace root. This file defines the agent routing table: which agents exist, their IDs, responsibilities, model assignments, and delegation rules.',
  reads: ['AGENTS.md'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'AGENTS.md');
    if (await ctx.fs.fileExists(p)) return null;
    return {
      checkId: 'WS-004',
      checkName: 'AGENTS.md Present',
      category: 'workspace',
      severity: 'error',
      confidence: 'definite',
      message: 'AGENTS.md is missing — agent routing table is undefined',
      remediation: [
        'Create AGENTS.md with agent IDs, responsibilities, model assignments, and delegation rules.',
      ],
      checkedAt: new Date().toISOString(),
      meta: { path: p },
    };
  },
};

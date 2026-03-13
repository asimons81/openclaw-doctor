import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

export const cfg004: Check = {
  id: 'CFG-004',
  name: 'OPERATIONAL_CONTEXT.md Present',
  category: 'config',
  maxSeverity: 'warn',
  description:
    'Verifies OPERATIONAL_CONTEXT.md exists at the workspace root. This file documents authoritative operational facts in human-readable form: workspace paths, integration endpoints, key decisions, and constraints. Agents read it at startup to orient themselves. Its absence means agents bootstrap without critical environmental context.',
  reads: ['OPERATIONAL_CONTEXT.md'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'OPERATIONAL_CONTEXT.md');
    if (await ctx.fs.fileExists(p)) return null;
    return {
      checkId: 'CFG-004',
      checkName: 'OPERATIONAL_CONTEXT.md Present',
      category: 'config',
      severity: 'warn',
      confidence: 'definite',
      message: 'OPERATIONAL_CONTEXT.md is missing — agents lack startup environmental context',
      remediation: [
        'Create OPERATIONAL_CONTEXT.md documenting: workspace paths, integration endpoints, key operational decisions, and known constraints.',
        'This file complements ENVIRONMENT.json with human-readable context that agents read at session start.',
      ],
      checkedAt: new Date().toISOString(),
      meta: { path: p },
    };
  },
};

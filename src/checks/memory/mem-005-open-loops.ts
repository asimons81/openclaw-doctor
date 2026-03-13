import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

export const mem005: Check = {
  id: 'MEM-005',
  name: 'Open Loops File Present',
  category: 'memory',
  maxSeverity: 'warn',
  description:
    'Verifies memory/open-loops.md exists. This file tracks unresolved items that cross session boundaries — decisions pending, blockers waiting on external input, and follow-ups that need to persist.',
  reads: ['memory/open-loops.md'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'memory', 'open-loops.md');
    if (await ctx.fs.fileExists(p)) return null;
    return {
      checkId: 'MEM-005',
      checkName: 'Open Loops File Present',
      category: 'memory',
      severity: 'warn',
      confidence: 'definite',
      message: 'memory/open-loops.md is missing',
      remediation: [
        'Create memory/open-loops.md for tracking unresolved items across sessions.',
      ],
      checkedAt: new Date().toISOString(),
      meta: { path: p },
    };
  },
};

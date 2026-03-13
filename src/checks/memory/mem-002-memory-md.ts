import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

export const mem002: Check = {
  id: 'MEM-002',
  name: 'MEMORY.md Present',
  category: 'memory',
  maxSeverity: 'error',
  description:
    'Verifies memory/MEMORY.md exists. This is the Archivist-curated long-term memory file containing durable facts and decisions. Only the Archivist agent should write to it.',
  reads: ['memory/MEMORY.md'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'memory', 'MEMORY.md');
    if (await ctx.fs.fileExists(p)) return null;
    return {
      checkId: 'MEM-002',
      checkName: 'MEMORY.md Present',
      category: 'memory',
      severity: 'error',
      confidence: 'definite',
      message: 'memory/MEMORY.md is missing',
      remediation: [
        'Create memory/MEMORY.md with curated long-term facts.',
        'Write access should be restricted to the Archivist agent.',
      ],
      checkedAt: new Date().toISOString(),
      meta: { path: p },
    };
  },
};

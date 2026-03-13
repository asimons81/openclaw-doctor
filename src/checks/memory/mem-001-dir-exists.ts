import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

export const mem001: Check = {
  id: 'MEM-001',
  name: 'Memory Directory Exists',
  category: 'memory',
  maxSeverity: 'critical',
  description:
    'Verifies the memory/ directory exists at the workspace root. This is the authoritative store for all agent memory including daily logs, MEMORY.md, and weekly distillations.',
  reads: ['memory/'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'memory');
    if (await ctx.fs.dirExists(p)) return null;
    return {
      checkId: 'MEM-001',
      checkName: 'Memory Directory Exists',
      category: 'memory',
      severity: 'critical',
      confidence: 'definite',
      message: 'memory/ directory does not exist',
      remediation: [`Create the memory/ directory: mkdir -p ${p}`],
      checkedAt: new Date().toISOString(),
      meta: { path: p },
    };
  },
};

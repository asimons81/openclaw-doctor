import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

const STUB_THRESHOLD_BYTES = 20;

export const mem004: Check = {
  id: 'MEM-004',
  name: 'Active Projects File Present',
  category: 'memory',
  maxSeverity: 'warn',
  description:
    'Verifies memory/active-projects.md exists and contains meaningful content. This file tracks active initiatives with owners, status, and next actions. An empty or stub file indicates the project registry was never populated.',
  reads: ['memory/active-projects.md'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'memory', 'active-projects.md');

    if (!await ctx.fs.fileExists(p)) {
      return {
        checkId: 'MEM-004',
        checkName: 'Active Projects File Present',
        category: 'memory',
        severity: 'warn',
        confidence: 'definite',
        message: 'memory/active-projects.md is missing',
        remediation: [
          'Create memory/active-projects.md listing active projects with owners and status.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { path: p },
      };
    }

    const content = await ctx.fs.readFile(p);
    if (content.trim().length < STUB_THRESHOLD_BYTES) {
      return {
        checkId: 'MEM-004',
        checkName: 'Active Projects File Present',
        category: 'memory',
        severity: 'info',
        confidence: 'probable',
        message: 'memory/active-projects.md appears to be an empty stub',
        remediation: ['Populate memory/active-projects.md with active project entries.'],
        checkedAt: new Date().toISOString(),
        meta: { byteLength: content.trim().length },
      };
    }

    return null;
  },
};

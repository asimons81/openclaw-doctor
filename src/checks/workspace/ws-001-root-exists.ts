import type { Check, CheckContext, Finding } from '../../types/index.js';

export const ws001: Check = {
  id: 'WS-001',
  name: 'Workspace Root Exists',
  category: 'workspace',
  maxSeverity: 'critical',
  description:
    'Verifies the target workspace root directory exists and is accessible. If this check fails, no other checks can produce meaningful results.',
  reads: ['.'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const exists = await ctx.fs.dirExists(ctx.workspaceRoot);
    if (exists) return null;
    return {
      checkId: 'WS-001',
      checkName: 'Workspace Root Exists',
      category: 'workspace',
      severity: 'critical',
      confidence: 'definite',
      message: `Workspace root does not exist: ${ctx.workspaceRoot}`,
      remediation: [
        'Verify the path passed via --path or the OPENCLAW_WORKSPACE environment variable.',
        `Run: ls -la ${ctx.workspaceRoot}`,
      ],
      checkedAt: new Date().toISOString(),
      meta: { path: ctx.workspaceRoot },
    };
  },
};

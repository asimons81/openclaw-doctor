import * as path from 'node:path';
import { ZodError } from 'zod';
import type { Check, CheckContext, Finding } from '../../types/index.js';
import { ApprovalConfigSchema } from '../../schemas/approval-config.js';

export const cfg001: Check = {
  id: 'CFG-001',
  name: 'Approval Config Valid',
  category: 'config',
  maxSeverity: 'error',
  description:
    'Validates config/approval-config.json exists, parses as JSON, and passes schema validation. The approval config drives the Discord reaction-based approval workflow.',
  reads: ['config/approval-config.json'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'config', 'approval-config.json');

    if (!await ctx.fs.fileExists(p)) {
      return {
        checkId: 'CFG-001',
        checkName: 'Approval Config Valid',
        category: 'config',
        severity: 'error',
        confidence: 'definite',
        message: 'config/approval-config.json is missing',
        remediation: [
          'Create config/approval-config.json with: version, approval_channel_id, authorized_user_id, reaction_mapping, state_file, expiry_hours.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { path: p },
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(await ctx.fs.readFile(p));
    } catch {
      return {
        checkId: 'CFG-001',
        checkName: 'Approval Config Valid',
        category: 'config',
        severity: 'error',
        confidence: 'definite',
        message: 'config/approval-config.json contains invalid JSON',
        remediation: ['Fix JSON syntax errors in config/approval-config.json.'],
        checkedAt: new Date().toISOString(),
        meta: { path: p },
      };
    }

    try {
      ApprovalConfigSchema.parse(parsed);
    } catch (e) {
      const issues =
        e instanceof ZodError
          ? e.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
          : String(e);
      return {
        checkId: 'CFG-001',
        checkName: 'Approval Config Valid',
        category: 'config',
        severity: 'error',
        confidence: 'definite',
        message: `config/approval-config.json schema invalid: ${issues}`,
        remediation: ['Ensure all required fields are present, non-empty, and correctly typed.'],
        checkedAt: new Date().toISOString(),
        meta: { issues },
      };
    }

    return null;
  },
};

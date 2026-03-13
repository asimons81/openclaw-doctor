import * as path from 'node:path';
import { ZodError } from 'zod';
import type { Check, CheckContext, Finding } from '../../types/index.js';
import { EnvironmentJsonSchema } from '../../schemas/environment.js';

export const ws005: Check = {
  id: 'WS-005',
  name: 'ENVIRONMENT.json Valid',
  category: 'workspace',
  maxSeverity: 'error',
  description:
    'Verifies ENVIRONMENT.json exists, parses as valid JSON, and passes schema validation. This file is the machine-readable canonical source of truth for workspace paths and integration settings.',
  reads: ['ENVIRONMENT.json'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'ENVIRONMENT.json');

    if (!await ctx.fs.fileExists(p)) {
      return {
        checkId: 'WS-005',
        checkName: 'ENVIRONMENT.json Valid',
        category: 'workspace',
        severity: 'error',
        confidence: 'definite',
        message: 'ENVIRONMENT.json is missing',
        remediation: [
          'Create ENVIRONMENT.json with version, workspace.root, workspace.memory, workspace.logs, workspace.skills.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { path: p },
      };
    }

    let raw: string;
    try {
      raw = await ctx.fs.readFile(p);
    } catch {
      return {
        checkId: 'WS-005',
        checkName: 'ENVIRONMENT.json Valid',
        category: 'workspace',
        severity: 'error',
        confidence: 'definite',
        message: 'ENVIRONMENT.json could not be read',
        remediation: [`Check file permissions: ls -la ${p}`],
        checkedAt: new Date().toISOString(),
        meta: { path: p },
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        checkId: 'WS-005',
        checkName: 'ENVIRONMENT.json Valid',
        category: 'workspace',
        severity: 'error',
        confidence: 'definite',
        message: 'ENVIRONMENT.json contains invalid JSON',
        remediation: [
          `Validate syntax: node -e "JSON.parse(require('fs').readFileSync('${p}','utf8'))"`,
        ],
        checkedAt: new Date().toISOString(),
        meta: { path: p },
      };
    }

    try {
      EnvironmentJsonSchema.parse(parsed);
    } catch (e) {
      const issues =
        e instanceof ZodError
          ? e.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
          : String(e);
      return {
        checkId: 'WS-005',
        checkName: 'ENVIRONMENT.json Valid',
        category: 'workspace',
        severity: 'error',
        confidence: 'definite',
        message: `ENVIRONMENT.json schema validation failed: ${issues}`,
        remediation: [
          'Ensure ENVIRONMENT.json includes: version (string), workspace.root, workspace.memory, workspace.logs, workspace.skills.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { path: p, issues },
      };
    }

    return null;
  },
};

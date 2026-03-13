import * as path from 'node:path';
import yaml from 'js-yaml';
import { ZodError } from 'zod';
import type { Check, CheckContext, Finding } from '../../types/index.js';
import { DiscordConfigSchema } from '../../schemas/discord-config.js';

export const cfg002: Check = {
  id: 'CFG-002',
  name: 'Discord Config Valid',
  category: 'config',
  maxSeverity: 'warn',
  description:
    'Verifies discord-config.yaml exists, parses as valid YAML, and contains required channels and agents sections. This file drives agent-to-channel routing for all Discord output.',
  reads: ['discord-config.yaml'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'discord-config.yaml');

    if (!await ctx.fs.fileExists(p)) {
      return {
        checkId: 'CFG-002',
        checkName: 'Discord Config Valid',
        category: 'config',
        severity: 'warn',
        confidence: 'definite',
        message: 'discord-config.yaml is missing',
        remediation: [
          'Create discord-config.yaml with channels, agents, and log-routing sections.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { path: p },
      };
    }

    let parsed: unknown;
    try {
      parsed = yaml.load(await ctx.fs.readFile(p));
    } catch {
      return {
        checkId: 'CFG-002',
        checkName: 'Discord Config Valid',
        category: 'config',
        severity: 'warn',
        confidence: 'definite',
        message: 'discord-config.yaml has YAML syntax errors',
        remediation: ['Fix YAML syntax errors in discord-config.yaml.'],
        checkedAt: new Date().toISOString(),
        meta: { path: p },
      };
    }

    try {
      DiscordConfigSchema.parse(parsed);
    } catch (e) {
      const issues =
        e instanceof ZodError
          ? e.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
          : String(e);
      return {
        checkId: 'CFG-002',
        checkName: 'Discord Config Valid',
        category: 'config',
        severity: 'warn',
        confidence: 'definite',
        message: `discord-config.yaml schema invalid: ${issues}`,
        remediation: [
          'Ensure channels and agents sections are present with at least one entry each.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { issues },
      };
    }

    return null;
  },
};

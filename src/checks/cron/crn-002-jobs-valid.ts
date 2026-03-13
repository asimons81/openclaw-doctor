import * as path from 'node:path';
import { ZodError } from 'zod';
import type { Check, CheckContext, Finding } from '../../types/index.js';
import { CronJobSchema } from '../../schemas/cron-job.js';

export const crn002: Check = {
  id: 'CRN-002',
  name: 'Cron Job Files Valid',
  category: 'cron',
  maxSeverity: 'error',
  description:
    'Reads all *.json files in cron/ and validates each against the CronJob schema. Malformed or schema-invalid cron definitions will silently fail to schedule.',
  reads: ['cron/*.json'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const cronDir = path.join(ctx.workspaceRoot, 'cron');
    if (!await ctx.fs.dirExists(cronDir)) return null;

    const files = (await ctx.fs.listDir(cronDir)).filter(f => f.endsWith('.json'));
    if (files.length === 0) return null;

    const invalid: string[] = [];
    for (const file of files) {
      const fp = path.join(cronDir, file);
      try {
        const parsed = JSON.parse(await ctx.fs.readFile(fp));
        CronJobSchema.parse(parsed);
      } catch (e) {
        const reason =
          e instanceof ZodError
            ? e.issues.map(i => i.message).join('; ')
            : e instanceof SyntaxError
              ? 'invalid JSON'
              : String(e);
        invalid.push(`${file}: ${reason}`);
      }
    }

    if (invalid.length === 0) return null;

    return {
      checkId: 'CRN-002',
      checkName: 'Cron Job Files Valid',
      category: 'cron',
      severity: 'error',
      confidence: 'definite',
      message: `${invalid.length} of ${files.length} cron job file(s) failed schema validation`,
      detail: invalid.join('\n'),
      remediation: [
        'Fix the listed cron job files.',
        'Required fields: id, name, schedule (kind/expr/tz), state (consecutiveErrors), enabled, payload (kind).',
      ],
      checkedAt: new Date().toISOString(),
      meta: { invalidFiles: invalid, totalFiles: files.length },
    };
  },
};

import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';
import { CronJobSchema } from '../../schemas/cron-job.js';

const WARN_THRESHOLD = 2;
const ERROR_THRESHOLD = 5;

export const crn003: Check = {
  id: 'CRN-003',
  name: 'Cron Consecutive Errors',
  category: 'cron',
  maxSeverity: 'error',
  description: `Inspects state.consecutiveErrors in each cron job file. ${WARN_THRESHOLD}+ consecutive errors is a warning; ${ERROR_THRESHOLD}+ is an error. Consecutive errors that are not reset indicate a job that keeps failing with no one noticing.`,
  reads: ['cron/*.json'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const cronDir = path.join(ctx.workspaceRoot, 'cron');
    if (!await ctx.fs.dirExists(cronDir)) return null;

    const files = (await ctx.fs.listDir(cronDir)).filter(f => f.endsWith('.json'));
    const warnJobs: string[] = [];
    const errorJobs: string[] = [];

    for (const file of files) {
      try {
        const parsed = JSON.parse(
          await ctx.fs.readFile(path.join(cronDir, file)),
        );
        const r = CronJobSchema.safeParse(parsed);
        if (!r.success) continue;
        const n = r.data.state.consecutiveErrors;
        if (n >= ERROR_THRESHOLD) errorJobs.push(r.data.id);
        else if (n >= WARN_THRESHOLD) warnJobs.push(r.data.id);
      } catch {
        // skip — CRN-002 handles schema errors
      }
    }

    if (errorJobs.length > 0) {
      return {
        checkId: 'CRN-003',
        checkName: 'Cron Consecutive Errors',
        category: 'cron',
        severity: 'error',
        confidence: 'definite',
        message: `${errorJobs.length} cron job(s) have ${ERROR_THRESHOLD}+ consecutive errors`,
        remediation: [
          `Investigate the failing jobs: ${errorJobs.join(', ')}`,
          'After fixing, reset state.consecutiveErrors to 0 in the job file.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { errorJobs, warnJobs },
      };
    }

    if (warnJobs.length > 0) {
      return {
        checkId: 'CRN-003',
        checkName: 'Cron Consecutive Errors',
        category: 'cron',
        severity: 'warn',
        confidence: 'definite',
        message: `${warnJobs.length} cron job(s) have ${WARN_THRESHOLD}+ consecutive errors`,
        remediation: [`Investigate the failing jobs: ${warnJobs.join(', ')}`],
        checkedAt: new Date().toISOString(),
        meta: { warnJobs },
      };
    }

    return null;
  },
};

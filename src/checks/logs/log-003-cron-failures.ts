import * as path from 'node:path';
import type { Check, CheckContext, Finding, Severity } from '../../types/index.js';
import { CronFailureEntrySchema } from '../../schemas/log-entries.js';

const WINDOW_MS = 24 * 60 * 60 * 1000;

export const log003: Check = {
  id: 'LOG-003',
  name: 'Recent Cron Failures',
  category: 'logs',
  maxSeverity: 'error',
  description:
    'Counts cron job failures logged to logs/cron-failures.jsonl in the last 24 hours. 1–2 failures is informational; 3–4 is a warning; 5 or more is an error.',
  reads: ['logs/cron-failures.jsonl'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'logs', 'cron-failures.jsonl');
    if (!await ctx.fs.fileExists(p)) return null;

    const lines = await ctx.fs.readJsonl(p);
    const cutoff = Date.now() - WINDOW_MS;
    const recentJobs: string[] = [];

    for (const line of lines) {
      const r = CronFailureEntrySchema.safeParse(line);
      if (!r.success) continue;
      const ts = new Date(r.data.timestamp).getTime();
      if (!isNaN(ts) && ts >= cutoff) {
        recentJobs.push(r.data.job);
      }
    }

    const count = recentJobs.length;
    if (count === 0) return null;

    const severity: Severity = count >= 5 ? 'error' : count >= 3 ? 'warn' : 'info';
    const uniqueJobs = [...new Set(recentJobs)];

    return {
      checkId: 'LOG-003',
      checkName: 'Recent Cron Failures',
      category: 'logs',
      severity,
      confidence: 'definite',
      message: `${count} cron failure(s) in the last 24 hours across ${uniqueJobs.length} job(s)`,
      remediation: [
        `Investigate failing jobs: ${uniqueJobs.join(', ')}`,
        'Review logs/cron-failures.jsonl for error details.',
        'Note: Failures involving external dependencies (e.g., ComfyUI, APIs, remote services) are often transient and may not require fixes.',
      ],
      checkedAt: new Date().toISOString(),
      meta: { count, jobs: uniqueJobs },
    };
  },
};

import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';
import { MemoryIntegrityReportSchema } from '../../schemas/log-entries.js';

const MAX_AGE_HOURS = 48;

export const log005: Check = {
  id: 'LOG-005',
  name: 'Memory Integrity Report Age',
  category: 'logs',
  maxSeverity: 'error',
  description: `Checks that logs/memory-integrity-latest.json exists, was written within ${MAX_AGE_HOURS} hours (by file mtime), and did not report a failure in its overall field. This file is produced by scripts/memory/memory-integrity-check.sh.`,
  reads: ['logs/memory-integrity-latest.json'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'logs', 'memory-integrity-latest.json');

    if (!await ctx.fs.fileExists(p)) {
      return {
        checkId: 'LOG-005',
        checkName: 'Memory Integrity Report Age',
        category: 'logs',
        severity: 'warn',
        confidence: 'probable',
        message: 'No memory integrity report found at logs/memory-integrity-latest.json',
        remediation: [
          'If you use the memory integrity script, run scripts/memory/memory-integrity-check.sh to generate a fresh report.',
          'If your workspace does not use that script, treat this as a coverage gap rather than a confirmed failure.',
        ],
        checkedAt: new Date().toISOString(),
      };
    }

    // Check file age by mtime
    const mtime = await ctx.fs.modifiedAt(p);
    const ageHours = (Date.now() - mtime.getTime()) / (1000 * 60 * 60);

    if (ageHours > MAX_AGE_HOURS) {
      return {
        checkId: 'LOG-005',
        checkName: 'Memory Integrity Report Age',
        category: 'logs',
        severity: 'warn',
        confidence: 'probable',
        message: `Memory integrity report is ${Math.round(ageHours)}h old (freshness target: ${MAX_AGE_HOURS}h)`,
        remediation: [
          'Run scripts/memory/memory-integrity-check.sh to refresh the report if you rely on this signal.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { ageHours: Math.round(ageHours), maxAgeHours: MAX_AGE_HOURS },
      };
    }

    // Parse and check the overall result
    let parsed: unknown;
    try {
      parsed = JSON.parse(await ctx.fs.readFile(p));
    } catch {
      return null; // can't parse — don't double-report, file age check already passed
    }

    const result = MemoryIntegrityReportSchema.safeParse(parsed);
    if (!result.success) return null; // unknown format — skip

    const { overall, summary } = result.data;

    if (overall === 'fail') {
      return {
        checkId: 'LOG-005',
        checkName: 'Memory Integrity Report Age',
        category: 'logs',
        severity: 'error',
        confidence: 'definite',
        message: `Memory integrity check reports FAIL — ${summary.fail} check(s) failed`,
        remediation: [
          'Review logs/memory-integrity-latest.json for the specific failing checks.',
          'Run scripts/memory/memory-integrity-check.sh after fixing issues to confirm.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { overall, summary },
      };
    }

    if (overall === 'warn') {
      return {
        checkId: 'LOG-005',
        checkName: 'Memory Integrity Report Age',
        category: 'logs',
        severity: 'warn',
        confidence: 'definite',
        message: `Memory integrity check reports WARN — ${summary.warn} warning(s)`,
        remediation: [
          'Review logs/memory-integrity-latest.json for the specific warnings.',
          'Note: Some warnings may be legacy checks (e.g., deprecated iCloud paths) and not indicate actual problems.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { overall, summary },
      };
    }

    return null;
  },
};

import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

function dayBefore(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const mem003: Check = {
  id: 'MEM-003',
  name: 'Daily Memory Freshness',
  category: 'memory',
  maxSeverity: 'warn',
  description:
    "Verifies a daily memory file (YYYY-MM-DD.md) exists for today. If today's is missing, checks yesterday's — one day behind is info-level; two or more days behind is a warning indicating broken session continuity.",
  reads: ['memory/YYYY-MM-DD.md'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const todayFile = path.join(ctx.workspaceRoot, 'memory', `${ctx.today}.md`);
    if (await ctx.fs.fileExists(todayFile)) return null;

    const yesterday = dayBefore(ctx.today);
    const yesterdayFile = path.join(ctx.workspaceRoot, 'memory', `${yesterday}.md`);

    if (await ctx.fs.fileExists(yesterdayFile)) {
      return {
        checkId: 'MEM-003',
        checkName: 'Daily Memory Freshness',
        category: 'memory',
        severity: 'info',
        confidence: 'probable',
        message: `No daily memory file for today (${ctx.today}); yesterday's exists`,
        detail: 'Normal early in the day before the first session creates the daily file.',
        remediation: [`Create memory/${ctx.today}.md with the morning briefing.`],
        checkedAt: new Date().toISOString(),
        meta: { today: ctx.today, yesterday },
      };
    }

    return {
      checkId: 'MEM-003',
      checkName: 'Daily Memory Freshness',
      category: 'memory',
      severity: 'warn',
      confidence: 'probable',
      message: `No daily memory file for today (${ctx.today}) or yesterday (${yesterday})`,
      remediation: [
        `Create memory/${ctx.today}.md — memory continuity may be broken.`,
        'Check if the agent session completed normally on the last active day.',
      ],
      checkedAt: new Date().toISOString(),
      meta: { today: ctx.today, yesterday },
    };
  },
};

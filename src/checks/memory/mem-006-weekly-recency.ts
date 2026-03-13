import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

function isoWeekNumber(dateStr: string): number {
  const d = new Date(dateStr + 'T12:00:00Z');
  const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
  return Math.floor((d.getTime() - startOfWeek1.getTime()) / (7 * 86_400_000)) + 1;
}

function parseWeekFilename(filename: string): { year: number; week: number } | null {
  const m = filename.match(/^(\d{4})-W(\d{2})\.md$/);
  if (!m?.[1] || !m?.[2]) return null;
  return { year: parseInt(m[1], 10), week: parseInt(m[2], 10) };
}

function weeksBehind(fileYear: number, fileWeek: number, today: string): number {
  const todayYear = new Date(today + 'T12:00:00Z').getUTCFullYear();
  const todayWeek = isoWeekNumber(today);
  return (todayYear - fileYear) * 52 + (todayWeek - fileWeek);
}

export const mem006: Check = {
  id: 'MEM-006',
  name: 'Weekly Summary Recency',
  category: 'memory',
  maxSeverity: 'warn',
  description:
    'Checks memory/weekly/ for YYYY-Wnn.md Archivist distillation files. Warns if the most recent weekly summary is two or more weeks old, indicating the distillation cadence has lapsed.',
  reads: ['memory/weekly/'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const weeklyDir = path.join(ctx.workspaceRoot, 'memory', 'weekly');

    if (!await ctx.fs.dirExists(weeklyDir)) {
      return {
        checkId: 'MEM-006',
        checkName: 'Weekly Summary Recency',
        category: 'memory',
        severity: 'warn',
        confidence: 'definite',
        message: 'memory/weekly/ directory does not exist — no weekly summaries produced yet',
        remediation: [
          'Create memory/weekly/ and ask the Archivist agent to produce a weekly distillation.',
        ],
        checkedAt: new Date().toISOString(),
      };
    }

    const entries = await ctx.fs.listDir(weeklyDir);
    const weekFiles = entries.filter(e => /^\d{4}-W\d{2}\.md$/.test(e));

    if (weekFiles.length === 0) {
      return {
        checkId: 'MEM-006',
        checkName: 'Weekly Summary Recency',
        category: 'memory',
        severity: 'warn',
        confidence: 'definite',
        message: 'No weekly summary files found in memory/weekly/',
        remediation: [
          'Ask the Archivist agent to produce a weekly distillation file (YYYY-Wnn.md).',
        ],
        checkedAt: new Date().toISOString(),
      };
    }

    const latest = weekFiles.sort().at(-1);
    if (!latest) return null;
    const parsed = parseWeekFilename(latest);
    if (!parsed) return null;

    const age = weeksBehind(parsed.year, parsed.week, ctx.today);
    if (age >= 2) {
      return {
        checkId: 'MEM-006',
        checkName: 'Weekly Summary Recency',
        category: 'memory',
        severity: 'warn',
        confidence: 'probable',
        message: `Latest weekly summary (${latest}) is ${age} week(s) behind`,
        remediation: [
          'Ask the Archivist agent to produce a weekly distillation for the current week.',
        ],
        checkedAt: new Date().toISOString(),
        meta: { latest, weeksOld: age },
      };
    }

    return null;
  },
};

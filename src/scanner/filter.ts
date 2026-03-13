import { SeverityLevel, type Category, type Check, type Severity } from '../types/index.js';

export function filterChecks(
  checks: Check[],
  opts: { checkIds?: string[]; categories?: Category[]; minSeverity?: Severity },
): { toRun: Check[]; skipped: string[] } {
  const toRun: Check[] = [];
  const skipped: string[] = [];

  for (const check of checks) {
    if (opts.checkIds && opts.checkIds.length > 0 && !opts.checkIds.includes(check.id)) {
      skipped.push(check.id);
      continue;
    }
    if (
      opts.categories &&
      opts.categories.length > 0 &&
      !opts.categories.includes(check.category)
    ) {
      skipped.push(check.id);
      continue;
    }
    if (opts.minSeverity) {
      if (SeverityLevel[check.maxSeverity] < SeverityLevel[opts.minSeverity]) {
        skipped.push(check.id);
        continue;
      }
    }
    toRun.push(check);
  }

  return { toRun, skipped };
}

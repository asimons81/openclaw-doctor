import {
  SeverityLevel,
  type Category,
  type Check,
  type CheckContext,
  type Finding,
  type ScanOptions,
  type ScanResult,
  type ScanSummary,
  type Severity,
} from '../types/index.js';
import { buildContext } from '../context/context.js';
import { type CheckRegistry, registry as defaultRegistry } from './registry.js';
import { filterChecks } from './filter.js';

const CHECK_TIMEOUT_MS = 10_000;

export async function runScan(
  options: ScanOptions,
  reg: CheckRegistry = defaultRegistry,
): Promise<ScanResult> {
  const ctx = buildContext(options.workspaceRoot, options.today);
  const scannedAt = new Date().toISOString();

  const { toRun, skipped } = filterChecks(reg.getAll(), {
    ...(options.checkIds !== undefined && { checkIds: options.checkIds }),
    ...(options.categories !== undefined && { categories: options.categories }),
    minSeverity: options.minSeverity ?? 'info',
  });

  const results = await Promise.allSettled(toRun.map(check => runCheckSafe(check, ctx)));

  const findings: Finding[] = [];
  const passed: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const check = toRun[i];
    if (!result || !check) continue;

    if (result.status === 'fulfilled') {
      if (result.value !== null) {
        findings.push(result.value);
      } else {
        passed.push(check.id);
      }
    } else {
      findings.push(makeInternalErrorFinding(check, result.reason));
    }
  }

  findings.sort(compareFinding);

  return {
    workspaceRoot: options.workspaceRoot,
    scannedAt,
    today: ctx.today,
    findings,
    passed: options.verbose ? passed : [],
    skipped,
    summary: buildSummary(findings, {
      totalChecks: reg.getAll().length,
      executedChecks: toRun.length,
      passedChecks: passed.length,
      skippedChecks: skipped.length,
    }),
  };
}

async function runCheckSafe(check: Check, ctx: CheckContext): Promise<Finding | null> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Check timed out after ${CHECK_TIMEOUT_MS}ms`)),
        CHECK_TIMEOUT_MS,
      ),
    );
    return await Promise.race([check.run(ctx), timeout]);
  } catch (err) {
    return makeInternalErrorFinding(check, err);
  }
}

function makeInternalErrorFinding(check: Check, err: unknown): Finding {
  const message = err instanceof Error ? err.message : String(err);
  return {
    checkId: check.id,
    checkName: check.name,
    category: check.category,
    severity: 'error',
    confidence: 'definite',
    message: `Check threw an unexpected error: ${message}`,
    remediation: ['Report this as a bug in OpenClawDoctor+.'],
    checkedAt: new Date().toISOString(),
    meta: { internalError: true },
  };
}

function compareFinding(a: Finding, b: Finding): number {
  const sevDiff = SeverityLevel[b.severity] - SeverityLevel[a.severity];
  if (sevDiff !== 0) return sevDiff;
  if (a.category < b.category) return -1;
  if (a.category > b.category) return 1;
  return a.checkId.localeCompare(b.checkId);
}

function buildSummary(
  findings: Finding[],
  counts: {
    totalChecks: number;
    executedChecks: number;
    passedChecks: number;
    skippedChecks: number;
  },
): ScanSummary {
  const bySeverity: Partial<Record<Severity, number>> = {};
  const byCategory: Partial<Record<Category, number>> = {};

  for (const f of findings) {
    bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
    byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
  }

  let overallSeverity: Severity = 'pass';
  for (const sev of Object.keys(bySeverity) as Severity[]) {
    if (SeverityLevel[sev] > SeverityLevel[overallSeverity]) {
      overallSeverity = sev;
    }
  }

  return {
    total: findings.length,
    totalChecks: counts.totalChecks,
    executedChecks: counts.executedChecks,
    passedChecks: counts.passedChecks,
    skippedChecks: counts.skippedChecks,
    bySeverity,
    byCategory,
    overallSeverity,
  };
}

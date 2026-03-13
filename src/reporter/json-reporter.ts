import type { ScanResult } from '../types/index.js';

export function renderJson(result: ScanResult, pretty = true): string {
  return JSON.stringify(
    {
      schemaVersion: 1,
      scan: {
        workspaceRoot: result.workspaceRoot,
        scannedAt: result.scannedAt,
        today: result.today,
      },
      summary: {
        overallSeverity: result.summary.overallSeverity,
        findingCount: result.summary.total,
        totalChecks: result.summary.totalChecks,
        executedChecks: result.summary.executedChecks,
        passedChecks: result.summary.passedChecks,
        skippedChecks: result.summary.skippedChecks,
        bySeverity: {
          critical: result.summary.bySeverity.critical ?? 0,
          error: result.summary.bySeverity.error ?? 0,
          warn: result.summary.bySeverity.warn ?? 0,
          info: result.summary.bySeverity.info ?? 0,
        },
        byCategory: {
          workspace: result.summary.byCategory.workspace ?? 0,
          memory: result.summary.byCategory.memory ?? 0,
          config: result.summary.byCategory.config ?? 0,
          logs: result.summary.byCategory.logs ?? 0,
          cron: result.summary.byCategory.cron ?? 0,
          agents: result.summary.byCategory.agents ?? 0,
        },
      },
      findings: result.findings,
      passed: result.passed,
      skipped: result.skipped,
    },
    null,
    pretty ? 2 : 0,
  );
}

import kleur from 'kleur';
import type { Category, Finding, ScanResult, Severity } from '../types/index.js';

const SEVERITY_BADGE: Record<Severity, string> = {
  critical: kleur.bgRed().white().bold(' CRIT  '),
  error: kleur.red().bold('[ERROR] '),
  warn: kleur.yellow().bold('[WARN]  '),
  info: kleur.cyan('[INFO]  '),
  pass: kleur.green('[PASS]  '),
};

const CATEGORY_LABEL: Record<Category, string> = {
  workspace: 'Workspace',
  memory: 'Memory',
  config: 'Config',
  logs: 'Logs',
  cron: 'Cron',
  agents: 'Agents',
};

export function renderTerminal(result: ScanResult, verbose: boolean): string {
  const lines: string[] = [];
  const statusTone =
    result.summary.overallSeverity === 'pass'
      ? kleur.green
      : result.summary.overallSeverity === 'info'
        ? kleur.cyan
        : result.summary.overallSeverity === 'warn'
          ? kleur.yellow
          : kleur.red;

  lines.push(kleur.bold().white('OpenClawDoctor+') + kleur.dim('  workspace scan'));
  lines.push(kleur.dim('Workspace ') + result.workspaceRoot);
  lines.push(kleur.dim('Scanned   ') + result.scannedAt);
  lines.push(
    kleur.dim('Status    ') +
      statusTone().bold(result.summary.overallSeverity.toUpperCase()) +
      kleur.dim(
        `  (${result.summary.total} finding${result.summary.total === 1 ? '' : 's'} across ${result.summary.executedChecks} executed checks)`,
      ),
  );
  lines.push('');

  if (result.findings.length === 0) {
    lines.push(kleur.green().bold('All checks passed. No findings.'));
  } else {
    const groups = new Map<Category, Finding[]>();
    for (const f of result.findings) {
      if (!groups.has(f.category)) groups.set(f.category, []);
      groups.get(f.category)!.push(f);
    }

    for (const [cat, findings] of groups) {
      lines.push(kleur.bold().dim(`${CATEGORY_LABEL[cat]} (${findings.length})`));
      for (const f of findings) {
        const badge = SEVERITY_BADGE[f.severity];
        lines.push(`  ${badge} ${kleur.bold(f.checkId.padEnd(8))}  ${f.message}`);
        if (f.confidence !== 'definite') {
          lines.push(kleur.dim(`              confidence: ${f.confidence}`));
        }
        for (const step of f.remediation.slice(0, 2)) {
          lines.push(kleur.dim(`              → ${step}`));
        }
      }
      lines.push('');
    }
  }

  if (verbose && result.passed.length > 0) {
    lines.push(kleur.dim('Passed (' + result.passed.length + ')'));
    // Print in rows of 6 for compactness
    for (let i = 0; i < result.passed.length; i += 6) {
      lines.push(kleur.dim('  ' + result.passed.slice(i, i + 6).join('  ')));
    }
    lines.push('');
  }

  const s = result.summary;
  const overallColor =
    s.overallSeverity === 'pass' || s.overallSeverity === 'info'
      ? kleur.green
      : s.overallSeverity === 'warn'
        ? kleur.yellow
        : kleur.red;

  lines.push(kleur.dim('─'.repeat(60)));
  lines.push(
    overallColor().bold(`Overall: ${s.overallSeverity.toUpperCase()}`) +
      kleur.dim('  │  ') +
      [
        kleur.red(`${s.bySeverity.critical ?? 0} critical`),
        kleur.red(`${s.bySeverity.error ?? 0} error`),
        kleur.yellow(`${s.bySeverity.warn ?? 0} warn`),
        kleur.cyan(`${s.bySeverity.info ?? 0} info`),
      ].join(kleur.dim(' · ')) +
      kleur.dim(
        `  │  ${s.passedChecks} passed · ${s.skippedChecks} skipped · ${s.totalChecks} total`,
      ),
  );

  return lines.join('\n');
}

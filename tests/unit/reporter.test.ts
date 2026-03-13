import { describe, expect, it } from 'vitest';
import { renderJson } from '../../src/reporter/json-reporter.js';
import { renderMarkdown } from '../../src/reporter/markdown-reporter.js';
import { renderTerminal } from '../../src/reporter/terminal.js';
import type { ScanResult } from '../../src/types/index.js';

const baseResult: ScanResult = {
  workspaceRoot: '/workspace',
  scannedAt: '2026-03-13T16:55:20.269Z',
  today: '2026-03-13',
  findings: [
    {
      checkId: 'LOG-005',
      checkName: 'Memory Integrity Report Age',
      category: 'logs',
      severity: 'warn',
      confidence: 'probable',
      message: 'Memory integrity report is 73h old (freshness target: 48h)',
      remediation: [
        'Run scripts/memory/memory-integrity-check.sh to refresh the report if you rely on this signal.',
      ],
      checkedAt: '2026-03-13T16:55:20.269Z',
    },
  ],
  passed: ['WS-001', 'WS-002'],
  skipped: ['AGT-002'],
  summary: {
    total: 1,
    totalChecks: 25,
    executedChecks: 24,
    passedChecks: 23,
    skippedChecks: 1,
    byCategory: { logs: 1 },
    bySeverity: { warn: 1 },
    overallSeverity: 'warn',
  },
};

describe('reporters', () => {
  it('renders stable JSON with zero-filled counts', () => {
    const parsed = JSON.parse(renderJson(baseResult)) as Record<string, unknown>;
    const summary = parsed['summary'] as Record<string, unknown>;
    const bySeverity = summary['bySeverity'] as Record<string, number>;
    const byCategory = summary['byCategory'] as Record<string, number>;

    expect(parsed['schemaVersion']).toBe(1);
    expect(summary['totalChecks']).toBe(25);
    expect(summary['executedChecks']).toBe(24);
    expect(bySeverity['critical']).toBe(0);
    expect(bySeverity['warn']).toBe(1);
    expect(byCategory['logs']).toBe(1);
    expect(byCategory['agents']).toBe(0);
  });

  it('renders terminal output with scan stats and confidence labels', () => {
    const output = renderTerminal(baseResult, false);

    expect(output).toContain('workspace scan');
    expect(output).toContain('24 executed checks');
    expect(output).toContain('confidence: probable');
    expect(output).toContain('23 passed');
    expect(output).toContain('25 total');
  });

  it('renders markdown suitable for issue threads', () => {
    const output = renderMarkdown(baseResult);

    expect(output).toContain('# OpenClawDoctor+ Scan Report');
    expect(output).toContain('Checks: 24 executed, 23 passed, 1 skipped');
    expect(output).toContain('#### `LOG-005` Memory Integrity Report Age');
    expect(output).toContain('- Remediation:');
  });
});

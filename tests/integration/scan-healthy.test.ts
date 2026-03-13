/**
 * Integration test: full scan against the healthy-workspace fixture.
 *
 * Uses the real NodeFileSystemAdapter so it exercises actual disk reads.
 * The fixture directory is designed to make all critical and error checks pass.
 *
 * We fix `today` to '2026-03-13' so date-sensitive checks (MEM-003, MEM-006)
 * match the fixture files and produce deterministic results.
 *
 * Expected outcome: 0 critical, 0 error findings.
 * A few info findings are acceptable (e.g. AGT-001 if agent dirs are absent).
 */
import * as path from 'node:path';
import * as url from 'node:url';
import { describe, expect, it } from 'vitest';
import { CheckRegistry } from '../../src/scanner/registry.js';
import { runScan } from '../../src/scanner/scanner.js';

// Import all checks to populate a fresh registry
import { ws001 } from '../../src/checks/workspace/ws-001-root-exists.js';
import { ws002 } from '../../src/checks/workspace/ws-002-soul-present.js';
import { ws003 } from '../../src/checks/workspace/ws-003-user-present.js';
import { ws004 } from '../../src/checks/workspace/ws-004-agents-present.js';
import { ws005 } from '../../src/checks/workspace/ws-005-env-valid.js';
import { mem001 } from '../../src/checks/memory/mem-001-dir-exists.js';
import { mem002 } from '../../src/checks/memory/mem-002-memory-md.js';
import { mem003 } from '../../src/checks/memory/mem-003-daily-fresh.js';
import { mem004 } from '../../src/checks/memory/mem-004-active-projects.js';
import { mem005 } from '../../src/checks/memory/mem-005-open-loops.js';
import { mem006 } from '../../src/checks/memory/mem-006-weekly-recency.js';
import { cfg001 } from '../../src/checks/config/cfg-001-approval.js';
import { cfg002 } from '../../src/checks/config/cfg-002-discord.js';
import { cfg003 } from '../../src/checks/config/cfg-003-env-paths.js';
import { cfg004 } from '../../src/checks/config/cfg-004-operational-context.js';
import { log001 } from '../../src/checks/logs/log-001-ledger-exists.js';
import { log002 } from '../../src/checks/logs/log-002-ledger-schema.js';
import { log003 } from '../../src/checks/logs/log-003-cron-failures.js';
import { log004 } from '../../src/checks/logs/log-004-approval-expiry.js';
import { log005 } from '../../src/checks/logs/log-005-integrity-age.js';
import { crn001 } from '../../src/checks/cron/crn-001-dir-exists.js';
import { crn002 } from '../../src/checks/cron/crn-002-jobs-valid.js';
import { crn003 } from '../../src/checks/cron/crn-003-consecutive-errors.js';
import { agt001 } from '../../src/checks/agents/agt-001-dirs-present.js';
import { agt002 } from '../../src/checks/agents/agt-002-log-freshness.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.resolve(__dirname, '../fixtures/workspace');

function buildRegistry(): CheckRegistry {
  const reg = new CheckRegistry();
  for (const check of [
    ws001, ws002, ws003, ws004, ws005,
    mem001, mem002, mem003, mem004, mem005, mem006,
    cfg001, cfg002, cfg003, cfg004,
    log001, log002, log003, log004, log005,
    crn001, crn002, crn003,
    agt001, agt002,
  ]) {
    reg.register(check);
  }
  return reg;
}

describe('Integration: healthy workspace scan', () => {
  it('produces no critical or error findings', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: FIXTURE_ROOT, today: '2026-03-13' },
      reg,
    );

    const critical = result.summary.bySeverity.critical ?? 0;
    const errors = result.summary.bySeverity.error ?? 0;

    if (critical > 0 || errors > 0) {
      const bad = result.findings
        .filter(f => f.severity === 'critical' || f.severity === 'error')
        .map(f => `  ${f.checkId}: ${f.message}`)
        .join('\n');
      throw new Error(`Expected no critical/error findings, got:\n${bad}`);
    }

    expect(critical).toBe(0);
    expect(errors).toBe(0);
  });

  it('scans all 25 checks', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: FIXTURE_ROOT, today: '2026-03-13', verbose: true },
      reg,
    );
    const totalChecked = result.findings.length + result.passed.length + result.skipped.length;
    expect(totalChecked).toBe(25);
  });

  it('overall severity is at most warn', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: FIXTURE_ROOT, today: '2026-03-13' },
      reg,
    );
    const sev = result.summary.overallSeverity;
    expect(['pass', 'info', 'warn']).toContain(sev);
  });

  it('WS-001 passes (workspace root exists)', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: FIXTURE_ROOT, today: '2026-03-13', checkIds: ['WS-001'] },
      reg,
    );
    const ws001Finding = result.findings.find(f => f.checkId === 'WS-001');
    expect(ws001Finding).toBeUndefined(); // should have passed (no finding)
  });

  it('MEM-003 passes when today file exists in fixture', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: FIXTURE_ROOT, today: '2026-03-13', checkIds: ['MEM-003'] },
      reg,
    );
    const finding = result.findings.find(f => f.checkId === 'MEM-003');
    expect(finding).toBeUndefined();
  });
});

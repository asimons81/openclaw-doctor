/**
 * Integration test: full scan against the broken-workspace fixture.
 *
 * The broken workspace contains only SOUL.md. Every other required file is absent.
 * This exercises critical and error checks at scale.
 *
 * Expected: multiple critical/error findings, overall severity = critical.
 */
import * as path from 'node:path';
import * as url from 'node:url';
import { describe, expect, it } from 'vitest';
import { CheckRegistry } from '../../src/scanner/registry.js';
import { runScan } from '../../src/scanner/scanner.js';

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
const BROKEN_ROOT = path.resolve(__dirname, '../fixtures/broken-workspace');

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

describe('Integration: broken workspace scan', () => {
  it('overall severity is critical', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: BROKEN_ROOT, today: '2026-03-13' },
      reg,
    );
    expect(result.summary.overallSeverity).toBe('critical');
  });

  it('produces at least 5 findings', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: BROKEN_ROOT, today: '2026-03-13' },
      reg,
    );
    expect(result.findings.length).toBeGreaterThanOrEqual(5);
  });

  it('WS-002 passes (SOUL.md exists in broken workspace)', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: BROKEN_ROOT, today: '2026-03-13', checkIds: ['WS-002'] },
      reg,
    );
    const finding = result.findings.find(f => f.checkId === 'WS-002');
    expect(finding).toBeUndefined(); // SOUL.md IS present in broken workspace
  });

  it('WS-003 fires (USER.md is missing)', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: BROKEN_ROOT, today: '2026-03-13', checkIds: ['WS-003'] },
      reg,
    );
    const finding = result.findings.find(f => f.checkId === 'WS-003');
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('warn');
  });

  it('WS-004 fires (AGENTS.md is missing)', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: BROKEN_ROOT, today: '2026-03-13', checkIds: ['WS-004'] },
      reg,
    );
    const finding = result.findings.find(f => f.checkId === 'WS-004');
    expect(finding?.severity).toBe('error');
  });

  it('MEM-001 fires (memory/ dir missing)', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: BROKEN_ROOT, today: '2026-03-13', checkIds: ['MEM-001'] },
      reg,
    );
    const finding = result.findings.find(f => f.checkId === 'MEM-001');
    expect(finding?.severity).toBe('critical');
  });

  it('LOG-001 fires (task-ledger.jsonl missing)', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: BROKEN_ROOT, today: '2026-03-13', checkIds: ['LOG-001'] },
      reg,
    );
    const finding = result.findings.find(f => f.checkId === 'LOG-001');
    expect(finding?.severity).toBe('error');
  });

  it('findings are sorted severity-descending', async () => {
    const reg = buildRegistry();
    const result = await runScan(
      { workspaceRoot: BROKEN_ROOT, today: '2026-03-13' },
      reg,
    );
    const sevOrder = ['critical', 'error', 'warn', 'info', 'pass'];
    let lastIdx = -1;
    for (const f of result.findings) {
      const idx = sevOrder.indexOf(f.severity);
      expect(idx).toBeGreaterThanOrEqual(lastIdx);
      lastIdx = idx;
    }
  });
});

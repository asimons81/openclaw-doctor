import { describe, expect, it } from 'vitest';
import { log001 } from '../../../src/checks/logs/log-001-ledger-exists.js';
import { log002 } from '../../../src/checks/logs/log-002-ledger-schema.js';
import { log003 } from '../../../src/checks/logs/log-003-cron-failures.js';
import { log005 } from '../../../src/checks/logs/log-005-integrity-age.js';
import { makeContext } from '../../helpers/make-context.js';

const ROOT = '/workspace';

const VALID_ENTRY = JSON.stringify({
  id: 'task-001',
  agent: 'forge',
  task: 'Build MVP',
  status: 'complete',
  started_at: '2026-03-13T08:00:00Z',
});

const INTEGRITY_PASS = JSON.stringify({
  timestamp: '2026-03-13T06:00:00Z',
  overall: 'pass',
  checks: [{ name: 'test', level: 'pass', detail: 'ok' }],
  summary: { pass: 1, warn: 0, fail: 0 },
});

const INTEGRITY_FAIL = JSON.stringify({
  timestamp: '2026-03-13T06:00:00Z',
  overall: 'fail',
  checks: [{ name: 'memory-dir', level: 'fail', detail: 'missing' }],
  summary: { pass: 0, warn: 0, fail: 1 },
});

describe('LOG-001 Task Ledger Exists', () => {
  it('returns null when task-ledger.jsonl exists', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/logs/task-ledger.jsonl`]: VALID_ENTRY });
    expect(await log001.run(ctx)).toBeNull();
  });

  it('returns error when task-ledger.jsonl is missing', async () => {
    const ctx = makeContext(ROOT, {});
    const f = await log001.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.checkId).toBe('LOG-001');
  });
});

describe('LOG-002 Task Ledger Schema', () => {
  it('returns null for valid entries', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/logs/task-ledger.jsonl`]: VALID_ENTRY });
    expect(await log002.run(ctx)).toBeNull();
  });

  it('returns null for empty file', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/logs/task-ledger.jsonl`]: '' });
    expect(await log002.run(ctx)).toBeNull();
  });

  it('returns warn when entries have malformed JSON', async () => {
    const ctx = makeContext(ROOT, {
      [`${ROOT}/logs/task-ledger.jsonl`]: 'not json\n',
    });
    const f = await log002.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('LOG-002');
  });

  it('returns warn when entries are missing required fields', async () => {
    const bad = JSON.stringify({ id: 'x' }); // missing agent, task, status, started_at
    const ctx = makeContext(ROOT, { [`${ROOT}/logs/task-ledger.jsonl`]: bad });
    const f = await log002.run(ctx);
    expect(f?.severity).toBe('warn');
  });
});

describe('LOG-003 Recent Cron Failures', () => {
  it('returns null when cron-failures.jsonl is missing', async () => {
    const ctx = makeContext(ROOT, {});
    expect(await log003.run(ctx)).toBeNull();
  });

  it('returns null when no recent failures', async () => {
    // Old failure (30 days ago)
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const entry = JSON.stringify({ job: 'on-this-day', timestamp: old, error: 'timeout' });
    const ctx = makeContext(ROOT, { [`${ROOT}/logs/cron-failures.jsonl`]: entry });
    expect(await log003.run(ctx)).toBeNull();
  });

  it('returns info for 1 recent failure', async () => {
    const recent = new Date().toISOString();
    const entry = JSON.stringify({ job: 'on-this-day', timestamp: recent, error: 'timeout' });
    const ctx = makeContext(ROOT, { [`${ROOT}/logs/cron-failures.jsonl`]: entry });
    const f = await log003.run(ctx);
    expect(f?.severity).toBe('info');
  });

  it('returns error for 5+ recent failures', async () => {
    const recent = new Date().toISOString();
    const entries = Array.from({ length: 5 }, (_, i) =>
      JSON.stringify({ job: `job-${i}`, timestamp: recent, error: 'fail' }),
    ).join('\n');
    const ctx = makeContext(ROOT, { [`${ROOT}/logs/cron-failures.jsonl`]: entries });
    const f = await log003.run(ctx);
    expect(f?.severity).toBe('error');
  });
});

describe('LOG-005 Memory Integrity Report Age', () => {
  it('returns null when report is recent and passes', async () => {
    const recentMtime = new Date();
    const ctx = makeContext(
      ROOT,
      { [`${ROOT}/logs/memory-integrity-latest.json`]: INTEGRITY_PASS },
      '2026-03-13',
      { [`${ROOT}/logs/memory-integrity-latest.json`]: recentMtime },
    );
    expect(await log005.run(ctx)).toBeNull();
  });

  it('returns warn when file is missing', async () => {
    const ctx = makeContext(ROOT, {});
    const f = await log005.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('LOG-005');
  });

  it('returns warn when file mtime is older than 48h', async () => {
    const staleMtime = new Date(Date.now() - 49 * 60 * 60 * 1000);
    const ctx = makeContext(
      ROOT,
      { [`${ROOT}/logs/memory-integrity-latest.json`]: INTEGRITY_PASS },
      '2026-03-13',
      { [`${ROOT}/logs/memory-integrity-latest.json`]: staleMtime },
    );
    const f = await log005.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.message).toMatch(/old/i);
  });

  it('returns error when overall is fail', async () => {
    const recentMtime = new Date();
    const ctx = makeContext(
      ROOT,
      { [`${ROOT}/logs/memory-integrity-latest.json`]: INTEGRITY_FAIL },
      '2026-03-13',
      { [`${ROOT}/logs/memory-integrity-latest.json`]: recentMtime },
    );
    const f = await log005.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.message).toMatch(/fail/i);
  });
});

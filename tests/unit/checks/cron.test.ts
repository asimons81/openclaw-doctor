import { describe, expect, it } from 'vitest';
import { crn001 } from '../../../src/checks/cron/crn-001-dir-exists.js';
import { crn002 } from '../../../src/checks/cron/crn-002-jobs-valid.js';
import { crn003 } from '../../../src/checks/cron/crn-003-consecutive-errors.js';
import { makeContext } from '../../helpers/make-context.js';

const ROOT = '/workspace';

const VALID_JOB = JSON.stringify({
  id: 'test-job',
  name: 'Test Job',
  schedule: { kind: 'cron', expr: '0 8 * * *', tz: 'America/Chicago' },
  agent: null,
  state: {
    consecutiveErrors: 0,
    lastRunStatus: null,
    lastRunAtMs: null,
  },
  enabled: true,
  payload: { kind: 'agentTurn', message: 'Run test' },
});

const JOB_WITH_ERRORS = (n: number) =>
  JSON.stringify({
    id: `job-${n}-errors`,
    name: `Job With ${n} Errors`,
    schedule: { kind: 'cron', expr: '0 8 * * *', tz: 'UTC' },
    agent: null,
    state: { consecutiveErrors: n, lastRunStatus: 'error', lastRunAtMs: null },
    enabled: true,
    payload: { kind: 'agentTurn' },
  });

describe('CRN-001 Cron Directory Exists', () => {
  it('returns null when cron/ exists', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/cron/test-job.json`]: VALID_JOB });
    expect(await crn001.run(ctx)).toBeNull();
  });

  it('returns warn when cron/ is missing', async () => {
    const ctx = makeContext(ROOT, {});
    const f = await crn001.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('CRN-001');
  });
});

describe('CRN-002 Cron Job Files Valid', () => {
  it('returns null when all jobs are valid', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/cron/test-job.json`]: VALID_JOB });
    expect(await crn002.run(ctx)).toBeNull();
  });

  it('returns null when cron/ has no JSON files', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/cron/README.md`]: '# cron' });
    expect(await crn002.run(ctx)).toBeNull();
  });

  it('returns error for invalid JSON in a job file', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/cron/bad-job.json`]: 'not json' });
    const f = await crn002.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.checkId).toBe('CRN-002');
  });

  it('returns error when job file is missing required fields', async () => {
    const ctx = makeContext(ROOT, {
      [`${ROOT}/cron/partial.json`]: JSON.stringify({ id: 'x', name: 'x' }),
    });
    const f = await crn002.run(ctx);
    expect(f?.severity).toBe('error');
  });
});

describe('CRN-003 Cron Consecutive Errors', () => {
  it('returns null for zero errors', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/cron/job.json`]: VALID_JOB });
    expect(await crn003.run(ctx)).toBeNull();
  });

  it('returns warn for 2 consecutive errors', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/cron/job.json`]: JOB_WITH_ERRORS(2) });
    const f = await crn003.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('CRN-003');
  });

  it('returns error for 5 consecutive errors', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/cron/job.json`]: JOB_WITH_ERRORS(5) });
    const f = await crn003.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.checkId).toBe('CRN-003');
  });

  it('returns null when cron/ is missing', async () => {
    const ctx = makeContext(ROOT, {});
    expect(await crn003.run(ctx)).toBeNull();
  });
});

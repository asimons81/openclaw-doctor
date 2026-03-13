import { describe, expect, it } from 'vitest';
import { ws001 } from '../../../src/checks/workspace/ws-001-root-exists.js';
import { ws002 } from '../../../src/checks/workspace/ws-002-soul-present.js';
import { ws003 } from '../../../src/checks/workspace/ws-003-user-present.js';
import { ws004 } from '../../../src/checks/workspace/ws-004-agents-present.js';
import { ws005 } from '../../../src/checks/workspace/ws-005-env-valid.js';
import { makeContext } from '../../helpers/make-context.js';

const ROOT = '/workspace';

const VALID_ENV = JSON.stringify({
  version: '1.1',
  workspace: {
    root: ROOT,
    memory: `${ROOT}/memory`,
    logs: `${ROOT}/logs`,
    skills: `${ROOT}/skills`,
  },
});

describe('WS-001 Workspace Root Exists', () => {
  it('returns null when workspace root contains files', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/SOUL.md`]: '# soul' });
    expect(await ws001.run(ctx)).toBeNull();
  });

  it('returns critical when workspace root is empty (no files registered)', async () => {
    const ctx = makeContext('/does-not-exist', {});
    const f = await ws001.run(ctx);
    expect(f?.severity).toBe('critical');
    expect(f?.checkId).toBe('WS-001');
    expect(f?.confidence).toBe('definite');
  });
});

describe('WS-002 SOUL.md Present', () => {
  it('returns null when SOUL.md exists', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/SOUL.md`]: '# soul' });
    expect(await ws002.run(ctx)).toBeNull();
  });

  it('returns error when SOUL.md is missing', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/USER.md`]: '# user' });
    const f = await ws002.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.checkId).toBe('WS-002');
  });
});

describe('WS-003 USER.md Present', () => {
  it('returns null when USER.md exists', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/USER.md`]: '# user' });
    expect(await ws003.run(ctx)).toBeNull();
  });

  it('returns warn when USER.md is missing', async () => {
    const ctx = makeContext(ROOT, {});
    const f = await ws003.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('WS-003');
  });
});

describe('WS-004 AGENTS.md Present', () => {
  it('returns null when AGENTS.md exists', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/AGENTS.md`]: '# agents' });
    expect(await ws004.run(ctx)).toBeNull();
  });

  it('returns error when AGENTS.md is missing', async () => {
    const ctx = makeContext(ROOT, {});
    const f = await ws004.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.checkId).toBe('WS-004');
  });
});

describe('WS-005 ENVIRONMENT.json Valid', () => {
  it('returns null for a valid ENVIRONMENT.json', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/ENVIRONMENT.json`]: VALID_ENV });
    expect(await ws005.run(ctx)).toBeNull();
  });

  it('returns error when ENVIRONMENT.json is missing', async () => {
    const ctx = makeContext(ROOT, {});
    const f = await ws005.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.message).toMatch(/missing/i);
  });

  it('returns error when ENVIRONMENT.json is not valid JSON', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/ENVIRONMENT.json`]: 'not { json' });
    const f = await ws005.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.message).toMatch(/invalid json/i);
  });

  it('returns error when required workspace keys are absent', async () => {
    const partial = JSON.stringify({ version: '1.0' }); // missing workspace object
    const ctx = makeContext(ROOT, { [`${ROOT}/ENVIRONMENT.json`]: partial });
    const f = await ws005.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.message).toMatch(/schema/i);
  });
});

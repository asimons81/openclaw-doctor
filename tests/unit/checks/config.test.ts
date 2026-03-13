import { describe, expect, it } from 'vitest';
import { cfg001 } from '../../../src/checks/config/cfg-001-approval.js';
import { cfg002 } from '../../../src/checks/config/cfg-002-discord.js';
import { cfg003 } from '../../../src/checks/config/cfg-003-env-paths.js';
import { cfg004 } from '../../../src/checks/config/cfg-004-operational-context.js';
import { makeContext } from '../../helpers/make-context.js';

const ROOT = '/workspace';

const VALID_APPROVAL = JSON.stringify({
  version: 1,
  approval_channel_id: '123456789012345678',
  authorized_user_id: '987654321098765432',
  reaction_mapping: { '👍': 'approve', '👎': 'reject' },
  state_file: '/tmp/approval-requests.jsonl',
  expiry_hours: 72,
});

const VALID_DISCORD = `
channels:
  command-center: "111111111111111111"
agents:
  main:
    name: Ozzy
    channel: "111111111111111111"
`.trim();

const VALID_ENV = JSON.stringify({
  version: '1.0',
  workspace: {
    root: ROOT,
    memory: `${ROOT}/memory`,
    logs: `${ROOT}/logs`,
    skills: `${ROOT}/skills`,
  },
});

describe('CFG-001 Approval Config Valid', () => {
  it('returns null for valid approval config', async () => {
    const ctx = makeContext(ROOT, {
      [`${ROOT}/config/approval-config.json`]: VALID_APPROVAL,
    });
    expect(await cfg001.run(ctx)).toBeNull();
  });

  it('returns error when config is missing', async () => {
    const ctx = makeContext(ROOT, {});
    const f = await cfg001.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.checkId).toBe('CFG-001');
  });

  it('returns error for invalid JSON', async () => {
    const ctx = makeContext(ROOT, {
      [`${ROOT}/config/approval-config.json`]: 'not json',
    });
    const f = await cfg001.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.message).toMatch(/invalid json/i);
  });

  it('returns error when required fields are missing', async () => {
    const ctx = makeContext(ROOT, {
      [`${ROOT}/config/approval-config.json`]: JSON.stringify({ version: 1 }),
    });
    const f = await cfg001.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.message).toMatch(/schema/i);
  });
});

describe('CFG-002 Discord Config Valid', () => {
  it('returns null for valid discord config', async () => {
    const ctx = makeContext(ROOT, {
      [`${ROOT}/discord-config.yaml`]: VALID_DISCORD,
    });
    expect(await cfg002.run(ctx)).toBeNull();
  });

  it('returns warn when file is missing', async () => {
    const ctx = makeContext(ROOT, {});
    const f = await cfg002.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('CFG-002');
  });

  it('returns warn for invalid YAML', async () => {
    const ctx = makeContext(ROOT, {
      [`${ROOT}/discord-config.yaml`]: 'key: [unclosed',
    });
    const f = await cfg002.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.message).toMatch(/yaml syntax/i);
  });
});

describe('CFG-003 Environment Critical Paths Exist', () => {
  it('returns null when no critical_paths declared', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/ENVIRONMENT.json`]: VALID_ENV });
    expect(await cfg003.run(ctx)).toBeNull();
  });

  it('returns null when all absolute critical paths exist', async () => {
    const env = JSON.stringify({
      ...JSON.parse(VALID_ENV) as object,
      critical_paths: [`${ROOT}/memory`],
    });
    const ctx = makeContext(ROOT, {
      [`${ROOT}/ENVIRONMENT.json`]: env,
      [`${ROOT}/memory/MEMORY.md`]: '',
    });
    expect(await cfg003.run(ctx)).toBeNull();
  });

  it('returns null when relative critical paths resolve to existing dirs', async () => {
    const env = JSON.stringify({
      ...JSON.parse(VALID_ENV) as object,
      critical_paths: ['memory'],
    });
    const ctx = makeContext(ROOT, {
      [`${ROOT}/ENVIRONMENT.json`]: env,
      [`${ROOT}/memory/MEMORY.md`]: '',
    });
    expect(await cfg003.run(ctx)).toBeNull();
  });

  it('returns warn when a critical path does not exist', async () => {
    const env = JSON.stringify({
      ...JSON.parse(VALID_ENV) as object,
      critical_paths: [`${ROOT}/nonexistent-dir`],
    });
    const ctx = makeContext(ROOT, { [`${ROOT}/ENVIRONMENT.json`]: env });
    const f = await cfg003.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('CFG-003');
  });

  it('returns null when ENVIRONMENT.json is missing (defers to WS-005)', async () => {
    const ctx = makeContext(ROOT, {});
    expect(await cfg003.run(ctx)).toBeNull();
  });
});

describe('CFG-004 OPERATIONAL_CONTEXT.md Present', () => {
  it('returns null when file exists', async () => {
    const ctx = makeContext(ROOT, {
      [`${ROOT}/OPERATIONAL_CONTEXT.md`]: '# Operational Context',
    });
    expect(await cfg004.run(ctx)).toBeNull();
  });

  it('returns warn when file is missing', async () => {
    const ctx = makeContext(ROOT, {});
    const f = await cfg004.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('CFG-004');
  });
});

import { describe, expect, it } from 'vitest';
import { mem001 } from '../../../src/checks/memory/mem-001-dir-exists.js';
import { mem002 } from '../../../src/checks/memory/mem-002-memory-md.js';
import { mem003 } from '../../../src/checks/memory/mem-003-daily-fresh.js';
import { mem004 } from '../../../src/checks/memory/mem-004-active-projects.js';
import { mem005 } from '../../../src/checks/memory/mem-005-open-loops.js';
import { mem006 } from '../../../src/checks/memory/mem-006-weekly-recency.js';
import { makeContext } from '../../helpers/make-context.js';

const ROOT = '/workspace';
const TODAY = '2026-03-13';

describe('MEM-001 Memory Directory Exists', () => {
  it('returns null when memory/ has files', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/memory/MEMORY.md`]: '# mem' }, TODAY);
    expect(await mem001.run(ctx)).toBeNull();
  });

  it('returns critical when memory/ is missing', async () => {
    const ctx = makeContext(ROOT, {}, TODAY);
    const f = await mem001.run(ctx);
    expect(f?.severity).toBe('critical');
    expect(f?.checkId).toBe('MEM-001');
  });
});

describe('MEM-002 MEMORY.md Present', () => {
  it('returns null when MEMORY.md exists', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/memory/MEMORY.md`]: '# memory' }, TODAY);
    expect(await mem002.run(ctx)).toBeNull();
  });

  it('returns error when MEMORY.md is missing', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/memory/2026-03-13.md`]: '' }, TODAY);
    const f = await mem002.run(ctx);
    expect(f?.severity).toBe('error');
    expect(f?.checkId).toBe('MEM-002');
  });
});

describe('MEM-003 Daily Memory Freshness', () => {
  it('returns null when today file exists', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/memory/2026-03-13.md`]: '' }, TODAY);
    expect(await mem003.run(ctx)).toBeNull();
  });

  it('returns info when yesterday file exists but not today', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/memory/2026-03-12.md`]: '' }, TODAY);
    const f = await mem003.run(ctx);
    expect(f?.severity).toBe('info');
    expect(f?.checkId).toBe('MEM-003');
  });

  it('returns warn when neither today nor yesterday exist', async () => {
    const ctx = makeContext(ROOT, {}, TODAY);
    const f = await mem003.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.message).toMatch(/2026-03-13/);
    expect(f?.message).toMatch(/2026-03-12/);
  });
});

describe('MEM-004 Active Projects File Present', () => {
  it('returns null when file has content', async () => {
    const ctx = makeContext(
      ROOT,
      { [`${ROOT}/memory/active-projects.md`]: '# Projects\n- openclaw-doctor: in progress' },
      TODAY,
    );
    expect(await mem004.run(ctx)).toBeNull();
  });

  it('returns warn when file is missing', async () => {
    const ctx = makeContext(ROOT, {}, TODAY);
    const f = await mem004.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('MEM-004');
  });

  it('returns info when file is a stub (under 20 bytes)', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/memory/active-projects.md`]: '# stub' }, TODAY);
    const f = await mem004.run(ctx);
    expect(f?.severity).toBe('info');
  });
});

describe('MEM-005 Open Loops File Present', () => {
  it('returns null when open-loops.md exists', async () => {
    const ctx = makeContext(ROOT, { [`${ROOT}/memory/open-loops.md`]: '# loops' }, TODAY);
    expect(await mem005.run(ctx)).toBeNull();
  });

  it('returns warn when missing', async () => {
    const ctx = makeContext(ROOT, {}, TODAY);
    const f = await mem005.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('MEM-005');
  });
});

describe('MEM-006 Weekly Summary Recency', () => {
  it('returns null for a current-week file (W11 when today is 2026-03-13, week 11)', async () => {
    const ctx = makeContext(
      ROOT,
      { [`${ROOT}/memory/weekly/2026-W11.md`]: '' },
      TODAY,
    );
    expect(await mem006.run(ctx)).toBeNull();
  });

  it('returns warn when latest weekly is 2+ weeks old', async () => {
    const ctx = makeContext(
      ROOT,
      { [`${ROOT}/memory/weekly/2026-W09.md`]: '' },
      TODAY,
    );
    const f = await mem006.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.checkId).toBe('MEM-006');
  });

  it('returns warn when weekly/ dir is missing', async () => {
    const ctx = makeContext(ROOT, {}, TODAY);
    const f = await mem006.run(ctx);
    expect(f?.severity).toBe('warn');
  });

  it('returns warn when weekly/ dir is empty', async () => {
    // Create a non-weekly file so the directory exists but has no Wnn files
    const ctx = makeContext(ROOT, { [`${ROOT}/memory/weekly/.keep`]: '' }, TODAY);
    const f = await mem006.run(ctx);
    expect(f?.severity).toBe('warn');
    expect(f?.message).toMatch(/no weekly summary/i);
  });
});

import { describe, expect, it } from 'vitest';
import { filterChecks } from '../../src/scanner/filter.js';
import type { Check } from '../../src/types/index.js';

function fakeCheck(
  id: string,
  category: Check['category'],
  maxSeverity: Check['maxSeverity'],
): Check {
  return {
    id,
    name: id,
    category,
    maxSeverity,
    description: '',
    reads: [],
    run: async () => null,
  };
}

const checks = [
  fakeCheck('A-001', 'workspace', 'critical'),
  fakeCheck('B-001', 'memory', 'warn'),
  fakeCheck('C-001', 'config', 'info'),
  fakeCheck('D-001', 'logs', 'error'),
];

describe('filterChecks', () => {
  it('returns all checks when no filters applied', () => {
    const { toRun, skipped } = filterChecks(checks, {});
    expect(toRun).toHaveLength(4);
    expect(skipped).toHaveLength(0);
  });

  it('filters by specific checkIds', () => {
    const { toRun, skipped } = filterChecks(checks, { checkIds: ['A-001', 'C-001'] });
    expect(toRun.map(c => c.id)).toEqual(['A-001', 'C-001']);
    expect(skipped).toContain('B-001');
    expect(skipped).toContain('D-001');
  });

  it('filters by single category', () => {
    const { toRun, skipped } = filterChecks(checks, { categories: ['memory'] });
    expect(toRun.map(c => c.id)).toEqual(['B-001']);
    expect(skipped).toHaveLength(3);
  });

  it('filters by multiple categories', () => {
    const { toRun } = filterChecks(checks, { categories: ['workspace', 'logs'] });
    expect(toRun.map(c => c.id)).toContain('A-001');
    expect(toRun.map(c => c.id)).toContain('D-001');
    expect(toRun).toHaveLength(2);
  });

  it('filters by minSeverity: warn skips info checks', () => {
    const { toRun, skipped } = filterChecks(checks, { minSeverity: 'warn' });
    expect(toRun.map(c => c.id)).not.toContain('C-001'); // info
    expect(skipped).toContain('C-001');
  });

  it('filters by minSeverity: error keeps error and critical', () => {
    const { toRun } = filterChecks(checks, { minSeverity: 'error' });
    expect(toRun.map(c => c.id)).toContain('A-001'); // critical
    expect(toRun.map(c => c.id)).toContain('D-001'); // error
    expect(toRun.map(c => c.id)).not.toContain('B-001'); // warn
    expect(toRun.map(c => c.id)).not.toContain('C-001'); // info
  });

  it('combines checkIds and category filters', () => {
    // Only runs A-001 if it also matches the workspace category
    const { toRun } = filterChecks(checks, {
      checkIds: ['A-001', 'B-001'],
      categories: ['workspace'],
    });
    expect(toRun.map(c => c.id)).toEqual(['A-001']);
  });

  it('returns empty toRun when no checks match', () => {
    const { toRun, skipped } = filterChecks(checks, { checkIds: ['NONEXISTENT'] });
    expect(toRun).toHaveLength(0);
    expect(skipped).toHaveLength(4);
  });
});

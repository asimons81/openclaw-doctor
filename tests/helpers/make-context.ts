import type { CheckContext } from '../../src/types/index.js';
import { MockFsAdapter } from './mock-fs.js';

/** Builds a frozen CheckContext backed by a MockFsAdapter. */
export function makeContext(
  root: string,
  files: Record<string, string> = {},
  today = '2026-03-13',
  mtimes: Record<string, Date> = {},
): CheckContext {
  return Object.freeze({
    workspaceRoot: root,
    today,
    fs: new MockFsAdapter(files, mtimes),
  });
}

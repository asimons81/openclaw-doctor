import * as path from 'node:path';
import type { CheckContext, FileSystemAdapter } from '../types/index.js';
import { NodeFileSystemAdapter } from './reader.js';

export function buildContext(
  workspaceRoot: string,
  today?: string,
  fsAdapter?: FileSystemAdapter,
): CheckContext {
  return Object.freeze({
    workspaceRoot: path.resolve(workspaceRoot),
    today: today ?? new Date().toISOString().slice(0, 10),
    fs: fsAdapter ?? new NodeFileSystemAdapter(),
  });
}

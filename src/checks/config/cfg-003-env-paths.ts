import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';
import { EnvironmentJsonSchema } from '../../schemas/environment.js';

/**
 * Resolves a critical_path entry against the workspace root.
 *
 * Resolution rules:
 *   - Absolute paths (/home/user/...) → used as-is
 *   - Relative paths (memory/, ./logs/) → resolved against workspaceRoot
 *
 * This avoids false positives when ENVIRONMENT.json uses workspace-relative paths
 * (e.g. "memory/", "logs/") rather than full absolute paths.
 */
function resolveCriticalPath(entry: string, workspaceRoot: string): string {
  return path.isAbsolute(entry) ? entry : path.join(workspaceRoot, entry);
}

export const cfg003: Check = {
  id: 'CFG-003',
  name: 'Environment Critical Paths Exist',
  category: 'config',
  maxSeverity: 'warn',
  description:
    'If ENVIRONMENT.json declares critical_paths, verifies each one exists on disk. Supports both absolute paths and workspace-relative paths (e.g. "memory/", "logs/"). Missing paths signal workspace/config drift.',
  reads: ['ENVIRONMENT.json'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const p = path.join(ctx.workspaceRoot, 'ENVIRONMENT.json');
    if (!await ctx.fs.fileExists(p)) return null; // WS-005 owns the missing-file case

    let parsed: unknown;
    try {
      parsed = JSON.parse(await ctx.fs.readFile(p));
    } catch {
      return null; // WS-005 owns the bad-JSON case
    }

    const result = EnvironmentJsonSchema.safeParse(parsed);
    if (!result.success) return null; // WS-005 owns the schema case

    const criticalPaths = result.data.critical_paths ?? [];
    if (criticalPaths.length === 0) return null;

    const missing: string[] = [];
    for (const entry of criticalPaths) {
      const resolved = resolveCriticalPath(entry, ctx.workspaceRoot);
      const exists = (await ctx.fs.dirExists(resolved)) || (await ctx.fs.fileExists(resolved));
      if (!exists) {
        // Report the original entry plus resolved path so the user knows what was checked
        missing.push(`${entry} → ${resolved}`);
      }
    }

    if (missing.length === 0) return null;

    return {
      checkId: 'CFG-003',
      checkName: 'Environment Critical Paths Exist',
      category: 'config',
      severity: 'warn',
      confidence: 'definite',
      message: `${missing.length} critical path(s) from ENVIRONMENT.json do not exist`,
      detail: missing.join('\n'),
      remediation: [
        'Verify the listed paths are accessible, or update critical_paths in ENVIRONMENT.json.',
        'Relative paths are resolved against the workspace root.',
      ],
      checkedAt: new Date().toISOString(),
      meta: { missingPaths: missing },
    };
  },
};

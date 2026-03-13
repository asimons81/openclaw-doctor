import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * Infers the workspace root from multiple sources, in priority order:
 *   1. explicitPath argument (from positional arg or --path flag)
 *   2. OPENCLAW_WORKSPACE environment variable
 *   3. ~/.openclaw/workspace (default install location)
 *   4. Current working directory (if it contains SOUL.md)
 *
 * Throws if no valid root can be determined.
 */
export function inferWorkspaceRoot(explicitPath?: string): string {
  if (explicitPath) return path.resolve(explicitPath);

  const envPath = process.env['OPENCLAW_WORKSPACE'];
  if (envPath) return path.resolve(envPath);

  const defaultPath = path.join(os.homedir(), '.openclaw', 'workspace');
  if (fs.existsSync(defaultPath)) return defaultPath;

  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'SOUL.md'))) return cwd;

  throw new Error(
    [
      'Could not determine an OpenClaw workspace root.',
      '',
      'Checked, in order:',
      '  1. Positional scan path',
      '  2. --path <dir>',
      '  3. OPENCLAW_WORKSPACE',
      `  4. ${defaultPath}`,
      `  5. Current directory (${cwd}) for SOUL.md`,
      '',
      'Try one of these:',
      '  openclaw-doctor scan /path/to/workspace',
      '  openclaw-doctor scan --path /path/to/workspace',
      '  export OPENCLAW_WORKSPACE=/path/to/workspace',
    ].join('\n'),
  );
}

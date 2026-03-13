import * as path from 'node:path';
import * as url from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildProgram } from '../../src/cli/program.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.resolve(__dirname, '../fixtures/workspace');
const BROKEN_ROOT = path.resolve(__dirname, '../fixtures/broken-workspace');

async function runCli(args: string[]): Promise<{ stdout: string; stderr: string; exitCode?: number }> {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: string | Uint8Array) => {
    stdoutChunks.push(String(chunk));
    return true;
  }) as typeof process.stdout.write);
  const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(((chunk: string | Uint8Array) => {
    stderrChunks.push(String(chunk));
    return true;
  }) as typeof process.stderr.write);

  const previousExitCode = process.exitCode;

  try {
    const program = buildProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'openclaw-doctor', ...args], { from: 'node' });

    return {
      stdout: stdoutChunks.join(''),
      stderr: stderrChunks.join(''),
      exitCode: process.exitCode,
    };
  } finally {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    process.exitCode = previousExitCode;
  }
}

describe('CLI', () => {
  afterEach(() => {
    process.exitCode = undefined;
  });

  it('rejects invalid output formats', async () => {
    const program = buildProgram();
    program.exitOverride();

    await expect(
      program.parseAsync(
        ['node', 'openclaw-doctor', 'scan', FIXTURE_ROOT, '--format', 'xml'],
        { from: 'node' },
      ),
    ).rejects.toThrow(/process\.exit unexpectedly called with "1"/);
  });

  it('returns structured JSON for scan output', async () => {
    const { stdout } = await runCli(['scan', FIXTURE_ROOT, '--format', 'json']);
    const parsed = JSON.parse(stdout) as Record<string, unknown>;
    const summary = parsed['summary'] as Record<string, unknown>;

    expect(parsed['schemaVersion']).toBe(1);
    expect((parsed['scan'] as Record<string, unknown>)['workspaceRoot']).toBe(FIXTURE_ROOT);
    expect(summary['totalChecks']).toBe(25);
  });

  it('sets exit code 1 when --exit-code sees error findings', async () => {
    const { exitCode } = await runCli(['scan', BROKEN_ROOT, '--exit-code']);
    expect(exitCode).toBe(1);
  });

  it('fails explain for unknown checks with a clear message', async () => {
    const program = buildProgram();
    program.exitOverride();

    await expect(
      program.parseAsync(['node', 'openclaw-doctor', 'explain', 'BAD-999'], { from: 'node' }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('Unknown check ID "BAD-999"'),
    });
  });
});

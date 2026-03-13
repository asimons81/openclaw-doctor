import type { FileSystemAdapter } from '../../src/types/index.js';

/**
 * In-memory FileSystemAdapter for unit tests.
 *
 * Construct with a flat map of absolute path → content strings.
 * Parent directories are automatically inferred from file paths.
 *
 * Example:
 *   new MockFsAdapter({
 *     '/workspace/SOUL.md': '# soul',
 *     '/workspace/memory/MEMORY.md': '# memory',
 *   })
 */
export class MockFsAdapter implements FileSystemAdapter {
  private readonly files: Map<string, string>;
  private readonly dirs: Set<string>;
  private readonly mtimes: Map<string, Date>;

  constructor(
    files: Record<string, string> = {},
    mtimes: Record<string, Date> = {},
  ) {
    this.files = new Map(Object.entries(files));
    this.mtimes = new Map(Object.entries(mtimes));
    this.dirs = new Set<string>();

    // Auto-register all parent directories for every file path
    for (const fp of this.files.keys()) {
      const parts = fp.split('/').filter(Boolean);
      for (let i = 1; i <= parts.length - 1; i++) {
        this.dirs.add('/' + parts.slice(0, i).join('/'));
      }
    }
  }

  async fileExists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async dirExists(path: string): Promise<boolean> {
    if (this.dirs.has(path)) return true;
    // Also treat a path as a dir if any registered file starts with it
    const prefix = path.endsWith('/') ? path : path + '/';
    return [...this.files.keys()].some(f => f.startsWith(prefix));
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined) throw new Error(`ENOENT: no such file: ${path}`);
    return content;
  }

  async readJsonl(path: string): Promise<unknown[]> {
    const content = this.files.get(path);
    if (!content) return [];
    return content
      .split('\n')
      .filter(l => l.trim().length > 0)
      .map(l => {
        try {
          return JSON.parse(l) as unknown;
        } catch {
          return { _parseError: true, raw: l };
        }
      });
  }

  async listDir(path: string): Promise<string[]> {
    const prefix = path.endsWith('/') ? path : path + '/';
    const names = new Set<string>();
    for (const fp of this.files.keys()) {
      if (fp.startsWith(prefix)) {
        const rest = fp.slice(prefix.length);
        const first = rest.split('/')[0];
        if (first) names.add(first);
      }
    }
    return [...names].sort();
  }

  async modifiedAt(path: string): Promise<Date> {
    const mtime = this.mtimes.get(path);
    if (mtime) return mtime;
    if (this.files.has(path)) return new Date(); // present but no explicit mtime → now (fresh)
    throw new Error(`ENOENT: no such file: ${path}`);
  }
}

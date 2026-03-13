// The only file in the codebase that imports node:fs.
// Checks access the filesystem exclusively through the FileSystemAdapter interface.
import * as fs from 'node:fs/promises';
import type { FileSystemAdapter } from '../types/index.js';

export class NodeFileSystemAdapter implements FileSystemAdapter {
  async fileExists(path: string): Promise<boolean> {
    try {
      const stat = await fs.stat(path);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  async dirExists(path: string): Promise<boolean> {
    try {
      const stat = await fs.stat(path);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }

  async readJsonl(path: string): Promise<unknown[]> {
    let content: string;
    try {
      content = await fs.readFile(path, 'utf-8');
    } catch {
      return [];
    }
    return content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        try {
          return JSON.parse(line) as unknown;
        } catch {
          return { _parseError: true, raw: line };
        }
      });
  }

  async listDir(path: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(path);
      return entries.sort();
    } catch {
      return [];
    }
  }

  async modifiedAt(path: string): Promise<Date> {
    const stat = await fs.stat(path);
    return stat.mtime;
  }
}

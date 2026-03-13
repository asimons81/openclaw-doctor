import type { Category, Check } from '../types/index.js';

export class CheckRegistry {
  private readonly checks = new Map<string, Check>();

  register(check: Check): void {
    if (this.checks.has(check.id)) {
      throw new Error(`Duplicate check ID: ${check.id}`);
    }
    this.checks.set(check.id, check);
  }

  getAll(): Check[] {
    return [...this.checks.values()];
  }

  getById(id: string): Check | undefined {
    return this.checks.get(id);
  }

  getByCategory(category: Category): Check[] {
    return this.getAll().filter(c => c.category === category);
  }
}

/** Singleton used by the CLI. Tests should create their own CheckRegistry instances. */
export const registry = new CheckRegistry();

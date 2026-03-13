import { InvalidArgumentError } from 'commander';
import type { Category, Severity } from '../types/index.js';

export const OUTPUT_FORMATS = ['terminal', 'json', 'markdown'] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];
export const LIST_OUTPUT_FORMATS = ['terminal', 'json'] as const;
export type ListOutputFormat = (typeof LIST_OUTPUT_FORMATS)[number];

export const CATEGORIES: Category[] = [
  'workspace',
  'memory',
  'config',
  'logs',
  'cron',
  'agents',
];

export const SEVERITIES: Severity[] = ['info', 'warn', 'error', 'critical'];

export function parseOutputFormat(value: string): OutputFormat {
  if (OUTPUT_FORMATS.includes(value as OutputFormat)) {
    return value as OutputFormat;
  }

  throw new InvalidArgumentError(
    `Invalid format "${value}". Expected one of: ${OUTPUT_FORMATS.join(', ')}`,
  );
}

export function parseListOutputFormat(value: string): ListOutputFormat {
  if (LIST_OUTPUT_FORMATS.includes(value as ListOutputFormat)) {
    return value as ListOutputFormat;
  }

  throw new InvalidArgumentError(
    `Invalid format "${value}". Expected one of: ${LIST_OUTPUT_FORMATS.join(', ')}`,
  );
}

export function parseCategory(value: string): Category {
  if (CATEGORIES.includes(value as Category)) {
    return value as Category;
  }

  throw new InvalidArgumentError(
    `Invalid category "${value}". Expected one of: ${CATEGORIES.join(', ')}`,
  );
}

export function parseSeverity(value: string): Severity {
  if (SEVERITIES.includes(value as Severity)) {
    return value as Severity;
  }

  throw new InvalidArgumentError(
    `Invalid severity "${value}". Expected one of: ${SEVERITIES.join(', ')}`,
  );
}

export function collectCategory(value: string, previous: Category[]): Category[] {
  return [...previous, parseCategory(value)];
}

export function collectCheckId(value: string, previous: string[]): string[] {
  return [...previous, value.toUpperCase()];
}

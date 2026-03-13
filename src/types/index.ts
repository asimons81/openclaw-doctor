// Zero external imports. Every other module imports types from here.

export const SeverityLevel = {
  pass: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
} as const;

export type Severity = keyof typeof SeverityLevel;

export type Category =
  | 'workspace'
  | 'memory'
  | 'config'
  | 'logs'
  | 'cron'
  | 'agents';

/** How certain a check is about its finding. */
export type Confidence =
  | 'definite'  // file missing, JSON parse error — 100% certain
  | 'probable'  // heuristic with strong signal (e.g. file >7 days old)
  | 'possible'; // weak signal, informational

export interface Finding {
  readonly checkId: string;
  readonly checkName: string;
  readonly category: Category;
  readonly severity: Severity;
  readonly confidence: Confidence;
  /** One-line summary shown in terminal output and JSON. */
  readonly message: string;
  /** Optional longer explanation shown in verbose/explain modes. */
  readonly detail?: string;
  /** Ordered steps to resolve the issue. May be empty. */
  readonly remediation: readonly string[];
  readonly checkedAt: string;
  /** Structured evidence metadata (paths, counts, etc.). */
  readonly meta?: Readonly<Record<string, unknown>>;
}

/** The only I/O surface available to checks. Never import node:fs in a check directly. */
export interface FileSystemAdapter {
  fileExists(path: string): Promise<boolean>;
  dirExists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
  /** Parses a JSONL file. Returns parsed lines; malformed lines become { _parseError: true, raw }. */
  readJsonl(path: string): Promise<unknown[]>;
  /** Returns sorted entry names in a dir. Returns [] (not throws) when dir is missing. */
  listDir(path: string): Promise<string[]>;
  /** Returns mtime as Date. Throws if path does not exist. */
  modifiedAt(path: string): Promise<Date>;
}

export interface CheckContext {
  readonly workspaceRoot: string;
  /** Today's date as YYYY-MM-DD. Injected for testability. */
  readonly today: string;
  readonly fs: FileSystemAdapter;
}

export interface Check {
  /** Globally stable ID. Never change once shipped — CI configs depend on it. */
  readonly id: string;
  readonly name: string;
  readonly category: Category;
  /**
   * The maximum severity this check can produce.
   * Used to skip checks below the --min-severity threshold without running them.
   */
  readonly maxSeverity: Severity;
  /** Full description shown by `openclaw-doctor explain <id>`. */
  readonly description: string;
  /** Workspace paths or patterns this check reads. Documents what it touches. */
  readonly reads: readonly string[];
  /**
   * Run the check. Must never throw.
   * Returns null when workspace state is healthy (no finding).
   * Returns a Finding when something is wrong or worth noting.
   */
  run(ctx: CheckContext): Promise<Finding | null>;
}

export interface ScanOptions {
  workspaceRoot: string;
  checkIds?: string[];
  categories?: Category[];
  minSeverity?: Severity;
  verbose?: boolean;
  /** Override today's date (YYYY-MM-DD) for deterministic tests. */
  today?: string;
}

export interface ScanSummary {
  readonly total: number;
  readonly totalChecks: number;
  readonly executedChecks: number;
  readonly passedChecks: number;
  readonly skippedChecks: number;
  readonly byCategory: Readonly<Partial<Record<Category, number>>>;
  readonly bySeverity: Readonly<Partial<Record<Severity, number>>>;
  readonly overallSeverity: Severity;
}

export interface ScanResult {
  readonly workspaceRoot: string;
  readonly scannedAt: string;
  readonly today: string;
  readonly findings: readonly Finding[];
  /** Check IDs that ran and returned null (healthy). Only populated when verbose=true. */
  readonly passed: readonly string[];
  /** Check IDs skipped due to filter options. */
  readonly skipped: readonly string[];
  readonly summary: ScanSummary;
}

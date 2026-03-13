import type { Command } from 'commander';
import type { Category, ScanOptions, Severity } from '../../types/index.js';
import { runScan } from '../../scanner/scanner.js';
import { renderTerminal } from '../../reporter/terminal.js';
import { renderJson } from '../../reporter/json-reporter.js';
import { renderMarkdown } from '../../reporter/markdown-reporter.js';
import { inferWorkspaceRoot } from '../options.js';
import {
  collectCategory,
  collectCheckId,
  parseOutputFormat,
  parseSeverity,
  type OutputFormat,
} from '../constants.js';
import { CliError } from '../errors.js';
import { showBanner, shouldShowBanner } from '../banner.js';

interface ScanCliOpts {
  path?: string;
  format: OutputFormat;
  category: Category[];
  check: string[];
  minSeverity: Severity;
  verbose?: boolean;
  exitCode?: boolean;
  noBanner?: boolean;
}

export function registerScanCommand(program: Command): void {
  program
    .command('scan [workspace-root]')
    .description(
      [
        'Scan an OpenClaw workspace and report findings.',
        '',
        'The workspace root can be supplied as a positional argument or via --path.',
        'When neither is given, falls back to OPENCLAW_WORKSPACE env var,',
        '~/.openclaw/workspace, or the current directory (if it contains SOUL.md).',
      ].join('\n'),
    )
    .option('-p, --path <path>', 'Workspace root path (alternative to positional argument)')
    .option(
      '--format <format>',
      'Output format: terminal | json | markdown',
      parseOutputFormat,
      'terminal',
    )
    .option(
      '--category <cat>',
      'Filter to a category (repeatable): workspace | memory | config | logs | cron | agents',
      collectCategory,
      [],
    )
    .option('--check <id>', 'Filter to a specific check ID (repeatable)', collectCheckId, [])
    .option(
      '--min-severity <level>',
      'Minimum severity to surface: info | warn | error | critical',
      parseSeverity,
      'info',
    )
    .option('--verbose', 'Show all checks including those that passed')
    .option('--exit-code', 'Exit with code 1 if any error or critical findings exist')
    .option('--no-banner', 'Disable the startup banner')
    .addHelpText(
      'after',
      [
        '',
        'Examples:',
        '  openclaw-doctor scan',
        '  openclaw-doctor scan /path/to/workspace',
        '  openclaw-doctor scan --format json --exit-code',
        '  openclaw-doctor scan --category memory --min-severity warn',
        '  openclaw-doctor scan --check LOG-005 --check AGT-001',
      ].join('\n'),
    )
    .action(async (positionalPath: string | undefined, opts: ScanCliOpts) => {
      // Show banner for terminal output if not disabled
      if (shouldShowBanner(opts.format, opts.noBanner ?? false)) {
        showBanner();
      }

      // Positional argument takes precedence over --path flag
      const inputPath = positionalPath ?? opts.path;

      let root: string;
      try {
        root = inferWorkspaceRoot(inputPath);
      } catch (e) {
        throw new CliError((e as Error).message, 2);
      }

      const options: ScanOptions = {
        workspaceRoot: root,
        ...(opts.check.length > 0 && { checkIds: opts.check }),
        ...(opts.category.length > 0 && { categories: opts.category }),
        minSeverity: opts.minSeverity ?? 'info',
        ...(opts.verbose !== undefined && { verbose: opts.verbose }),
      };

      let result;
      try {
        result = await runScan(options);
      } catch (error) {
        throw new CliError(
          `Scan failed for ${root}: ${error instanceof Error ? error.message : String(error)}`,
          1,
        );
      }

      switch (opts.format) {
        case 'json':
          process.stdout.write(renderJson(result) + '\n');
          break;
        case 'markdown':
          process.stdout.write(renderMarkdown(result) + '\n');
          break;
        default:
          process.stdout.write(renderTerminal(result, opts.verbose ?? false));
      }

      if (opts.exitCode) {
        const crit = result.summary.bySeverity.critical ?? 0;
        const err = result.summary.bySeverity.error ?? 0;
        process.exitCode = crit > 0 || err > 0 ? 1 : 0;
      }
    });
}

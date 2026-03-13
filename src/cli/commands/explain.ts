import type { Command } from 'commander';
import { registry } from '../../scanner/registry.js';
import { CliError } from '../errors.js';

export function registerExplainCommand(program: Command): void {
  program
    .command('explain <check-id>')
    .description('Show full details for a specific check')
    .addHelpText(
      'after',
      [
        '',
        'Examples:',
        '  openclaw-doctor explain LOG-005',
        '  openclaw-doctor explain mem-003',
      ].join('\n'),
    )
    .action((checkId: string) => {
      const check = registry.getById(checkId.toUpperCase());
      if (!check) {
        throw new CliError(
          `Unknown check ID "${checkId}". Run "openclaw-doctor list-checks" to see all available checks.`,
          2,
        );
      }

      process.stdout.write(`ID:           ${check.id}\n`);
      process.stdout.write(`Name:         ${check.name}\n`);
      process.stdout.write(`Category:     ${check.category}\n`);
      process.stdout.write(`Max Severity: ${check.maxSeverity}\n`);
      process.stdout.write(`Reads:        ${check.reads.join(', ')}\n`);
      process.stdout.write('\n');
      process.stdout.write('Description:\n');
      process.stdout.write(
        check.description
          .split('. ')
          .map(s => `  ${s.trim()}.`)
          .join('\n')
          .replace(/\.\.$/, '.') + '\n',
      );
    });
}

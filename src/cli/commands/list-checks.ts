import type { Command } from 'commander';
import type { Category } from '../../types/index.js';
import { registry } from '../../scanner/registry.js';
import {
  parseCategory,
  parseListOutputFormat,
  type ListOutputFormat,
} from '../constants.js';

export function registerListChecksCommand(program: Command): void {
  program
    .command('list-checks')
    .description('List all available diagnostic checks')
    .option('--category <cat>', 'Filter by category', parseCategory)
    .option(
      '--format <format>',
      'Output format: terminal | json',
      parseListOutputFormat,
      'terminal',
    )
    .addHelpText(
      'after',
      [
        '',
        'Examples:',
        '  openclaw-doctor list-checks',
        '  openclaw-doctor list-checks --category logs',
        '  openclaw-doctor list-checks --format json',
      ].join('\n'),
    )
    .action((opts: { category?: Category; format?: ListOutputFormat }) => {
      let checks = registry.getAll();
      if (opts.category) {
        checks = registry.getByCategory(opts.category);
      }

      if (opts.format === 'json') {
        process.stdout.write(
          JSON.stringify(
            checks.map(c => ({
              id: c.id,
              name: c.name,
              category: c.category,
              maxSeverity: c.maxSeverity,
              description: c.description,
              reads: c.reads,
            })),
            null,
            2,
          ) + '\n',
        );
        return;
      }

      const COL = { id: 10, cat: 12, sev: 10 };
      const header =
        'ID'.padEnd(COL.id) + 'Category'.padEnd(COL.cat) + 'MaxSev'.padEnd(COL.sev) + 'Name';

      process.stdout.write(header + '\n');
      process.stdout.write('─'.repeat(70) + '\n');

      for (const c of checks) {
        process.stdout.write(
          c.id.padEnd(COL.id) +
            c.category.padEnd(COL.cat) +
            c.maxSeverity.padEnd(COL.sev) +
            c.name +
            '\n',
        );
      }

      process.stdout.write(`\n${checks.length} check(s)\n`);
    });
}

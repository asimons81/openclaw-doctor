import { createRequire } from 'node:module';
import { Command } from 'commander';
import '../checks/index.js';
import { registerScanCommand } from './commands/scan.js';
import { registerListChecksCommand } from './commands/list-checks.js';
import { registerExplainCommand } from './commands/explain.js';

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const pkg = require('../../package.json') as { version: string; description: string };

export function buildProgram(): Command {
  const program = new Command();

  program
    .name('openclaw-doctor')
    .description(pkg.description)
    .version(pkg.version)
    .showHelpAfterError('(run with --help for usage)')
    .showSuggestionAfterError(true)
    .addHelpText(
      'after',
      [
        '',
        'Examples:',
        '  openclaw-doctor scan',
        '  openclaw-doctor scan /path/to/workspace --format markdown',
        '  openclaw-doctor scan --category logs --min-severity warn',
        '  openclaw-doctor list-checks --category memory',
        '  openclaw-doctor explain LOG-005',
      ].join('\n'),
    );

  registerScanCommand(program);
  registerListChecksCommand(program);
  registerExplainCommand(program);

  return program;
}

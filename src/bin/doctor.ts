#!/usr/bin/env node
import { CommanderError } from 'commander';
import { buildProgram } from '../cli/program.js';
import { CliError } from '../cli/errors.js';

const program = buildProgram();

program.parseAsync(process.argv).catch((err: unknown) => {
  if (err instanceof CommanderError) {
    process.exit(err.exitCode);
  }

  if (err instanceof CliError) {
    process.stderr.write(`${err.message}\n`);
    process.exit(err.exitCode);
  }

  process.stderr.write(
    `Unexpected error: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});

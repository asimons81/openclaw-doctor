# OpenClawDoctor+

OpenClaw workspaces fail in boring ways: a missing `SOUL.md`, a stale daily file, broken cron state, drift between `ENVIRONMENT.json` and the filesystem, or logs that quietly stopped proving anything useful.

OpenClawDoctor+ is a read-only CLI that scans an OpenClaw workspace and turns those failure modes into a short, actionable report. It does not call the network, mutate the workspace, or try to auto-fix anything behind your back.

- 25 checks across 6 categories
- Terminal output for humans
- JSON output for scripts and CI
- Markdown output for GitHub issues, PRs, and Discord threads
- File-system only: no workspace writes, no API dependencies

## Install

```bash
npm install -g openclaw-doctor
```

One-off use without installing:

```bash
npx openclaw-doctor scan
```

Requirements:

- Node.js 20+

## First Run

If your workspace is in the default location, this is enough:

```bash
openclaw-doctor scan
```

If not, pass the path explicitly:

```bash
openclaw-doctor scan /path/to/workspace
```

Doctor resolves the workspace root in this order:

1. Positional argument: `openclaw-doctor scan /path/to/workspace`
2. `--path <dir>`
3. `OPENCLAW_WORKSPACE`
4. `~/.openclaw/workspace`
5. Current directory, if it contains `SOUL.md`

## Example

Terminal output:

```text
OpenClawDoctor+  workspace scan
Workspace /home/tony/.openclaw/workspace
Scanned   2026-03-13T16:55:20.269Z
Status    WARN  (2 findings across 25 executed checks)

Logs (1)
  [WARN]  LOG-005   Memory integrity report is 73h old (freshness target: 48h)
                    confidence: probable
                    → Run scripts/memory/memory-integrity-check.sh to refresh the report if you rely on this signal.

Agents (1)
  [INFO]  AGT-001   Optional memory/agents/ directory has not been created yet
                    confidence: possible
                    → No action is needed unless you expect per-agent memory logs in this workspace.

────────────────────────────────────────────────────────────
Overall: WARN  │  0 critical · 0 error · 1 warn · 1 info  │  23 passed · 0 skipped · 25 total
```

Markdown output is intended to paste cleanly into GitHub issues and Discord threads:

```bash
openclaw-doctor scan --format markdown > doctor-report.md
```

JSON output stays deterministic enough for scripting:

```bash
openclaw-doctor scan --format json
```

## Usage

```bash
# Scan the default workspace (~/.openclaw/workspace)
openclaw-doctor scan

# Scan a specific path
openclaw-doctor scan /path/to/workspace
openclaw-doctor scan --path /path/to/workspace

# JSON output for scripts
openclaw-doctor scan --format json

# Markdown output for sharing
openclaw-doctor scan --format markdown > report.md

# Only surface warnings and above
openclaw-doctor scan --min-severity warn

# Run only selected checks
openclaw-doctor scan --check WS-002 --check MEM-003

# Limit to one category
openclaw-doctor scan --category memory

# Return exit code 1 if any error or critical findings exist
openclaw-doctor scan --exit-code

# Show passed checks as well
openclaw-doctor scan --verbose

# List available checks
openclaw-doctor list-checks

# Explain one check in detail
openclaw-doctor explain LOG-005
```

`doctor` is also registered as a shorter alias.

## What It Checks

| Category | Count | Focus |
|----------|------:|-------|
| workspace | 5 | Core workspace files and `ENVIRONMENT.json` validity |
| memory | 6 | Daily/weekly freshness and required memory support files |
| config | 4 | Approval config, Discord config, path drift, operational context |
| logs | 5 | Ledger presence/schema, cron failure volume, stale approvals, integrity report age |
| cron | 3 | Cron directory presence, job schema, consecutive error state |
| agents | 2 | Agent memory directory presence and stale agent log signals |

## Severity And Confidence

Severity answers, "How serious is this if the finding is real?"

| Severity | Meaning |
|----------|---------|
| `critical` | Core workspace behavior is broken or missing |
| `error` | Significant operational risk that should be fixed soon |
| `warn` | Meaningful issue or drift signal worth investigating |
| `info` | Informational note, not necessarily a problem |

Confidence answers, "How certain is this finding?"

| Confidence | Meaning |
|------------|---------|
| `definite` | Direct fact such as a missing file or schema failure |
| `probable` | Strong heuristic signal, but interpretation depends on workflow |
| `possible` | Weak or contextual signal intended as a prompt to verify |

This matters most for checks like `LOG-005` and `AGT-001`: they are useful signals, but they can reflect missing operational coverage or not-yet-used directories rather than a broken workspace.

## Output Formats

### Terminal

Best for local interactive use. Findings are grouped by category, include short remediation, and end with a compact pass/fail summary.

### JSON

Best for automation. The JSON report includes:

- `schemaVersion`
- `scan` metadata
- a normalized `summary` with zero-filled severity/category counts
- ordered `findings`
- optional `passed` and `skipped` check ID lists

### Markdown

Best for communication. The Markdown report is optimized for GitHub issues, PR comments, and Discord handoffs rather than machine parsing.

## Check Reference

| ID | Name | Max Severity |
|----|------|--------------|
| `WS-001` | Workspace Root Exists | `critical` |
| `WS-002` | SOUL.md Present | `error` |
| `WS-003` | USER.md Present | `warn` |
| `WS-004` | AGENTS.md Present | `error` |
| `WS-005` | ENVIRONMENT.json Valid | `error` |
| `MEM-001` | Memory Directory Exists | `critical` |
| `MEM-002` | MEMORY.md Present | `error` |
| `MEM-003` | Daily Memory Freshness | `warn` |
| `MEM-004` | Active Projects File Present | `warn` |
| `MEM-005` | Open Loops File Present | `warn` |
| `MEM-006` | Weekly Summary Recency | `warn` |
| `CFG-001` | Approval Config Valid | `error` |
| `CFG-002` | Discord Config Valid | `warn` |
| `CFG-003` | Environment Critical Paths Exist | `warn` |
| `CFG-004` | OPERATIONAL_CONTEXT.md Present | `warn` |
| `LOG-001` | Task Ledger Exists | `error` |
| `LOG-002` | Task Ledger Schema | `warn` |
| `LOG-003` | Recent Cron Failures | `error` |
| `LOG-004` | Stale Approval Requests | `warn` |
| `LOG-005` | Memory Integrity Report Age | `error` |
| `CRN-001` | Cron Directory Exists | `warn` |
| `CRN-002` | Cron Job Files Valid | `error` |
| `CRN-003` | Cron Consecutive Errors | `error` |
| `AGT-001` | Agent Memory Dirs Present | `info` |
| `AGT-002` | Agent Log Freshness | `warn` |

Use `openclaw-doctor explain <CHECK_ID>` for the full description, path coverage, and intent of any check.

## Limitations

- Date-sensitive checks use the local system date. If your workspace policy follows another timezone, freshness checks can be off by one day.
- `AGT-002` only understands the agent log naming patterns currently encoded in the tool.
- `LOG-005` only knows the `memory-integrity-latest.json` contract used by the existing shell-based integrity workflow.
- Doctor does not validate external service reachability, process health, git history, or live Discord/Ollama connectivity.

## Verification

```bash
npm install
npm run verify
npm run pack:dry-run
```

Current test/build baseline:

- TypeScript typecheck passes
- Vitest suite passes
- Production build passes

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT

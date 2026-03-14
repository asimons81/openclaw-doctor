# OpenClawDoctor+ Check Inventory

This document provides a detailed inventory of all checks performed by OpenClawDoctor+.

## Overview

- **Total Checks:** 25
- **Categories:** 6 (workspace, memory, config, logs, cron, agents)
- **Output Formats:** Terminal, JSON, Markdown

---

## Check Details

### Workspace (5 checks)

| Check ID | Name | Description | Severity | Confidence |
|----------|------|-------------|----------|-------------|
| `WS-001` | Workspace Root Exists | Verifies the workspace directory exists and is accessible | `critical` | `definite` |
| `WS-002` | SOUL.md Present | Checks for the required `SOUL.md` persona/orchestration file | `error` | `definite` |
| `WS-003` | USER.md Present | Checks for the user context file | `warn` | `definite` |
| `WS-004` | AGENTS.md Present | Verifies agent routing configuration exists | `error` | `definite` |
| `WS-005` | ENVIRONMENT.json Valid | Validates JSON structure and required fields | `error` | `definite` |

### Memory (6 checks)

| Check ID | Name | Description | Severity | Confidence |
|----------|------|-------------|----------|-------------|
| `MEM-001` | Memory Directory Exists | Verifies the memory/ directory structure exists | `critical` | `definite` |
| `MEM-002` | MEMORY.md Present | Checks for the curated long-term memory file | `error` | `definite` |
| `MEM-003` | Daily Memory Freshness | Ensures today's daily memory file exists and is recent | `warn` | `probable` |
| `MEM-004` | Active Projects File Present | Checks for active project tracking | `warn` | `definite` |
| `MEM-005` | Open Loops File Present | Verifies open loop tracking exists | `warn` | `definite` |
| `MEM-006` | Weekly Summary Recency | Checks for recent weekly summary | `warn` | `probable` |

### Config (4 checks)

| Check ID | Name | Description | Severity | Confidence |
|----------|------|-------------|----------|-------------|
| `CFG-001` | Approval Config Valid | Validates approval configuration structure | `error` | `definite` |
| `CFG-002` | Discord Config Valid | Checks Discord integration configuration | `warn` | `definite` |
| `CFG-003` | Environment Critical Paths Exist | Verifies paths defined in ENVIRONMENT.json actually exist | `warn` | `probable` |
| `CFG-004` | OPERATIONAL_CONTEXT.md Present | Checks for operational context documentation | `warn` | `definite` |

### Logs (5 checks)

| Check ID | Name | Description | Severity | Confidence |
|----------|------|-------------|----------|-------------|
| `LOG-001` | Task Ledger Exists | Verifies task-ledger.jsonl exists | `error` | `definite` |
| `LOG-002` | Task Ledger Schema | Validates ledger entry structure | `warn` | `definite` |
| `LOG-003` | Recent Cron Failures | Checks for cron failure patterns in logs | `error` | `probable` |
| `LOG-004` | Stale Approval Requests | Identifies approval requests older than 48h | `warn` | `probable` |
| `LOG-005` | Memory Integrity Report Age | Verifies memory-integrity-latest.json freshness (48h target) | `error` | `probable` |

### Cron (3 checks)

| Check ID | Name | Description | Severity | Confidence |
|----------|------|-------------|----------|-------------|
| `CRN-001` | Cron Directory Exists | Checks for cron/ directory presence | `warn` | `definite` |
| `CRN-002` | Cron Job Files Valid | Validates job file structure and syntax | `error` | `definite` |
| `CRN-003` | Cron Consecutive Errors | Detects consecutive error states in cron execution | `error` | `probable` |

### Agents (2 checks)

| Check ID | Name | Description | Severity | Confidence |
|----------|------|-------------|----------|-------------|
| `AGT-001` | Agent Memory Dirs Present | Checks for per-agent memory directories | `info` | `possible` |
| `AGT-002` | Agent Log Freshness | Verifies agent log files are recent | `warn` | `probable` |

---

## Severity Model

| Severity | Meaning | Action Required |
|----------|---------|-----------------|
| `critical` | Core workspace behavior is broken or missing | Fix immediately |
| `error` | Significant operational risk | Fix soon |
| `warn` | Meaningful issue or drift signal | Investigate |
| `info` | Informational note | Review as needed |

## Confidence Model

| Confidence | Meaning |
|------------|---------|
| `definite` | Direct fact — file exists/missing, schema valid/invalid |
| `probable` | Strong heuristic — likely accurate but depends on workflow |
| `possible` | Weak signal — prompt to verify, not a finding |

---

## Remediation Posture

OpenClawDoctor+ is **read-only**. It detects and reports; it does not fix.

- **critical/error**: Requires attention — workspace functionality may be impaired
- **warn**: Worth investigating — may indicate drift or incomplete setup
- **info**: Informational — optional features or unused directories

For remediation, refer to:
- Individual check explanations: `openclaw-doctor explain <CHECK_ID>`
- OpenClaw documentation at `~/.openclaw/workspace/docs/`
- Specific scripts in `scripts/` directory (e.g., `memory-integrity-check.sh`)

---

## Adding Custom Checks

Custom checks are not currently supported in v0.x. This is intentionally limited to maintain the read-only trust boundary and ensure consistent behavior across deployments.

---

*Generated for OpenClawDoctor+ v0.1.x*

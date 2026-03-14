# OpenClawDoctor+ Visual Examples

This document provides visual examples of OpenClawDoctor+ output in various scenarios.

---

## Example 1: Healthy System (No Issues)

```
┌─────────────────────────────────────────────────────────────┐
│  OpenClawDoctor+  workspace scan                             │
│  Workspace /home/tony/.openclaw/workspace                   │
│  Scanned   2026-03-14T01:48:42.563Z                        │
│  Status    PASS  (0 findings across 2 executed checks)      │
│                                                             │
│  All checks passed. No findings.                            │
│────────────────────────────────────────────────────────────│
│  Overall: PASS  │  0 critical · 0 error · 0 warn · 0 info  │  2 passed · 23 skipped · 25 total │
└─────────────────────────────────────────────────────────────┘
```

---

## Example 2: System with Warnings

```
┌─────────────────────────────────────────────────────────────┐
│  OpenClawDoctor+  workspace scan                             │
│  Workspace /home/tony/.openclaw/workspace                   │
│  Scanned   2026-03-14T01:48:57.040Z                        │
│  Status    WARN  (4 findings across 25 executed checks)     │
│                                                             │
│  Logs (2)                                                   │
│    [WARN]   LOG-005   Memory integrity check reports WARN  │
│                        → Review logs/memory-integrity...     │
│    [INFO]   LOG-003   1 cron failure(s) in last 24h         │
│                        → Investigate failing jobs...         │
│                                                             │
│  Agents (1)                                                 │
│    [INFO]   AGT-001   3 agent memory directories missing    │
│                        → This is informational...            │
│                                                             │
│  Memory (1)                                                 │
│    [INFO]   MEM-003   No daily memory file for today       │
│                        → Create memory/2026-03-14.md...     │
│────────────────────────────────────────────────────────────│
│  Overall: WARN  │  0 critical · 0 error · 1 warn · 3 info  │  21 passed · 0 skipped · 25 total │
└─────────────────────────────────────────────────────────────┘
```

---

## Example 3: JSON Output

```json
{
  "schemaVersion": "1.0",
  "scan": {
    "workspace": "/home/tony/.openclaw/workspace",
    "timestamp": "2026-03-14T01:48:57.040Z",
    "status": "warn",
    "totalChecks": 25,
    "executedChecks": 25,
    "passedChecks": 21,
    "skippedChecks": 0
  },
  "summary": {
    "critical": 0,
    "error": 0,
    "warn": 1,
    "info": 3
  },
  "findings": [
    {
      "id": "LOG-005",
      "name": "Memory Integrity Report Age",
      "category": "logs",
      "severity": "warn",
      "confidence": "probable",
      "message": "Memory integrity check reports WARN"
    }
  ]
}
```

---

## Example 4: Markdown Output

```markdown
## OpenClawDoctor+ Scan Report

**Workspace:** `/home/tony/.openclaw/workspace`  
**Status:** WARN (4 findings)  
**Date:** 2026-03-14T01:48:57Z

### Findings

| Severity | Check | Description |
|----------|-------|-------------|
| ⚠️ WARN | LOG-005 | Memory integrity check reports WARN |
| ℹ️ INFO | LOG-003 | 1 cron failure(s) in the last 24 hours |
| ℹ️ INFO | AGT-001 | 3 agent memory directories are missing |
| ℹ️ INFO | MEM-003 | No daily memory file for today |

### Summary

- **Critical:** 0
- **Error:** 0  
- **Warn:** 1
- **Info:** 3
- **Passed:** 21 / 25
```

---

*These examples are captured from real OpenClawDoctor+ runs against an active workspace.*

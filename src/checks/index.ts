/**
 * Side-effect module: registers all 25 checks into the singleton registry.
 * Import this exactly once, at startup in src/bin/doctor.ts.
 * Tests that need a clean registry should create a new CheckRegistry instance.
 */

import { registry } from '../scanner/registry.js';

// Workspace (5)
import { ws001 } from './workspace/ws-001-root-exists.js';
import { ws002 } from './workspace/ws-002-soul-present.js';
import { ws003 } from './workspace/ws-003-user-present.js';
import { ws004 } from './workspace/ws-004-agents-present.js';
import { ws005 } from './workspace/ws-005-env-valid.js';

// Memory (6)
import { mem001 } from './memory/mem-001-dir-exists.js';
import { mem002 } from './memory/mem-002-memory-md.js';
import { mem003 } from './memory/mem-003-daily-fresh.js';
import { mem004 } from './memory/mem-004-active-projects.js';
import { mem005 } from './memory/mem-005-open-loops.js';
import { mem006 } from './memory/mem-006-weekly-recency.js';

// Config (4)
import { cfg001 } from './config/cfg-001-approval.js';
import { cfg002 } from './config/cfg-002-discord.js';
import { cfg003 } from './config/cfg-003-env-paths.js';
import { cfg004 } from './config/cfg-004-operational-context.js';

// Logs (5)
import { log001 } from './logs/log-001-ledger-exists.js';
import { log002 } from './logs/log-002-ledger-schema.js';
import { log003 } from './logs/log-003-cron-failures.js';
import { log004 } from './logs/log-004-approval-expiry.js';
import { log005 } from './logs/log-005-integrity-age.js';

// Cron (3)
import { crn001 } from './cron/crn-001-dir-exists.js';
import { crn002 } from './cron/crn-002-jobs-valid.js';
import { crn003 } from './cron/crn-003-consecutive-errors.js';

// Agents (2)
import { agt001 } from './agents/agt-001-dirs-present.js';
import { agt002 } from './agents/agt-002-log-freshness.js';

for (const check of [
  ws001, ws002, ws003, ws004, ws005,       // 5
  mem001, mem002, mem003, mem004, mem005, mem006, // 6
  cfg001, cfg002, cfg003, cfg004,          // 4
  log001, log002, log003, log004, log005,  // 5
  crn001, crn002, crn003,                  // 3
  agt001, agt002,                          // 2
]) {                                        // = 25 total
  registry.register(check);
}

import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

const STALE_DAYS = 7;
const KNOWN_AGENTS = ['main', 'forge', 'scout', 'inkwell', 'sentinel', 'archivist', 'spark'];

export const agt002: Check = {
  id: 'AGT-002',
  name: 'Agent Log Freshness',
  category: 'agents',
  maxSeverity: 'warn',
  description: `For each agent that has a memory directory, checks if its log file was modified within ${STALE_DAYS} days. Checks memory/agents/<agent>/<agent>-log.md and memory/agents/<agent>-log.md. Confidence is possible — naming conventions may vary.`,
  reads: ['memory/agents/*/'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const agentsDir = path.join(ctx.workspaceRoot, 'memory', 'agents');
    if (!await ctx.fs.dirExists(agentsDir)) return null;

    const cutoffMs = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
    const stale: string[] = [];

    for (const agent of KNOWN_AGENTS) {
      const agentDir = path.join(agentsDir, agent);
      if (!await ctx.fs.dirExists(agentDir)) continue;

      // Check two candidate log file locations
      const candidates = [
        path.join(agentDir, `${agent}-log.md`),
        path.join(agentsDir, `${agent}-log.md`),
      ];

      for (const logFile of candidates) {
        if (!await ctx.fs.fileExists(logFile)) continue;
        try {
          const mtime = await ctx.fs.modifiedAt(logFile);
          if (mtime.getTime() < cutoffMs) stale.push(agent);
        } catch {
          // can't stat — skip
        }
        break; // found the file for this agent; no need to check other candidates
      }
    }

    if (stale.length === 0) return null;

    return {
      checkId: 'AGT-002',
      checkName: 'Agent Log Freshness',
      category: 'agents',
      severity: 'warn',
      confidence: 'possible',
      message: `${stale.length} agent log(s) not updated in ${STALE_DAYS}+ days: ${stale.join(', ')}`,
      remediation: [
        'Verify whether these agents are expected to be active.',
        'If inactive by design, this finding can be suppressed with --check filtering.',
      ],
      checkedAt: new Date().toISOString(),
      meta: { staleAgents: stale, staleDays: STALE_DAYS },
    };
  },
};

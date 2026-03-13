import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';

const KNOWN_AGENTS = ['main', 'forge', 'scout', 'inkwell', 'sentinel', 'archivist', 'spark'];

export const agt001: Check = {
  id: 'AGT-001',
  name: 'Agent Memory Dirs Present',
  category: 'agents',
  maxSeverity: 'info',
  description: `Checks whether memory/agents/<agent-id>/ directories exist for the ${KNOWN_AGENTS.length} known agents. This is informational — directories are created on first use, so missing dirs indicate agents have not yet logged memory rather than a configuration error.`,
  reads: ['memory/agents/'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    const agentsDir = path.join(ctx.workspaceRoot, 'memory', 'agents');

    if (!await ctx.fs.dirExists(agentsDir)) {
      return {
        checkId: 'AGT-001',
        checkName: 'Agent Memory Dirs Present',
        category: 'agents',
        severity: 'info',
        confidence: 'possible',
        message: 'Optional memory/agents/ directory has not been created yet',
        remediation: [
          'No action is needed unless you expect per-agent memory logs in this workspace.',
          'Create memory/agents/ if you want agent memory directories to be created on first use.',
        ],
        checkedAt: new Date().toISOString(),
      };
    }

    const missing: string[] = [];
    for (const agent of KNOWN_AGENTS) {
      if (!await ctx.fs.dirExists(path.join(agentsDir, agent))) {
        missing.push(agent);
      }
    }

    if (missing.length === 0) return null;

    return {
      checkId: 'AGT-001',
      checkName: 'Agent Memory Dirs Present',
      category: 'agents',
      severity: 'info',
      confidence: 'possible',
      message: `${missing.length} agent memory director${missing.length === 1 ? 'y is' : 'ies are'} missing: ${missing.join(', ')}`,
      remediation: [
        'This is informational. Directories are created when agents first write memory.',
        'Note: Some agents (main, sentinel, spark) use different output paths (workspace root, validation/, logs/) and do not require memory/agents/<id>/ directories.',
        'Only treat this as a problem if those agents are expected to have already logged state to that path.',
      ],
      checkedAt: new Date().toISOString(),
      meta: { missingAgents: missing },
    };
  },
};

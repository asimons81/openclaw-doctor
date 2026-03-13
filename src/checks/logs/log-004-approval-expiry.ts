import * as path from 'node:path';
import type { Check, CheckContext, Finding } from '../../types/index.js';
import { ApprovalRequestEntrySchema } from '../../schemas/log-entries.js';
import { ApprovalConfigSchema } from '../../schemas/approval-config.js';

const DEFAULT_EXPIRY_HOURS = 72;

export const log004: Check = {
  id: 'LOG-004',
  name: 'Stale Approval Requests',
  category: 'logs',
  maxSeverity: 'warn',
  description:
    'Finds pending approval requests in logs/approval-requests.jsonl that are older than the configured expiry window (default 72h). Stale pending approvals indicate the approval workflow may be broken or requests were forgotten.',
  reads: ['logs/approval-requests.jsonl', 'config/approval-config.json'],
  async run(ctx: CheckContext): Promise<Finding | null> {
    // Read expiry hours from approval config, fall back to default
    let expiryHours = DEFAULT_EXPIRY_HOURS;
    const cfgPath = path.join(ctx.workspaceRoot, 'config', 'approval-config.json');
    if (await ctx.fs.fileExists(cfgPath)) {
      try {
        const cfgResult = ApprovalConfigSchema.safeParse(
          JSON.parse(await ctx.fs.readFile(cfgPath)),
        );
        if (cfgResult.success) expiryHours = cfgResult.data.expiry_hours;
      } catch {
        // use default
      }
    }

    const reqPath = path.join(ctx.workspaceRoot, 'logs', 'approval-requests.jsonl');
    if (!await ctx.fs.fileExists(reqPath)) return null;

    const lines = await ctx.fs.readJsonl(reqPath);
    const cutoff = Date.now() - expiryHours * 60 * 60 * 1000;
    const staleIds: string[] = [];

    for (const line of lines) {
      const r = ApprovalRequestEntrySchema.safeParse(line);
      if (!r.success) continue;
      if (r.data.status !== 'pending') continue;
      const ts = new Date(r.data.timestamp).getTime();
      if (!isNaN(ts) && ts < cutoff) {
        staleIds.push(r.data.id);
      }
    }

    if (staleIds.length === 0) return null;

    return {
      checkId: 'LOG-004',
      checkName: 'Stale Approval Requests',
      category: 'logs',
      severity: 'warn',
      confidence: 'definite',
      message: `${staleIds.length} approval request(s) pending past the ${expiryHours}h expiry window`,
      remediation: [
        'Review logs/approval-requests.jsonl and resolve or expire the stale requests.',
        `Stale request IDs: ${staleIds.slice(0, 5).join(', ')}${staleIds.length > 5 ? ' …' : ''}`,
      ],
      checkedAt: new Date().toISOString(),
      meta: { count: staleIds.length, expiryHours, ids: staleIds.slice(0, 10) },
    };
  },
};

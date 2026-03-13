import { z } from 'zod';

export const TaskLedgerEntrySchema = z.object({
  id: z.string(),
  agent: z.string(),
  task: z.string(),
  scope: z.string().optional(),
  status: z.string(),
  started_at: z.string(),
  completed_at: z.string().optional(),
  priority: z.string().optional(),
  notes: z.string().optional(),
});

export const CronFailureEntrySchema = z.object({
  job: z.string(),
  timestamp: z.string(),
  error: z.string(),
});

export const ApprovalRequestEntrySchema = z.object({
  id: z.string(),
  agent: z.string(),
  status: z.string(),
  timestamp: z.string(),
  expiry_hours: z.number().optional(),
});

export const MemoryIntegrityReportSchema = z.object({
  timestamp: z.string(),
  overall: z.enum(['pass', 'warn', 'fail']),
  checks: z.array(
    z.object({
      name: z.string(),
      level: z.string(),
      detail: z.string(),
    }),
  ),
  summary: z.object({
    pass: z.number(),
    warn: z.number(),
    fail: z.number(),
  }),
});

export type MemoryIntegrityReport = z.infer<typeof MemoryIntegrityReportSchema>;

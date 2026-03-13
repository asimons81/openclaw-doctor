import { z } from 'zod';

export const CronJobSchema = z.object({
  id: z.string(),
  name: z.string(),
  schedule: z.object({
    kind: z.literal('cron'),
    expr: z.string(),
    tz: z.string(),
  }),
  agent: z.string().nullable(),
  state: z.object({
    consecutiveErrors: z.number(),
    lastRunStatus: z.string().nullable(),
    lastRunAtMs: z.number().nullable(),
    nextRunAtMs: z.number().nullable().optional(),
    lastStatus: z.string().nullable().optional(),
    lastDurationMs: z.number().optional(),
    lastDelivered: z.boolean().optional(),
  }),
  enabled: z.boolean(),
  payload: z.object({
    kind: z.string(),
    message: z.string().optional(),
  }),
  sessionTarget: z.string().optional(),
  delivery: z
    .object({
      mode: z.string(),
      channel: z.string(),
    })
    .optional(),
  updatedAtMs: z.number().nullable().optional(),
  wakeMode: z.string().optional(),
});

export type CronJob = z.infer<typeof CronJobSchema>;

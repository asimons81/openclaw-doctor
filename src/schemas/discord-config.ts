import { z } from 'zod';

export const DiscordConfigSchema = z.object({
  channels: z.record(z.string()),
  agents: z.record(
    z.object({
      name: z.string(),
      channel: z.string(),
    }),
  ),
  heartbeat: z
    .object({
      'interval-hours': z.number(),
      channel: z.string(),
      include: z.array(z.string()).optional(),
    })
    .optional(),
  'log-routing': z
    .record(
      z.object({
        channel: z.string(),
      }),
    )
    .optional(),
});

export type DiscordConfig = z.infer<typeof DiscordConfigSchema>;

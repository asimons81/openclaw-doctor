import { z } from 'zod';

export const ApprovalConfigSchema = z.object({
  version: z.number(),
  approval_channel_id: z.string().min(1),
  authorized_user_id: z.string().min(1),
  reaction_mapping: z.record(z.string()),
  state_file: z.string().min(1),
  expiry_hours: z.number().positive(),
});

export type ApprovalConfig = z.infer<typeof ApprovalConfigSchema>;

import { z } from 'zod';

export const EnvironmentJsonSchema = z.object({
  version: z.string(),
  workspace: z.object({
    root: z.string(),
    memory: z.string(),
    logs: z.string(),
    skills: z.string(),
    memory_authoritative: z.boolean().optional(),
  }),
  integrations: z.record(z.unknown()).optional(),
  /**
   * Paths that must exist for the workspace to be functional.
   * Supports absolute paths (/home/user/...) and workspace-relative paths (memory/, logs/).
   * Relative paths are resolved against the workspace root at check time.
   */
  critical_paths: z.array(z.string()).optional(),
  deprecated_paths: z.array(z.string()).optional(),
});

export type EnvironmentJson = z.infer<typeof EnvironmentJsonSchema>;

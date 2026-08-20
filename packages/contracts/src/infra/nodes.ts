import { z } from 'zod';

export const registerNodeRequestSchema = z.object({
  name: z.string().trim().min(1),
  hostname: z.string().trim().min(1),
});

export type RegisterNodeRequest = z.infer<
  typeof registerNodeRequestSchema
>;

export const nodeResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  hostname: z.string(),
  createdAt: z.string().datetime(),
});

export type NodeResponse = z.infer<
  typeof nodeResponseSchema
>;

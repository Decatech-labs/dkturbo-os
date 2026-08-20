import { z } from 'zod';

export const capabilityKeySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z][a-z0-9]*(?:\.[a-z0-9]+)*$/,
  );

export const nodeCapabilityParamsSchema =
  z.object({
    id: z.string().uuid(),
    capabilityKey: capabilityKeySchema,
  });

export type NodeCapabilityParams = z.infer<
  typeof nodeCapabilityParamsSchema
>;

export const nodeCapabilityResponseSchema =
  z.object({
    nodeId: z.string().uuid(),
    key: capabilityKeySchema,
    registeredAt: z.string().datetime(),
  });

export type NodeCapabilityResponse = z.infer<
  typeof nodeCapabilityResponseSchema
>;

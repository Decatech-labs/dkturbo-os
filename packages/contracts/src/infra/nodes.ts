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

export const nodeParamsSchema = z.object({
  id: z.string().uuid(),
});

export type NodeParams = z.infer<
  typeof nodeParamsSchema
>;

export const nodeRuntimeSnapshotSchema = z.object({
  uptimeSeconds:
    z.number().nonnegative(),

  load: z.object({
    oneMinute: z.number(),
    fiveMinutes: z.number(),
    fifteenMinutes: z.number(),
  }),

  memory: z.object({
    totalBytes:
      z.number().nonnegative(),

    availableBytes:
      z.number().nonnegative(),

    usedBytes:
      z.number().nonnegative(),

    usedPercent:
      z.number().nonnegative(),
  }),

  rootFilesystem: z.object({
    totalBytes:
      z.number().nonnegative(),

    usedBytes:
      z.number().nonnegative(),

    availableBytes:
      z.number().nonnegative(),

    usedPercent:
      z.number().nonnegative(),
  }),
});

export type NodeRuntimeSnapshot = z.infer<
  typeof nodeRuntimeSnapshotSchema
>;

export const nodeObservedStateResponseSchema = z.object({
  nodeId: z.string().uuid(),

  lastSeenAt:
    z.string()
      .datetime()
      .nullable(),

  runtimeCollectedAt:
    z.string()
      .datetime()
      .nullable(),

  runtimeSnapshot:
    nodeRuntimeSnapshotSchema
      .nullable(),
});

export type NodeObservedStateResponse = z.infer<
  typeof nodeObservedStateResponseSchema
>;

export const nodeStatusResponseSchema = z.object({
  nodeId: z.string().uuid(),

  status: z.enum([
    'UNKNOWN',
    'ONLINE',
    'STALE',
  ]),

  lastSeenAt:
    z.string()
      .datetime()
      .nullable(),

  runtimeCollectedAt:
    z.string()
      .datetime()
      .nullable(),
});

export type NodeStatusResponse = z.infer<
  typeof nodeStatusResponseSchema
>;
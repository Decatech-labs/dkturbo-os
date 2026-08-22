import { z } from 'zod';

export const environmentSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  );

export const serviceInstanceKeySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  );

export const registerServiceInstanceRequestSchema =
  z.object({
    key: serviceInstanceKeySchema,
    serviceId: z.string().uuid(),
    nodeId: z.string().uuid(),
    environment: environmentSchema,
  });

export type RegisterServiceInstanceRequest =
  z.infer<
    typeof registerServiceInstanceRequestSchema
  >;

export const serviceInstanceResponseSchema =
  z.object({
    id: z.string().uuid(),
    key: serviceInstanceKeySchema,
    serviceId: z.string().uuid(),
    nodeId: z.string().uuid(),
    environment: environmentSchema,
    createdAt: z.string().datetime(),
  });

export type ServiceInstanceResponse =
  z.infer<
    typeof serviceInstanceResponseSchema
  >;

export const serviceInstanceParamsSchema =
  z.object({
    id: z.string().uuid(),
  });

export type ServiceInstanceParams =
  z.infer<
    typeof serviceInstanceParamsSchema
  >;

export const serviceRuntimeStateSchema =
  z.enum([
    'RUNNING',
    'STOPPED',
    'MISSING',
  ]);

export type ServiceRuntimeState =
  z.infer<
    typeof serviceRuntimeStateSchema
  >;

export const serviceRuntimeKindSchema =
  z.enum([
    'docker',
  ]);

export type ServiceRuntimeKind =
  z.infer<
    typeof serviceRuntimeKindSchema
  >;

export const serviceInstanceRuntimeSnapshotSchema =
  z.object({
    runtimeKind:
      serviceRuntimeKindSchema,

    resourceName:
      z.string().min(1),

    state:
      serviceRuntimeStateSchema,
  });

export type ServiceInstanceRuntimeSnapshot =
  z.infer<
    typeof serviceInstanceRuntimeSnapshotSchema
  >;

export const serviceInstanceObservedStateResponseSchema =
  z.object({
    serviceInstanceId:
      z.string().uuid(),

    collectedAt:
      z.string()
        .datetime()
        .nullable(),

    runtimeSnapshot:
      serviceInstanceRuntimeSnapshotSchema
        .nullable(),
  });

export type ServiceInstanceObservedStateResponse =
  z.infer<
    typeof serviceInstanceObservedStateResponseSchema
  >;
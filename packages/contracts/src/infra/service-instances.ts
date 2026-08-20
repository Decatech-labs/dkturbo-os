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

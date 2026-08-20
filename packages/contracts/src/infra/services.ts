import { z } from 'zod';

export const serviceKeySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  );

export const registerServiceRequestSchema =
  z.object({
    key: serviceKeySchema,
    name: z.string().trim().min(1),
  });

export type RegisterServiceRequest = z.infer<
  typeof registerServiceRequestSchema
>;

export const serviceResponseSchema = z.object({
  id: z.string().uuid(),
  key: serviceKeySchema,
  name: z.string(),
  createdAt: z.string().datetime(),
});

export type ServiceResponse = z.infer<
  typeof serviceResponseSchema
>;

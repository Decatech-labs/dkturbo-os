import { z } from 'zod';

export const resourceRefSchema = z.object({
  kind: z.string().trim().min(1),
  id: z.string().trim().min(1),
});

export const requestActionRequestSchema =
  z.object({
    actionKey: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        /^[a-z][a-z0-9]*(?:\.[a-z0-9]+)*$/,
      ),

    target: resourceRefSchema,

    parameters: z
      .record(
        z.string(),
        z.unknown(),
      )
      .default({}),
  });

export type RequestActionRequest = z.infer<
  typeof requestActionRequestSchema
>;

export const actionRequestResponseSchema =
  z.object({
    id: z.string().uuid(),
    actionKey: z.string(),
    target: resourceRefSchema,
    parameters: z.record(
      z.string(),
      z.unknown(),
    ),
    status: z.literal('REQUESTED'),
    requestedAt: z.string().datetime(),
  });

export type ActionRequestResponse =
  z.infer<
    typeof actionRequestResponseSchema
  >;

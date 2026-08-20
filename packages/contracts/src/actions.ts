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
    
    requestedBy: z.object({
      kind: z.string().trim().min(1),
      id: z.string().trim().min(1),
    }),

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
    requestedBy: z.object({
      kind: z.string(),
      id: z.string(),
    }),
  });

export type ActionRequestResponse =
  z.infer<
    typeof actionRequestResponseSchema
  >;

  export const actionRequestParamsSchema =
  z.object({
    id: z.string().uuid(),
  });

export const authorizationDecisionResponseSchema =
  z.object({
    outcome: z.enum([
      'ALLOW',
      'DENY',
      'STEP_UP_REQUIRED',
      'APPROVAL_REQUIRED',
    ]),
    reason: z.string(),
  });

export type AuthorizationDecisionResponse =
  z.infer<
    typeof authorizationDecisionResponseSchema
  >;
import { z } from 'zod';

export const resourceRefSchema = z.object({
  kind: z.string().trim().min(1),
  id: z.string().trim().min(1),
});

export const requestActionRequestSchema = z.object({
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

export const actionRequestResponseSchema = z.object({
  id: z.string().uuid(),
  actionKey: z.string(),
  target: resourceRefSchema,
  parameters: z.record(
    z.string(),
    z.unknown(),
  ),
  status: z.enum([
    'REQUESTED',
    'AWAITING_APPROVAL',
    'READY',
    'DENIED',
  ]),
  requestedAt: z.string().datetime(),
  requestedBy: z.object({
    kind: z.string(),
    id: z.string(),
  }),
});

export type ActionRequestResponse = z.infer<
  typeof actionRequestResponseSchema
>;

export const actionRequestParamsSchema = z.object({
  id: z.string().uuid(),
});

export const authorizationDecisionResponseSchema = z.object({
  outcome: z.enum([
    'ALLOW',
    'DENY',
    'STEP_UP_REQUIRED',
    'APPROVAL_REQUIRED',
  ]),
  reason: z.string(),
});

export type AuthorizationDecisionResponse = z.infer<
  typeof authorizationDecisionResponseSchema
>;

export const processActionRequestResponseSchema = z.discriminatedUnion(
  'outcome',
  [
    z.object({
      outcome:
        z.literal('DENIED'),
    }),

    z.object({
      outcome:
        z.literal(
          'STEP_UP_REQUIRED',
        ),
    }),

    z.object({
      outcome:
        z.literal(
          'APPROVAL_REQUIRED',
        ),
      approvalRequestId:
        z.string().uuid(),
    }),

    z.object({
      outcome:
        z.literal('READY'),
      executionId:
        z.string().uuid(),
    }),
  ],
);

export type ProcessActionRequestResponse = z.infer<
  typeof processActionRequestResponseSchema
>;

export const approvalRequestParamsSchema = z.object({
  id: z.string().uuid(),
});

export const decideApprovalRequestSchema = z.object({
  decision: z.enum([
    'APPROVE',
    'REJECT',
  ]),

  decidedBy: z.object({
    kind: z.string().trim().min(1),
    id: z.string().trim().min(1),
  }),
});

export type DecideApprovalRequestRequest = z.infer<
  typeof decideApprovalRequestSchema
>;

export const decideApprovalResponseSchema = z.discriminatedUnion(
  'outcome',
  [
    z.object({
      outcome:
        z.literal('REJECTED'),
    }),

    z.object({
      outcome:
        z.literal('APPROVED'),
      executionId:
        z.string().uuid(),
    }),
  ],
);
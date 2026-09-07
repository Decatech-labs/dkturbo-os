import {
  z,
} from 'zod';

export const familyUserRoleSchema =
  z.enum([
    'owner',
    'member',
    'guest',
  ]);

export const creatableFamilyUserRoleSchema =
  z.enum([
    'member',
    'guest',
  ]);

export const createFamilyUserRequestSchema =
  z.object({
    name:
      z.string()
        .trim()
        .min(1)
        .max(120),

    email:
      z.string()
        .trim()
        .toLowerCase()
        .email()
        .max(254),

    password:
      z.string()
        .min(8)
        .max(128),

    role:
      creatableFamilyUserRoleSchema,
  });

export type CreateFamilyUserRequest =
  z.infer<
    typeof createFamilyUserRequestSchema
  >;

export const familyUserResponseSchema =
  z.object({
    id:
      z.string().uuid(),

    name:
      z.string(),

    role:
      familyUserRoleSchema,

    createdAt:
      z.string().datetime(),
  });

export type FamilyUserResponse =
  z.infer<
    typeof familyUserResponseSchema
  >;

export const pendingApprovalResponseSchema =
  z.object({
    id:
      z.string().uuid(),

    actionRequestId:
      z.string().uuid(),

    requestedAt:
      z.string().datetime(),

    requestedBy:
      z.object({
        kind:
          z.string(),

        id:
          z.string(),
      }),

    actionKey:
      z.string(),

    target:
      z.object({
        kind:
          z.string(),

        id:
          z.string(),
      }),
  });

export type PendingApprovalResponse =
  z.infer<
    typeof pendingApprovalResponseSchema
  >;
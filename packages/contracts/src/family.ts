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

export const familyUserParamsSchema =
  z.object({
    id:
      z.string().uuid(),
  });

export const updateFamilyUserRoleRequestSchema =
  z.object({
    role:
      creatableFamilyUserRoleSchema,
  });

export const resetFamilyUserPasswordRequestSchema =
  z.object({
    password:
      z.string()
        .min(8)
        .max(128),
  });

export type UpdateFamilyUserRoleRequest =
  z.infer<
    typeof updateFamilyUserRoleRequestSchema
  >;

export type ResetFamilyUserPasswordRequest =
  z.infer<
    typeof resetFamilyUserPasswordRequestSchema
  >;

export const familyPermissionResponseSchema =
  z.object({
    id:
      z.string().uuid(),

    userId:
      z.string().uuid(),

    actionKey:
      z.string(),

    target:
      z.object({
        kind:
          z.string(),

        id:
          z.string(),
      }),

    grantedByUserId:
      z.string().uuid(),

    grantedAt:
      z.string().datetime(),
  });

export const grantFamilyPermissionRequestSchema =
  z.object({
    actionKey:
      z.enum([
        'service.restart',
        'node.system.info.read',
        'node.runtime.snapshot.read',
      ]),

    target:
      z.object({
        kind:
          z.enum([
            'infra.node',
            'infra.service',
            'infra.service-instance',
          ]),

        id:
          z.string()
            .trim()
            .min(1),
      }),
  });

export const familyPermissionParamsSchema =
  z.object({
    id:
      z.string().uuid(),

    permissionId:
      z.string().uuid(),
  });

export type FamilyPermissionResponse =
  z.infer<
    typeof familyPermissionResponseSchema
  >;

export type GrantFamilyPermissionRequest =
  z.infer<
    typeof grantFamilyPermissionRequestSchema
  >;

export const dkturboAppIdSchema =
  z.enum([
    'system',
    'family',
    'training',
    'files',
    'photos',
    'automations',
    'security',
  ]);

export type DkturboAppId =
  z.infer<
    typeof dkturboAppIdSchema
  >;

export const accessPermissionKeys =
  [
    'app.system.access',
    'system.services.restart',

    'app.family.access',
    'family.users.create',
    'family.users.manage',

    'app.training.access',
    
    'app.files.access',
    'app.photos.access',
    'app.automations.access',
    'app.security.access',
  ] as const;

export const accessPermissionKeySchema =
  z.enum(
    accessPermissionKeys,
  );

export type AccessPermissionKey =
  z.infer<
    typeof accessPermissionKeySchema
  >;

export const accessProfileResponseSchema =
  z.object({
    userId:
      z.string().uuid(),

    role:
      familyUserRoleSchema,

    permissions:
      z.array(
        accessPermissionKeySchema,
      ),
  });

export type AccessProfileResponse =
  z.infer<
    typeof accessProfileResponseSchema
  >;

export const setAccessPermissionRequestSchema =
  z.object({
    permission:
      accessPermissionKeySchema,

    enabled:
      z.boolean(),
  });

export type SetAccessPermissionRequest =
  z.infer<
    typeof setAccessPermissionRequestSchema
  >;

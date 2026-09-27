import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  DkturboUserId,
  NutritionPersonAccess,
  NutritionPersonAccessRole,
} from '../domain/index.js';

import type {
  PersonAccessRepository,
} from '../ports/index.js';

import {
  getEffectiveNutritionPersonAccess,
  NutritionPersonManageAccessDeniedError,
  NutritionPersonReadAccessDeniedError,
  requireNutritionPersonManageAccess,
  requireNutritionPersonReadAccess,
} from './require-person-access.js';

const actorUserId =
  '11111111-1111-4111-8111-111111111111' as
    DkturboUserId;

const subjectUserId =
  '22222222-2222-4222-8222-222222222222' as
    DkturboUserId;

const createAccess =
  (
    role:
      NutritionPersonAccessRole,
  ): NutritionPersonAccess => ({
    id:
      '33333333-3333-4333-8333-333333333333' as
        NutritionPersonAccess['id'],

    granteeUserId:
      actorUserId,

    subjectUserId,

    role,

    createdAt:
      new Date(
        '2026-09-24T06:00:00.000Z',
      ),

    updatedAt:
      new Date(
        '2026-09-24T06:00:00.000Z',
      ),
  });

const createRepository =
  (
    access:
      NutritionPersonAccess | null,
  ): PersonAccessRepository => ({
    findAccess:
      async (
        granteeUserId,
        requestedSubjectUserId,
      ) => {

        if (
          access &&
          access.granteeUserId ===
            granteeUserId &&
          access.subjectUserId ===
            requestedSubjectUserId
        ) {
          return access;
        }

        return null;
      },

    listForGrantee:
      async () =>
        access
          ? [
              access,
            ]
          : [],

    grantAccess:
      async () => {
        throw new Error(
          'Unexpected grantAccess',
        );
      },

    revokeAccess:
      async () =>
        false,
  });

describe(
  'Nutrition person access',
  () => {

    it(
      'treats access to own Nutrition data as MANAGER implicitly',
      async () => {

        const repository =
          createRepository(
            null,
          );

        await expect(
          getEffectiveNutritionPersonAccess(
            repository,
            actorUserId,
            actorUserId,
          ),
        ).resolves.toBe(
          'MANAGER',
        );
      },
    );

    it(
      'denies reading another person without explicit access',
      async () => {

        const repository =
          createRepository(
            null,
          );

        await expect(
          requireNutritionPersonReadAccess(
            repository,
            actorUserId,
            subjectUserId,
          ),
        ).rejects.toBeInstanceOf(
          NutritionPersonReadAccessDeniedError,
        );
      },
    );

    it(
      'allows VIEWER to read another person',
      async () => {

        const repository =
          createRepository(
            createAccess(
              'VIEWER',
            ),
          );

        await expect(
          requireNutritionPersonReadAccess(
            repository,
            actorUserId,
            subjectUserId,
          ),
        ).resolves.toBeUndefined();
      },
    );

    it(
      'does not allow VIEWER to manage another person',
      async () => {

        const repository =
          createRepository(
            createAccess(
              'VIEWER',
            ),
          );

        await expect(
          requireNutritionPersonManageAccess(
            repository,
            actorUserId,
            subjectUserId,
          ),
        ).rejects.toBeInstanceOf(
          NutritionPersonManageAccessDeniedError,
        );
      },
    );

    it(
      'allows MANAGER to read another person',
      async () => {

        const repository =
          createRepository(
            createAccess(
              'MANAGER',
            ),
          );

        await expect(
          requireNutritionPersonReadAccess(
            repository,
            actorUserId,
            subjectUserId,
          ),
        ).resolves.toBeUndefined();
      },
    );

    it(
      'allows MANAGER to manage another person',
      async () => {

        const repository =
          createRepository(
            createAccess(
              'MANAGER',
            ),
          );

        await expect(
          requireNutritionPersonManageAccess(
            repository,
            actorUserId,
            subjectUserId,
          ),
        ).resolves.toBeUndefined();
      },
    );
  },
);

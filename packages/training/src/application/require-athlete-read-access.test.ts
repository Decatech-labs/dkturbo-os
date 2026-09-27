import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  AthleteAccess,
  AthleteId,
  DkturboUserId,
} from '../domain/index.js';

import type {
  AthleteRepository,
} from '../ports/index.js';

import {
  AthleteReadAccessDeniedError,
  requireAthleteReadAccess,
} from './require-athlete-read-access.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const repository =
  (
    access:
      AthleteAccess | null,
  ): AthleteRepository => ({
    create:
      vi.fn(),

    findById:
      vi.fn(),

    listAll:
      vi.fn(),

    listForUser:
      vi.fn(),

    grantAccess:
      vi.fn(),

    revokeAccess:
      vi.fn(),

    findAccess:
      vi.fn()
        .mockResolvedValue(
          access,
        ),
  });

describe(
  'requireAthleteReadAccess',
  () => {

    for (
      const role
      of [
        'SELF',
        'COACH',
        'VIEWER',
      ] as const
    ) {

      it(
        `allows ${role}`,
        async () => {

          const access:
            AthleteAccess = {
              id:
                '90000000-0000-4000-8000-000000000001',

              athleteId,

              userId,

              role,

              createdAt:
                new Date(),
            };

          await expect(
            requireAthleteReadAccess(
              repository(
                access,
              ),
              athleteId,
              userId,
            ),
          ).resolves.toEqual(
            access,
          );
        },
      );
    }

    it(
      'rejects a user without athlete access',
      async () => {

        await expect(
          requireAthleteReadAccess(
            repository(
              null,
            ),
            athleteId,
            userId,
          ),
        ).rejects.toBeInstanceOf(
          AthleteReadAccessDeniedError,
        );
      },
    );
  },
);

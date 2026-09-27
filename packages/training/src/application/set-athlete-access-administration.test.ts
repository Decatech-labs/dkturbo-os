import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  Athlete,
  AthleteAccess,
  AthleteId,
  DkturboUserId,
} from '../domain/index.js';

import type {
  AthleteRepository,
  SessionRepository,
  SessionStructureRepository,
  TrainingUnitOfWork,
  WeekRepository,
} from '../ports/index.js';

import {
  setAthleteAccessAdministration,
} from './set-athlete-access-administration.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const now =
  new Date(
    '2026-09-19T18:00:00Z',
  );

const athlete:
  Athlete = {
    id:
      athleteId,

    displayName:
      'Alejandro',

    createdAt:
      now,

    updatedAt:
      now,
  };

const access:
  AthleteAccess = {
    id:
      '30000000-0000-4000-8000-000000000001',

    athleteId,

    userId,

    role:
      'COACH',

    createdAt:
      now,
  };

const createRepository =
  (): AthleteRepository => ({

    create:
      vi.fn(),

    findById:
      vi.fn()
        .mockResolvedValue(
          athlete,
        ),

    listAll:
      vi.fn(),

    listForUser:
      vi.fn(),

    grantAccess:
      vi.fn()
        .mockResolvedValue(
          access,
        ),

    findAccess:
      vi.fn(),

    revokeAccess:
      vi.fn()
        .mockResolvedValue(
          true,
        ),
  });

const createUnitOfWork =
  (
    athletes:
      AthleteRepository,
  ): TrainingUnitOfWork => ({

    execute:
      async (
        work,
      ) =>
        work({
          athletes,

          weeks:
            {} as WeekRepository,

          sessions:
            {} as SessionRepository,

          sessionStructure:
            {} as SessionStructureRepository,

          dailyCheckins:
            {} as never,
        }),
  });

describe(
  'setAthleteAccessAdministration',
  () => {

    it(
      'sets an athlete access role',
      async () => {

        const repository =
          createRepository();

        const result =
          await setAthleteAccessAdministration(
            createUnitOfWork(
              repository,
            ),
            {
              athleteId,

              userId,

              role:
                'COACH',
            },
          );

        expect(
          repository.grantAccess,
        ).toHaveBeenCalledWith({
          athleteId,

          userId,

          role:
            'COACH',
        });

        expect(
          result.access,
        ).toEqual(
          access,
        );
      },
    );

    it(
      'revokes athlete access when role is null',
      async () => {

        const repository =
          createRepository();

        const result =
          await setAthleteAccessAdministration(
            createUnitOfWork(
              repository,
            ),
            {
              athleteId,

              userId,

              role:
                null,
            },
          );

        expect(
          repository.revokeAccess,
        ).toHaveBeenCalledWith(
          athleteId,
          userId,
        );

        expect(
          repository.grantAccess,
        ).not.toHaveBeenCalled();

        expect(
          result.access,
        ).toBeNull();
      },
    );

    it(
      'rejects an unknown athlete',
      async () => {

        const repository =
          createRepository();

        vi.mocked(
          repository.findById,
        ).mockResolvedValue(
          null,
        );

        await expect(
          setAthleteAccessAdministration(
            createUnitOfWork(
              repository,
            ),
            {
              athleteId,

              userId,

              role:
                'VIEWER',
            },
          ),
        ).rejects.toThrow(
          'Training athlete not found',
        );

        expect(
          repository.grantAccess,
        ).not.toHaveBeenCalled();

        expect(
          repository.revokeAccess,
        ).not.toHaveBeenCalled();
      },
    );
  },
);

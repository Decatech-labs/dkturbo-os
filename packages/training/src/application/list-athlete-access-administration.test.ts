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
  listAthleteAccessAdministration,
} from './list-athlete-access-administration.js';

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const athleteOneId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const athleteTwoId =
  '20000000-0000-4000-8000-000000000002' as AthleteId;

const now =
  new Date(
    '2026-09-19T18:00:00Z',
  );

const athletesList:
  Athlete[] = [
    {
      id:
        athleteOneId,

      displayName:
        'Alejandro',

      createdAt:
        now,

      updatedAt:
        now,
    },

    {
      id:
        athleteTwoId,

      displayName:
        'Atleta 2',

      createdAt:
        now,

      updatedAt:
        now,
    },
  ];

const access:
  AthleteAccess = {
    id:
      '30000000-0000-4000-8000-000000000001',

    athleteId:
      athleteOneId,

    userId,

    role:
      'VIEWER',

    createdAt:
      now,
  };

const createRepository =
  (): AthleteRepository => ({

    create:
      vi.fn(),

    findById:
      vi.fn(),

    listAll:
      vi.fn()
        .mockResolvedValue(
          athletesList,
        ),

    listForUser:
      vi.fn(),

    grantAccess:
      vi.fn(),

    findAccess:
      vi.fn()
        .mockImplementation(
          async (
            athleteId,
          ) =>
            athleteId ===
              athleteOneId
              ? access
              : null,
        ),

    revokeAccess:
      vi.fn(),
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
  'listAthleteAccessAdministration',
  () => {

    it(
      'lists every athlete with the role configured for the target user',
      async () => {

        const repository =
          createRepository();

        const result =
          await listAthleteAccessAdministration(
            createUnitOfWork(
              repository,
            ),
            {
              userId,
            },
          );

        expect(
          result,
        ).toEqual([
          {
            athlete:
              athletesList[0],

            role:
              'VIEWER',
          },

          {
            athlete:
              athletesList[1],

            role:
              null,
          },
        ]);

        expect(
          repository.findAccess,
        ).toHaveBeenCalledTimes(
          2,
        );
      },
    );
  },
);

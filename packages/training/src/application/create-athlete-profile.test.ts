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
  TrainingUnitOfWork,
  WeekRepository,
} from '../ports/index.js';

import {
  createAthleteProfile,
} from './create-athlete-profile.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const athlete: Athlete = {
  id:
    athleteId,

  displayName:
    'Alejandro',

  createdAt:
    new Date(
      '2026-09-08T17:00:00Z',
    ),

  updatedAt:
    new Date(
      '2026-09-08T17:00:00Z',
    ),
};

const access: AthleteAccess = {
  id:
    '30000000-0000-4000-8000-000000000001',

  athleteId,

  userId,

  role:
    'SELF',

  createdAt:
    new Date(
      '2026-09-08T17:00:00Z',
    ),
};

const createRepository =
  (): AthleteRepository => ({
    create:
      vi.fn()
        .mockResolvedValue(
          athlete,
        ),

    findById:
      vi.fn()
        .mockResolvedValue(
          athlete,
        ),

    listForUser:
      vi.fn()
        .mockResolvedValue([
          athlete,
        ]),

    grantAccess:
      vi.fn()
        .mockResolvedValue(
          access,
        ),

    findAccess:
      vi.fn()
        .mockResolvedValue(
          access,
        ),
  });

const weekRepository = 
  {} as WeekRepository;

const createUnitOfWork =
  (
    repository:
      AthleteRepository,
  ): TrainingUnitOfWork => ({
    execute:
      async (work) =>
        work({
          athletes:
            repository,

          weeks:
            weekRepository,
        }),
  });

describe(
  'createAthleteProfile',
  () => {

    it(
      'creates the athlete and grants SELF access in one unit of work',
      async () => {

        const repository =
          createRepository();

        const unitOfWork =
          createUnitOfWork(
            repository,
          );

        const result =
          await createAthleteProfile(
            unitOfWork,
            {
              userId,

              displayName:
                '  Alejandro  ',
            },
          );

        expect(
          repository.create,
        ).toHaveBeenCalledWith({
          displayName:
            'Alejandro',
        });

        expect(
          repository.grantAccess,
        ).toHaveBeenCalledWith({
          athleteId,
          userId,
          role:
            'SELF',
        });

        expect(
          result.athlete,
        ).toEqual(
          athlete,
        );
      },
    );

    it(
      'rejects an empty display name before opening the unit of work',
      async () => {

        const repository =
          createRepository();

        const execute =
          vi.fn();

        const unitOfWork:
          TrainingUnitOfWork = {
            execute,
          };

        await expect(
          createAthleteProfile(
            unitOfWork,
            {
              userId,
              displayName:
                '   ',
            },
          ),
        ).rejects.toThrow(
          'Athlete display name is required',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();

        expect(
          repository.create,
        ).not.toHaveBeenCalled();

        expect(
          repository.grantAccess,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'propagates a failure while granting SELF access',
      async () => {

        const repository =
          createRepository();

        vi.mocked(
          repository.grantAccess,
        ).mockRejectedValue(
          new Error(
            'grant failed',
          ),
        );

        const unitOfWork =
          createUnitOfWork(
            repository,
          );

        await expect(
          createAthleteProfile(
            unitOfWork,
            {
              userId,
              displayName:
                'Alejandro',
            },
          ),
        ).rejects.toThrow(
          'grant failed',
        );

        expect(
          repository.create,
        ).toHaveBeenCalledOnce();

        expect(
          repository.grantAccess,
        ).toHaveBeenCalledOnce();
      },
    );
  },
);

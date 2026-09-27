import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  AthleteAccess,
  AthleteId,
  DailyCheckin,
  DkturboUserId,
} from '../domain/index.js';

import type {
  AthleteRepository,
  DailyCheckinRepository,
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  AthleteReadAccessDeniedError,
} from './require-athlete-read-access.js';

import {
  getDailyCheckin,
} from './get-daily-checkin.js';

const athleteId =
  '11111111-1111-4111-8111-111111111111' as
    AthleteId;

const userId =
  '22222222-2222-4222-8222-222222222222' as
    DkturboUserId;

const date =
  '2026-09-19';

const checkin: DailyCheckin = {
  id:
    '33333333-3333-4333-8333-333333333333' as
      DailyCheckin['id'],

  athleteId,

  date,

  weightKg:
    83.2,

  sleepQuality:
    4,

  fatigue:
    2,

  soreness:
    3,

  stress:
    1,

  motivation:
    5,

  notes:
    'Buen día.',

  recordedByUserId:
    userId,

  createdAt:
    new Date(
      '2026-09-19T08:00:00.000Z',
    ),

  updatedAt:
    new Date(
      '2026-09-19T08:00:00.000Z',
    ),
};

const createUnitOfWork =
  (
    access:
      AthleteAccess | null,

    result:
      DailyCheckin | null,
  ): {
    unitOfWork:
      TrainingUnitOfWork;

    dailyCheckins:
      DailyCheckinRepository;
  } => {

    const athletes = {
      findAccess:
        vi.fn()
          .mockResolvedValue(
            access,
          ),
    } as unknown as
      AthleteRepository;

    const dailyCheckins = {
      findByAthleteAndDate:
        vi.fn()
          .mockResolvedValue(
            result,
          ),

      listByAthleteAndDateRange:
        vi.fn(),

      save:
        vi.fn(),
    } satisfies
      DailyCheckinRepository;

    const unitOfWork: TrainingUnitOfWork = {
      execute:
        async (
          work,
        ) =>
          work({
            athletes,

            weeks:
              {} as never,

            sessions:
              {} as never,

            sessionStructure:
              {} as never,

            dailyCheckins,
          }),
    };

    return {
      unitOfWork,
      dailyCheckins,
    };
  };

const access =
  (
    role:
      AthleteAccess['role'],
  ): AthleteAccess => ({
    id:
      '44444444-4444-4444-8444-444444444444' as
        AthleteAccess['id'],

    athleteId,

    userId,

    role,

    createdAt:
      new Date(),
  });

describe(
  'getDailyCheckin',
  () => {

    it(
      'returns the daily check-in when the user has SELF access',
      async () => {

        const {
          unitOfWork,
        } =
          createUnitOfWork(
            access(
              'SELF',
            ),
            checkin,
          );

        await expect(
          getDailyCheckin(
            unitOfWork,
            {
              athleteId,
              userId,
              date,
            },
          ),
        ).resolves.toEqual(
          checkin,
        );
      },
    );

    it(
      'allows VIEWER access',
      async () => {

        const {
          unitOfWork,
        } =
          createUnitOfWork(
            access(
              'VIEWER',
            ),
            checkin,
          );

        await expect(
          getDailyCheckin(
            unitOfWork,
            {
              athleteId,
              userId,
              date,
            },
          ),
        ).resolves.toEqual(
          checkin,
        );
      },
    );

    it(
      'returns null when no check-in exists for the date',
      async () => {

        const {
          unitOfWork,
        } =
          createUnitOfWork(
            access(
              'COACH',
            ),
            null,
          );

        await expect(
          getDailyCheckin(
            unitOfWork,
            {
              athleteId,
              userId,
              date,
            },
          ),
        ).resolves.toBeNull();
      },
    );

    it(
      'denies users without athlete access',
      async () => {

        const {
          unitOfWork,
          dailyCheckins,
        } =
          createUnitOfWork(
            null,
            checkin,
          );

        await expect(
          getDailyCheckin(
            unitOfWork,
            {
              athleteId,
              userId,
              date,
            },
          ),
        ).rejects.toBeInstanceOf(
          AthleteReadAccessDeniedError,
        );

        expect(
          dailyCheckins
            .findByAthleteAndDate,
        ).not.toHaveBeenCalled();
      },
    );
  },
);

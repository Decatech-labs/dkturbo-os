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
  AthleteAccessDeniedError,
} from './require-athlete-write-access.js';

import {
  InvalidDailyCheckinError,
  saveDailyCheckin,
} from './save-daily-checkin.js';

const athleteId =
  '11111111-1111-4111-8111-111111111111' as
    AthleteId;

const userId =
  '22222222-2222-4222-8222-222222222222' as
    DkturboUserId;

const storedCheckin: DailyCheckin = {
  id:
    '33333333-3333-4333-8333-333333333333' as
      DailyCheckin['id'],

  athleteId,

  date:
    '2026-09-19',

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
    new Date(),

  updatedAt:
    new Date(),
};

const createUnitOfWork =
  (
    role:
      AthleteAccess['role'] | null,
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
            role ===
              null
              ? null
              : {
                  id:
                    '44444444-4444-4444-8444-444444444444',

                  athleteId,

                  userId,

                  role,

                  createdAt:
                    new Date(),
                },
          ),
    } as unknown as
      AthleteRepository;

    const dailyCheckins = {
      findByAthleteAndDate:
        vi.fn(),

      listByAthleteAndDateRange:
        vi.fn(),

      save:
        vi.fn()
          .mockResolvedValue(
            storedCheckin,
          ),
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

const validInput = {
  athleteId,
  userId,

  date:
    '2026-09-19',

  weightKg:
    83.2,

  sleepQuality:
    4 as const,

  fatigue:
    2 as const,

  soreness:
    3 as const,

  stress:
    1 as const,

  motivation:
    5 as const,

  notes:
    '  Buen día.  ',
};

describe(
  'saveDailyCheckin',
  () => {

    it(
      'allows SELF to save a daily check-in',
      async () => {

        const {
          unitOfWork,
          dailyCheckins,
        } =
          createUnitOfWork(
            'SELF',
          );

        await expect(
          saveDailyCheckin(
            unitOfWork,
            validInput,
          ),
        ).resolves.toEqual(
          storedCheckin,
        );

        expect(
          dailyCheckins.save,
        ).toHaveBeenCalledWith({
          athleteId,

          date:
            '2026-09-19',

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
        });
      },
    );

    it(
      'allows COACH to save a daily check-in',
      async () => {

        const {
          unitOfWork,
        } =
          createUnitOfWork(
            'COACH',
          );

        await expect(
          saveDailyCheckin(
            unitOfWork,
            validInput,
          ),
        ).resolves.toEqual(
          storedCheckin,
        );
      },
    );

    it(
      'denies VIEWER write access',
      async () => {

        const {
          unitOfWork,
          dailyCheckins,
        } =
          createUnitOfWork(
            'VIEWER',
          );

        await expect(
          saveDailyCheckin(
            unitOfWork,
            validInput,
          ),
        ).rejects.toBeInstanceOf(
          AthleteAccessDeniedError,
        );

        expect(
          dailyCheckins.save,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects invalid check-in values before persistence',
      async () => {

        const {
          unitOfWork,
          dailyCheckins,
        } =
          createUnitOfWork(
            'SELF',
          );

        await expect(
          saveDailyCheckin(
            unitOfWork,
            {
              ...validInput,

              date:
                '2026-02-31',
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidDailyCheckinError,
        );

        expect(
          dailyCheckins.save,
        ).not.toHaveBeenCalled();
      },
    );
  },
);

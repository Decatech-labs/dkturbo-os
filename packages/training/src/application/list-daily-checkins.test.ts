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
  InvalidDailyCheckinRangeError,
  listDailyCheckins,
} from './list-daily-checkins.js';

const athleteId =
  '11111111-1111-4111-8111-111111111111' as
    AthleteId;

const userId =
  '22222222-2222-4222-8222-222222222222' as
    DkturboUserId;

const makeCheckin =
  (
    id:
      string,

    date:
      string,

    values: {
      weightKg:
        number | null;

      sleepQuality:
        DailyCheckin['sleepQuality'];

      fatigue:
        DailyCheckin['fatigue'];

      soreness:
        DailyCheckin['soreness'];

      stress:
        DailyCheckin['stress'];

      motivation:
        DailyCheckin['motivation'];

      notes?:
        string | null;
    },
  ): DailyCheckin => ({
    id:
      id as
        DailyCheckin['id'],

    athleteId,

    date,

    weightKg:
      values.weightKg,

    sleepQuality:
      values.sleepQuality,

    fatigue:
      values.fatigue,

    soreness:
      values.soreness,

    stress:
      values.stress,

    motivation:
      values.motivation,

    notes:
      values.notes ??
      null,

    recordedByUserId:
      userId,

    createdAt:
      new Date(
        `${date}T08:00:00.000Z`,
      ),

    updatedAt:
      new Date(
        `${date}T08:00:00.000Z`,
      ),
  });

const checkins:
  DailyCheckin[] = [
    makeCheckin(
      '33333333-3333-4333-8333-333333333331',
      '2026-09-21',
      {
        weightKg:
          83.2,

        sleepQuality:
          4,

        fatigue:
          2,

        soreness:
          null,

        stress:
          1,

        motivation:
          5,
      },
    ),

    makeCheckin(
      '33333333-3333-4333-8333-333333333332',
      '2026-09-22',
      {
        weightKg:
          null,

        sleepQuality:
          null,

        fatigue:
          3,

        soreness:
          4,

        stress:
          null,

        motivation:
          4,

        notes:
          'Carga acumulada.',
      },
    ),

    makeCheckin(
      '33333333-3333-4333-8333-333333333333',
      '2026-09-23',
      {
        weightKg:
          82.8,

        sleepQuality:
          2,

        fatigue:
          null,

        soreness:
          2,

        stress:
          3,

        motivation:
          null,
      },
    ),
  ];

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

const createUnitOfWork =
  (
    athleteAccess:
      AthleteAccess | null,

    result:
      DailyCheckin[],
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
            athleteAccess,
          ),
    } as unknown as
      AthleteRepository;

    const dailyCheckins = {
      findByAthleteAndDate:
        vi.fn(),

      listByAthleteAndDateRange:
        vi.fn()
          .mockResolvedValue(
            result,
          ),

      save:
        vi.fn(),
    } satisfies
      DailyCheckinRepository;

    const unitOfWork:
      TrainingUnitOfWork = {

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

describe(
  'listDailyCheckins',
  () => {

    it(
      'returns an inclusive date range with the weekly summary',
      async () => {

        const {
          unitOfWork,
          dailyCheckins,
        } =
          createUnitOfWork(
            access(
              'SELF',
            ),
            checkins,
          );

        const result =
          await listDailyCheckins(
            unitOfWork,
            {
              athleteId,

              userId,

              from:
                '2026-09-21',

              to:
                '2026-09-27',
            },
          );

        expect(
          result.checkins,
        ).toEqual(
          checkins,
        );

        expect(
          dailyCheckins
            .listByAthleteAndDateRange,
        ).toHaveBeenCalledWith(
          athleteId,
          '2026-09-21',
          '2026-09-27',
        );

        expect(
          result.summary,
        ).toEqual({
          from:
            '2026-09-21',

          to:
            '2026-09-27',

          recordedDays:
            3,

          periodDays:
            7,

          weight: {
            first:
              83.2,

            last:
              82.8,

            average:
              83,

            difference:
              -0.4,
          },

          averages: {
            sleepQuality:
              3,

            fatigue:
              2.5,

            soreness:
              3,

            stress:
              2,

            motivation:
              4.5,
          },
        });
      },
    );

    it(
      'ignores null values when calculating averages',
      async () => {

        const {
          unitOfWork,
        } =
          createUnitOfWork(
            access(
              'COACH',
            ),
            checkins,
          );

        const result =
          await listDailyCheckins(
            unitOfWork,
            {
              athleteId,

              userId,

              from:
                '2026-09-21',

              to:
                '2026-09-23',
            },
          );

        expect(
          result.summary.averages,
        ).toEqual({
          sleepQuality:
            3,

          fatigue:
            2.5,

          soreness:
            3,

          stress:
            2,

          motivation:
            4.5,
        });

        expect(
          result.summary.weight,
        ).toEqual({
          first:
            83.2,

          last:
            82.8,

          average:
            83,

          difference:
            -0.4,
        });
      },
    );

    it(
      'returns an empty summary when the period has no check-ins',
      async () => {

        const {
          unitOfWork,
        } =
          createUnitOfWork(
            access(
              'VIEWER',
            ),
            [],
          );

        const result =
          await listDailyCheckins(
            unitOfWork,
            {
              athleteId,

              userId,

              from:
                '2026-09-21',

              to:
                '2026-09-27',
            },
          );

        expect(
          result.checkins,
        ).toEqual(
          [],
        );

        expect(
          result.summary,
        ).toEqual({
          from:
            '2026-09-21',

          to:
            '2026-09-27',

          recordedDays:
            0,

          periodDays:
            7,

          weight: {
            first:
              null,

            last:
              null,

            average:
              null,

            difference:
              null,
          },

          averages: {
            sleepQuality:
              null,

            fatigue:
              null,

            soreness:
              null,

            stress:
              null,

            motivation:
              null,
          },
        });
      },
    );

    it(
      'allows VIEWER read access',
      async () => {

        const {
          unitOfWork,
        } =
          createUnitOfWork(
            access(
              'VIEWER',
            ),
            checkins,
          );

        await expect(
          listDailyCheckins(
            unitOfWork,
            {
              athleteId,

              userId,

              from:
                '2026-09-21',

              to:
                '2026-09-27',
            },
          ),
        ).resolves.toMatchObject({
          checkins,
        });
      },
    );

    it(
      'denies users without athlete read access',
      async () => {

        const {
          unitOfWork,
          dailyCheckins,
        } =
          createUnitOfWork(
            null,
            checkins,
          );

        await expect(
          listDailyCheckins(
            unitOfWork,
            {
              athleteId,

              userId,

              from:
                '2026-09-21',

              to:
                '2026-09-27',
            },
          ),
        ).rejects.toBeInstanceOf(
          AthleteReadAccessDeniedError,
        );

        expect(
          dailyCheckins
            .listByAthleteAndDateRange,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects invalid calendar dates before persistence',
      async () => {

        const {
          unitOfWork,
          dailyCheckins,
        } =
          createUnitOfWork(
            access(
              'SELF',
            ),
            checkins,
          );

        await expect(
          listDailyCheckins(
            unitOfWork,
            {
              athleteId,

              userId,

              from:
                '2026-02-31',

              to:
                '2026-03-07',
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidDailyCheckinRangeError,
        );

        expect(
          dailyCheckins
            .listByAthleteAndDateRange,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects ranges whose start date is after the end date',
      async () => {

        const {
          unitOfWork,
          dailyCheckins,
        } =
          createUnitOfWork(
            access(
              'SELF',
            ),
            checkins,
          );

        await expect(
          listDailyCheckins(
            unitOfWork,
            {
              athleteId,

              userId,

              from:
                '2026-09-28',

              to:
                '2026-09-21',
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidDailyCheckinRangeError,
        );

        expect(
          dailyCheckins
            .listByAthleteAndDateRange,
        ).not.toHaveBeenCalled();
      },
    );
  },
);

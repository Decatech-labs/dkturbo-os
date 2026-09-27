import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  AthleteId,
  DkturboUserId,
  TrainingWeek,
  TrainingWeekId,
} from '../domain/index.js';

import type {
  AthleteRepository,
  TrainingUnitOfWork,
  WeekRepository,
} from '../ports/index.js';

import {
  AthleteAccessDeniedError,
} from './require-athlete-write-access.js';

import {
  updateWeek,
} from './update-week.js';

const athleteId =
  'f2000000-0000-4000-8000-000000000001' as
    AthleteId;

const otherAthleteId =
  'f2000000-0000-4000-8000-000000000002' as
    AthleteId;

const weekId =
  'f3000000-0000-4000-8000-000000000001' as
    TrainingWeekId;

const userId =
  'f1000000-0000-4000-8000-000000000001' as
    DkturboUserId;

const week: TrainingWeek = {
  id:
    weekId,

  athleteId,

  weekStart:
    '2026-09-14',

  status:
    'PLANNED',

  title:
    'Semana original',

  notes:
    'Notas originales',

  createdByUserId:
    userId,

  createdAt:
    new Date(
      '2026-09-10T10:00:00Z',
    ),

  updatedAt:
    new Date(
      '2026-09-10T10:00:00Z',
    ),
};

const createAthleteRepository =
  (
    role:
      'SELF' | 'COACH' | 'VIEWER' | null,
  ): AthleteRepository =>
    ({
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
            role
              ? {
                  athleteId,
                  userId,
                  role,
                }
              : null,
          ),
    }) as AthleteRepository;

const createWeekRepository =
  (): WeekRepository => ({
    createWeek:
      vi.fn(),

    updateWeek:
      vi.fn(),

    createDay:
      vi.fn(),

    findWeekById:
      vi.fn(),

    findWeekByAthleteAndStart:
      vi.fn(),

    listForAthlete:
      vi.fn(),

    findDayById:
      vi.fn(),

    listDaysForWeek:
      vi.fn(),
  });

const createUnitOfWork =
  (
    athletes:
      AthleteRepository,

    weeks:
      WeekRepository,
  ): TrainingUnitOfWork =>
    ({
      execute:
        async (
          callback,
        ) =>
          callback({
            athletes,
            weeks,
            sessions:
              {} as never,

            sessionStructure:
              {} as never,

            dailyCheckins:
              {} as never,
          }),
    }) as TrainingUnitOfWork;

describe(
  'updateWeek',
  () => {
    it(
      'updates title and notes for SELF access',
      async () => {
        const athletes =
          createAthleteRepository(
            'SELF',
          );

        const weeks =
          createWeekRepository();

        vi.mocked(
          weeks.findWeekById,
        ).mockResolvedValue(
          week,
        );

        vi.mocked(
          weeks.updateWeek,
        ).mockResolvedValue({
          ...week,

          title:
            'Semana actualizada',

          notes:
            'Nuevas notas',
        });

        const result =
          await updateWeek(
            createUnitOfWork(
              athletes,
              weeks,
            ),
            {
              athleteId,
              weekId,

              title:
                'Semana actualizada',

              notes:
                'Nuevas notas',

              userId,
            },
          );

        expect(
          result.title,
        ).toBe(
          'Semana actualizada',
        );

        expect(
          result.notes,
        ).toBe(
          'Nuevas notas',
        );

        expect(
          weeks.updateWeek,
        ).toHaveBeenCalledWith({
          weekId,
          athleteId,

          title:
            'Semana actualizada',

          notes:
            'Nuevas notas',
        });
      },
    );

    it(
      'allows COACH access',
      async () => {
        const athletes =
          createAthleteRepository(
            'COACH',
          );

        const weeks =
          createWeekRepository();

        vi.mocked(
          weeks.findWeekById,
        ).mockResolvedValue(
          week,
        );

        vi.mocked(
          weeks.updateWeek,
        ).mockResolvedValue(
          week,
        );

        await expect(
          updateWeek(
            createUnitOfWork(
              athletes,
              weeks,
            ),
            {
              athleteId,
              weekId,
              title:
                week.title,
              notes:
                week.notes,
              userId,
            },
          ),
        ).resolves.toEqual(
          week,
        );
      },
    );

    it(
      'denies VIEWER access',
      async () => {
        const athletes =
          createAthleteRepository(
            'VIEWER',
          );

        const weeks =
          createWeekRepository();

        await expect(
          updateWeek(
            createUnitOfWork(
              athletes,
              weeks,
            ),
            {
              athleteId,
              weekId,
              title:
                'No',
              notes:
                null,
              userId,
            },
          ),
        ).rejects.toBeInstanceOf(
          AthleteAccessDeniedError,
        );

        expect(
          weeks.updateWeek,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'fails when the week does not exist',
      async () => {
        const athletes =
          createAthleteRepository(
            'SELF',
          );

        const weeks =
          createWeekRepository();

        vi.mocked(
          weeks.findWeekById,
        ).mockResolvedValue(
          null,
        );

        await expect(
          updateWeek(
            createUnitOfWork(
              athletes,
              weeks,
            ),
            {
              athleteId,
              weekId,
              title:
                null,
              notes:
                null,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training week not found',
        );
      },
    );

    it(
      'hides a week belonging to another athlete',
      async () => {
        const athletes =
          createAthleteRepository(
            'SELF',
          );

        const weeks =
          createWeekRepository();

        vi.mocked(
          weeks.findWeekById,
        ).mockResolvedValue({
          ...week,

          athleteId:
            otherAthleteId,
        });

        await expect(
          updateWeek(
            createUnitOfWork(
              athletes,
              weeks,
            ),
            {
              athleteId,
              weekId,
              title:
                null,
              notes:
                null,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training week does not belong to athlete',
        );

        expect(
          weeks.updateWeek,
        ).not.toHaveBeenCalled();
      },
    );
  },
);

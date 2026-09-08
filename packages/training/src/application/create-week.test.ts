import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  AthleteId,
  DkturboUserId,
  TrainingDay,
  TrainingDayId,
  TrainingWeek,
  TrainingWeekId,
} from '../domain/index.js';

import type {
  AthleteRepository,
  TrainingUnitOfWork,
  WeekRepository,
} from '../ports/index.js';

import {
  createWeek,
} from './create-week.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const weekId =
  '30000000-0000-4000-8000-000000000001' as TrainingWeekId;

const week:
  TrainingWeek = {
    id:
      weekId,

    athleteId,

    weekStart:
      '2026-09-07',

    status:
      'DRAFT',

    title:
      null,

    notes:
      null,

    createdByUserId:
      userId,

    createdAt:
      new Date(
        '2026-09-08T17:00:00Z',
      ),

    updatedAt:
      new Date(
        '2026-09-08T17:00:00Z',
      ),
  };

const athleteRepository:
  AthleteRepository = {
    create:
      vi.fn(),

    findById:
      vi.fn(),

    listForUser:
      vi.fn(),

    grantAccess:
      vi.fn(),

    findAccess:
      vi.fn()
        .mockResolvedValue({
          id:
            '60000000-0000-4000-8000-000000000001',

          athleteId,

          userId,

          role:
            'COACH',

          createdAt:
            new Date(
              '2026-09-08T17:00:00Z',
            ),
        }),
  };

const createWeekRepository =
  (): WeekRepository => {

    let daySequence =
      0;

    return {
      createWeek:
        vi.fn()
          .mockResolvedValue(
            week,
          ),

      createDay:
        vi.fn()
          .mockImplementation(
            async (
              data,
            ): Promise<TrainingDay> => {

              daySequence += 1;

              return {
                id:
                  `40000000-0000-4000-8000-${String(
                    daySequence,
                  ).padStart(
                    12,
                    '0',
                  )}` as TrainingDayId,

                weekId:
                  data.weekId,

                athleteId:
                  data.athleteId,

                date:
                  data.date,

                notes:
                  data.notes ?? null,

                createdAt:
                  new Date(
                    '2026-09-08T17:00:00Z',
                  ),

                updatedAt:
                  new Date(
                    '2026-09-08T17:00:00Z',
                  ),
              };
            },
          ),

      findWeekById:
        vi.fn()
          .mockResolvedValue(
            null,
          ),

      findWeekByAthleteAndStart:
        vi.fn()
          .mockResolvedValue(
            null,
          ),

      listDaysForWeek:
        vi.fn()
          .mockResolvedValue(
            [],
          ),
    };
  };

const createUnitOfWork =
  (
    weeks:
      WeekRepository,
  ): TrainingUnitOfWork => ({
    execute:
      async (work) =>
        work({
          athletes:
            athleteRepository,

          weeks,
        }),
  });

describe(
  'createWeek',
  () => {

    it(
      'creates one week and exactly seven consecutive days',
      async () => {

        const weeks =
          createWeekRepository();

        const unitOfWork =
          createUnitOfWork(
            weeks,
          );

        const result =
          await createWeek(
            unitOfWork,
            {
              athleteId,

              weekStart:
                '2026-09-07',

              createdByUserId:
                userId,
            },
          );

        expect(
          weeks.createWeek,
        ).toHaveBeenCalledOnce();

        expect(
          weeks.createDay,
        ).toHaveBeenCalledTimes(
          7,
        );

        expect(
          result.days.map(
            (day) =>
              day.date,
          ),
        ).toEqual([
          '2026-09-07',
          '2026-09-08',
          '2026-09-09',
          '2026-09-10',
          '2026-09-11',
          '2026-09-12',
          '2026-09-13',
        ]);
      },
    );

    it(
      'rejects a week that does not start on Monday',
      async () => {

        const weeks =
          createWeekRepository();

        const execute =
          vi.fn();

        const unitOfWork:
          TrainingUnitOfWork = {
            execute,
          };

        await expect(
          createWeek(
            unitOfWork,
            {
              athleteId,

              weekStart:
                '2026-09-08',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'weekStart must be a Monday',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();

        expect(
          weeks.createWeek,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a duplicate week for the same athlete',
      async () => {

        const weeks =
          createWeekRepository();

        vi.mocked(
          weeks.findWeekByAthleteAndStart,
        ).mockResolvedValue(
          week,
        );

        const unitOfWork =
          createUnitOfWork(
            weeks,
          );

        await expect(
          createWeek(
            unitOfWork,
            {
              athleteId,

              weekStart:
                '2026-09-07',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Training week already exists',
        );

        expect(
          weeks.createWeek,
        ).not.toHaveBeenCalled();

        expect(
          weeks.createDay,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects an invalid calendar date',
      async () => {
    
        const execute =
          vi.fn();
    
        const unitOfWork:
          TrainingUnitOfWork = {
            execute,
          };
    
        await expect(
          createWeek(
            unitOfWork,
            {
              athleteId,
    
              weekStart:
                '2026-02-31',
    
              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'weekStart must be a valid YYYY-MM-DD date',
        );
    
        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a user without athlete access',
      async () => {

        const weeks =
          createWeekRepository();

        vi.mocked(
          athleteRepository.findAccess,
        ).mockResolvedValueOnce(
          null,
        );

        const unitOfWork =
          createUnitOfWork(
            weeks,
          );

        await expect(
          createWeek(
            unitOfWork,
            {
              athleteId,

              weekStart:
                '2026-09-07',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'User does not have write access to athlete',
        );

        expect(
          weeks.createWeek,
        ).not.toHaveBeenCalled();

        expect(
          weeks.createDay,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects VIEWER access for mutations',
      async () => {

        const weeks =
          createWeekRepository();

        vi.mocked(
          athleteRepository.findAccess,
        ).mockResolvedValueOnce({
          id:
            '60000000-0000-4000-8000-000000000002',

          athleteId,

          userId,

          role:
            'VIEWER',

          createdAt:
            new Date(
              '2026-09-08T17:00:00Z',
            ),
        });

        const unitOfWork =
          createUnitOfWork(
            weeks,
          );

        await expect(
          createWeek(
            unitOfWork,
            {
              athleteId,

              weekStart:
                '2026-09-07',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'User does not have write access to athlete',
        );

        expect(
          weeks.createWeek,
        ).not.toHaveBeenCalled();

        expect(
          weeks.createDay,
        ).not.toHaveBeenCalled();
      },
    );
  },
);

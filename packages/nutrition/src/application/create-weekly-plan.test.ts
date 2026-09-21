import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  DkturboUserId,
  NutritionDay,
  NutritionDayId,
  NutritionPlan,
  NutritionPlanId,
} from '../domain/index.js';

import type {
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  createWeeklyPlan,
  InvalidWeeklyNutritionPlanError,
} from './create-weekly-plan.js';

const userId =
  '10000000-0000-4000-8000-000000000001' as
    DkturboUserId;

const planId =
  '20000000-0000-4000-8000-000000000001' as
    NutritionPlanId;

const createUnitOfWork =
  (
    overrides:
      Partial<NutritionRepositories> = {},
  ): NutritionUnitOfWork => ({
    execute:
      async <T>(
        work: (
          repositories:
            NutritionRepositories,
        ) => Promise<T>,
      ): Promise<T> =>
        work({
          plans: {
            create:
              async data =>
                ({
                  id:
                    planId,

                  title:
                    data.title,

                  startDate:
                    data.startDate,

                  endDate:
                    data.endDate,

                  status:
                    data.status,

                  createdByUserId:
                    data.createdByUserId,

                  createdAt:
                    new Date(
                      '2026-09-19T20:00:00.000Z',
                    ),

                  updatedAt:
                    new Date(
                      '2026-09-19T20:00:00.000Z',
                    ),
                }) satisfies NutritionPlan,

            findById:
              async () =>
                null,

            list:
              async () =>
                [],
          },

          days: {
            createMany:
              async data =>
                data.map(
                  (
                    day,
                    index,
                  ) =>
                    ({
                      id:
                        `30000000-0000-4000-8000-${String(
                          index + 1,
                        ).padStart(
                          12,
                          '0',
                        )}` as
                          NutritionDayId,

                      planId:
                        day.planId,

                      date:
                        day.date,

                      notes:
                        day.notes,

                      createdAt:
                        new Date(
                          '2026-09-19T20:00:00.000Z',
                        ),

                      updatedAt:
                        new Date(
                          '2026-09-19T20:00:00.000Z',
                        ),
                    }) satisfies NutritionDay,
                ),

            listForPlan:
              async () =>
                [],
          },

          foods: {
            create:
              async () => {
                throw new Error(
                  'Not implemented',
                );
              },

            findById:
              async () =>
                null,

            update:
              async () =>
                null,

            archive:
              async () =>
                false,

            searchActive:
              async () =>
                [],
          },

          meals: {
            create:
              async () => {
                throw new Error(
                  'Not implemented',
                );
              },

            update:
              async () =>
                null,

            delete:
              async () =>
                false,

            findById:
              async () =>
                null,

            listForDay:
              async () =>
                [],
          },

          mealItems: {
            create:
              async () => {
                throw new Error(
                  'Not implemented',
                );
              },

            findById:
              async () =>
                null,

            setLocations:
              async () => {},

            delete:
              async () =>
                false,

            saveQuantities:
              async () => {},

            listDetailsForMeal:
              async () =>
                [],
          },

          planTargets: {
            save:
              async () => {
                throw new Error(
                  'Not implemented',
                );
              },

            findForUser:
              async () =>
                null,

            listForPlan:
              async () =>
                [],
          },

          ...overrides,
        }),
  });

describe(
  'createWeeklyPlan',
  () => {

    it(
      'creates one nutrition plan and exactly seven consecutive days',
      async () => {

        const unitOfWork =
          createUnitOfWork();

        const result =
          await createWeeklyPlan(
            unitOfWork,
            {
              title:
                'Semana 21-27 septiembre',

              weekStart:
                '2026-09-21',

              createdByUserId:
                userId,
            },
          );

        expect(
          result.plan,
        ).toMatchObject({
          id:
            planId,

          title:
            'Semana 21-27 septiembre',

          startDate:
            '2026-09-21',

          endDate:
            '2026-09-27',

          status:
            'DRAFT',

          createdByUserId:
            userId,
        });

        expect(
          result.days,
        ).toHaveLength(
          7,
        );

        expect(
          result.days.map(
            day =>
              day.date,
          ),
        ).toEqual([
          '2026-09-21',
          '2026-09-22',
          '2026-09-23',
          '2026-09-24',
          '2026-09-25',
          '2026-09-26',
          '2026-09-27',
        ]);

        expect(
          result.days.every(
            day =>
              day.planId ===
              planId,
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      'trims the plan title',
      async () => {

        const unitOfWork =
          createUnitOfWork();

        const result =
          await createWeeklyPlan(
            unitOfWork,
            {
              title:
                '   Semana base   ',

              weekStart:
                '2026-09-21',

              createdByUserId:
                userId,
            },
          );

        expect(
          result.plan.title,
        ).toBe(
          'Semana base',
        );
      },
    );

    it(
      'rejects an invalid calendar date',
      async () => {

        const unitOfWork =
          createUnitOfWork();

        await expect(
          createWeeklyPlan(
            unitOfWork,
            {
              title:
                'Semana',

              weekStart:
                '2026-02-31',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidWeeklyNutritionPlanError,
        );
      },
    );

    it(
      'rejects a week start that is not Monday',
      async () => {

        const unitOfWork =
          createUnitOfWork();

        await expect(
          createWeeklyPlan(
            unitOfWork,
            {
              title:
                'Semana',

              weekStart:
                '2026-09-22',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidWeeklyNutritionPlanError,
        );
      },
    );

    it(
      'rejects an empty title',
      async () => {

        const unitOfWork =
          createUnitOfWork();

        await expect(
          createWeeklyPlan(
            unitOfWork,
            {
              title:
                '   ',

              weekStart:
                '2026-09-21',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidWeeklyNutritionPlanError,
        );
      },
    );

    it(
      'rejects a title longer than 200 characters',
      async () => {

        const unitOfWork =
          createUnitOfWork();

        await expect(
          createWeeklyPlan(
            unitOfWork,
            {
              title:
                'x'.repeat(
                  201,
                ),

              weekStart:
                '2026-09-21',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidWeeklyNutritionPlanError,
        );
      },
    );
  },
);

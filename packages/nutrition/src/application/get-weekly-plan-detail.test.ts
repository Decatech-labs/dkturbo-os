import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  DkturboUserId,
  NutritionDay,
  NutritionDayId,
  NutritionFoodId,
  NutritionMeal,
  NutritionMealId,
  NutritionMealItemId,
  NutritionPlan,
  NutritionPlanId,
  NutritionPlanTarget,
  NutritionPlanTargetId,
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../index.js';

import {
  getWeeklyPlanDetail,
  NutritionPlanNotFoundForDetailError,
} from './get-weekly-plan-detail.js';

const userId =
  '10000000-0000-4000-8000-000000000001' as
    DkturboUserId;

const planId =
  '20000000-0000-4000-8000-000000000001' as
    NutritionPlanId;

const mondayId =
  '30000000-0000-4000-8000-000000000001' as
    NutritionDayId;

const tuesdayId =
  '30000000-0000-4000-8000-000000000002' as
    NutritionDayId;

const lunchId =
  '40000000-0000-4000-8000-000000000001' as
    NutritionMealId;

const riceId =
  '50000000-0000-4000-8000-000000000001' as
    NutritionFoodId;

const riceItemId =
  '60000000-0000-4000-8000-000000000001' as
    NutritionMealItemId;

const plan:
  NutritionPlan = {
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

    createdAt:
      new Date(),

    updatedAt:
      new Date(),
  };

const target:
  NutritionPlanTarget = {
    id:
      '70000000-0000-4000-8000-000000000001' as
        NutritionPlanTargetId,

    planId,

    userId,

    caloriesKcal:
      3000,

    proteinG:
      180,

    carbohydratesG:
      400,

    fatG:
      90,

    fiberG:
      30,

    createdAt:
      new Date(),

    updatedAt:
      new Date(),
  };

const monday:
  NutritionDay = {
    id:
      mondayId,

    planId,

    date:
      '2026-09-21',

    notes:
      null,

    createdAt:
      new Date(),

    updatedAt:
      new Date(),
  };

const tuesday:
  NutritionDay = {
    id:
      tuesdayId,

    planId,

    date:
      '2026-09-22',

    notes:
      null,

    createdAt:
      new Date(),

    updatedAt:
      new Date(),
  };

const lunch:
  NutritionMeal = {
    id:
      lunchId,

    dayId:
      mondayId,

    name:
      'Comida',

    plannedTime:
      '14:00',

    position:
      0,

    notes:
      null,

    createdAt:
      new Date(),

    updatedAt:
      new Date(),
  };

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
              async () =>
                plan,

            findById:
              async () =>
                plan,

            list:
              async () =>
                [
                  plan,
                ],
          },

          planTargets: {
            save:
              async () =>
                target,

            findForUser:
              async () =>
                target,

            listForPlan:
              async () =>
                [
                  target,
                ],
          },

          days: {
            createMany:
              async () =>
                [],

            listForPlan:
              async () =>
                [
                  monday,
                  tuesday,
                ],
          },

          meals: {
            create:
              async () =>
                lunch,

            findById:
              async () =>
                lunch,

            listForDay:
              async dayId =>
                dayId ===
                  mondayId
                  ? [
                      lunch,
                    ]
                  : [],
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

            searchActive:
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

            saveQuantities:
              async () => {},

            listDetailsForMeal:
              async mealId =>
                mealId ===
                  lunchId
                  ? [
                      {
                        item: {
                          id:
                            riceItemId,

                          mealId:
                            lunchId,

                          foodId:
                            riceId,

                          position:
                            0,

                          notes:
                            null,

                          createdAt:
                            new Date(),

                          updatedAt:
                            new Date(),
                        },

                        food: {
                          id:
                            riceId,

                          name:
                            'Arroz',

                          brand:
                            null,

                          referenceAmount:
                            100,

                          referenceUnit:
                            'G',

                          caloriesKcal:
                            350,

                          proteinG:
                            7,

                          carbohydratesG:
                            78,

                          fatG:
                            1,

                          fiberG:
                            1,

                          createdByUserId:
                            userId,

                          archivedAt:
                            null,

                          createdAt:
                            new Date(),

                          updatedAt:
                            new Date(),
                        },

                        quantities: [
                          {
                            id:
                              '80000000-0000-4000-8000-000000000001' as never,

                            mealItemId:
                              riceItemId,

                            userId,

                            quantity:
                              200,

                            createdAt:
                              new Date(),

                            updatedAt:
                              new Date(),
                          },
                        ],
                      },
                    ]
                  : [],
          },

          ...overrides,
        }),
  });

describe(
  'getWeeklyPlanDetail',
  () => {

    it(
      'returns the full weekly aggregate with daily and weekly totals',
      async () => {

        const result =
          await getWeeklyPlanDetail(
            createUnitOfWork(),
            planId,
          );

        expect(
          result.plan,
        ).toEqual(
          plan,
        );

        expect(
          result.targets,
        ).toEqual([
          target,
        ]);

        expect(
          result.days,
        ).toHaveLength(
          2,
        );

        const mondayDetail =
          result.days[0];

        expect(
          mondayDetail,
        ).toBeDefined();

        if (
          !mondayDetail
        ) {
          throw new Error(
            'Monday detail missing',
          );
        }

        expect(
          mondayDetail.meals,
        ).toHaveLength(
          1,
        );

        expect(
          mondayDetail.dailyTotalsByUser,
        ).toEqual([
          {
            userId,

            nutrients: {
              caloriesKcal:
                700,

              proteinG:
                14,

              carbohydratesG:
                156,

              fatG:
                2,

              fiberG:
                2,
            },
          },
        ]);

        expect(
          mondayDetail.progressByUser,
        ).toEqual([
          {
            userId,

            planned: {
              caloriesKcal:
                700,

              proteinG:
                14,

              carbohydratesG:
                156,

              fatG:
                2,

              fiberG:
                2,
            },

            target,

            remaining: {
              caloriesKcal:
                2300,

              proteinG:
                166,

              carbohydratesG:
                244,

              fatG:
                88,

              fiberG:
                28,
            },
          },
        ]);

        const tuesdayDetail =
          result.days[1];

        expect(
          tuesdayDetail,
        ).toBeDefined();

        if (
          !tuesdayDetail
        ) {
          throw new Error(
            'Tuesday detail missing',
          );
        }

        expect(
          tuesdayDetail.meals,
        ).toEqual(
          [],
        );

        /*
         * A target still appears in progress,
         * even if the day has no planned food.
         */
        expect(
          tuesdayDetail.progressByUser,
        ).toEqual([
          {
            userId,

            planned: {
              caloriesKcal:
                0,

              proteinG:
                0,

              carbohydratesG:
                0,

              fatG:
                0,

              fiberG:
                0,
            },

            target,

            remaining: {
              caloriesKcal:
                3000,

              proteinG:
                180,

              carbohydratesG:
                400,

              fatG:
                90,

              fiberG:
                30,
            },
          },
        ]);

        expect(
          result.weeklyTotalsByUser,
        ).toEqual([
          {
            userId,

            nutrients: {
              caloriesKcal:
                700,

              proteinG:
                14,

              carbohydratesG:
                156,

              fatG:
                2,

              fiberG:
                2,
            },
          },
        ]);
      },
    );

    it(
      'fails when the nutrition plan does not exist',
      async () => {

        const unitOfWork =
          createUnitOfWork({
            plans: {
              create:
                async () =>
                  plan,

              findById:
                async () =>
                  null,

              list:
                async () =>
                  [],
            },
          });

        await expect(
          getWeeklyPlanDetail(
            unitOfWork,
            planId,
          ),
        ).rejects.toBeInstanceOf(
          NutritionPlanNotFoundForDetailError,
        );
      },
    );
  },
);

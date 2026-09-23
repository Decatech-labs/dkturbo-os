import type {
  DkturboUserId,
  NutritionFood,
  NutritionFoodId,
  NutritionMeal,
  NutritionMealItem,
  NutritionMealItemActual,
  NutritionMealItemId,
  NutritionMealItemQuantity,
} from '../domain/index.js';

import type {
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  snapshotNutritionFood,
} from './food-snapshot.js';

export const actualTestNow =
  new Date(
    '2026-09-22T12:00:00.000Z',
  );

export const actualTestMealItemId =
  '11111111-1111-4111-8111-111111111111' as
    NutritionMealItemId;

export const actualTestMealId =
  '22222222-2222-4222-8222-222222222222' as
    NutritionMeal[
      'id'
    ];

export const actualTestDayId =
  '33333333-3333-4333-8333-333333333333' as
    NutritionMeal[
      'dayId'
    ];

export const actualTestFoodId =
  '44444444-4444-4444-8444-444444444444' as
    NutritionFoodId;

export const actualTestUserId =
  '55555555-5555-4555-8555-555555555555' as
    DkturboUserId;

export const actualTestQuantityId =
  '66666666-6666-4666-8666-666666666666' as
    NutritionMealItemQuantity[
      'id'
    ];

export const actualTestActualId =
  '77777777-7777-4777-8777-777777777777' as
    NutritionMealItemActual[
      'id'
    ];

export const actualTestReplacementFoodId =
  '88888888-8888-4888-8888-888888888888' as
    NutritionFoodId;

export const actualTestItem:
  NutritionMealItem = {
    id:
      actualTestMealItemId,

    mealId:
      actualTestMealId,

    foodId:
      actualTestFoodId,

    foodSnapshot: {
      name:
        'Arroz',

      brand:
        null,

      category:
        'OTHER',

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
    },

    position:
      0,

    notes:
      null,

    createdAt:
      actualTestNow,

    updatedAt:
      actualTestNow,
  };

export const actualTestMeal:
  NutritionMeal = {
    id:
      actualTestMealId,

    dayId:
      actualTestDayId,

    name:
      'Comida',

    plannedTime:
      '14:00:00',

    position:
      0,

    notes:
      null,

    createdAt:
      actualTestNow,

    updatedAt:
      actualTestNow,
  };

export const actualTestFood:
  NutritionFood = {
    id:
      actualTestFoodId,

    name:
      'Arroz',

    brand:
      null,

    category:
      'RICE',

    referenceAmount:
      100,

    referenceUnit:
      'G',

    caloriesKcal:
      360,

    proteinG:
      7,

    carbohydratesG:
      79,

    fatG:
      1,

    fiberG:
      1.4,

    createdByUserId:
      actualTestUserId,

    archivedAt:
      null,

    createdAt:
      actualTestNow,

    updatedAt:
      actualTestNow,
  };

export const plannedFoodSnapshot =
  snapshotNutritionFood(
    actualTestFood,
  );

export const actualTestReplacementFood:
  NutritionFood = {
    id:
      actualTestReplacementFoodId,

    name:
      'Patata',

    brand:
      null,

    category:
      'TUBERS',

    referenceAmount:
      100,

    referenceUnit:
      'G',

    caloriesKcal:
      77,

    proteinG:
      2,

    carbohydratesG:
      17,

    fatG:
      0.1,

    fiberG:
      2.2,

    createdByUserId:
      actualTestUserId,

    archivedAt:
      null,

    createdAt:
      actualTestNow,

    updatedAt:
      actualTestNow,
  };

export const createMealItemActualTestRepositories =
  (
    options?: {
      withQuantity?:
        boolean;
    },
  ): NutritionRepositories => {

    const withQuantity =
      options
        ?.withQuantity ??
      true;

    return {
      days: {
        createMany:
          async () =>
            [],

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
            actualTestMeal,

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
            actualTestItem,

        saveQuantities:
          async () => {},

        setLocations:
          async () => {},

        delete:
          async () =>
            false,

        listDetailsForMeal:
          async () => [
            {
              item:
                actualTestItem,

              food:
                actualTestFood,

              quantities:
                withQuantity
                  ? [
                      {
                        id:
                          actualTestQuantityId,

                        mealItemId:
                          actualTestMealItemId,

                        userId:
                          actualTestUserId,

                        quantity:
                          140,

                        createdAt:
                          actualTestNow,

                        updatedAt:
                          actualTestNow,
                      },
                    ]
                  : [],
            },
          ],
      },

      mealItemActuals: {
        save:
          async data => ({
            id:
              actualTestActualId,

            dayId:
              data.dayId,

            mealItemId:
              data.mealItemId,

            userId:
              data.userId,

            status:
              data.status,

            plannedFoodId:
              data.plannedFoodId,

            plannedFoodSnapshot:
              data.plannedFoodSnapshot,

            plannedQuantity:
              data.plannedQuantity,

            actualFoodId:
              data.actualFoodId,

            actualFoodSnapshot:
              data.actualFoodSnapshot,

            actualQuantity:
              data.actualQuantity,

            notes:
              data.notes,

            createdAt:
              actualTestNow,

            updatedAt:
              actualTestNow,
          }),

        findForItemAndUser:
          async () =>
            null,

        deleteForItemAndUser:
          async () =>
            false,

        listForDay:
          async () =>
            [],

        listForDayAndUser:
          async () =>
            [],
      },

      plans: {
        create:
          async () => {
            throw new Error(
              'Not implemented',
            );
          },

        findById:
          async () =>
            null,

        list:
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
    };
  };

export const createMealItemActualTestUnitOfWork =
  (
    repositories:
      NutritionRepositories,
  ): NutritionUnitOfWork => ({
    execute:
      async work =>
        work(
          repositories,
        ),
  });

import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  NutritionMealItemActual,
  NutritionRepositories,
} from '../index.js';

import {
  actualTestDayId,
  actualTestFoodId,
  actualTestMealItemId,
  actualTestNow,
  actualTestUserId,
  createMealItemActualTestRepositories,
  createMealItemActualTestUnitOfWork,
  plannedFoodSnapshot,
} from './meal-item-actual.test-fixture.js';

import {
  NutritionMealItemActualPlannedQuantityNotFoundError,
} from './meal-item-actual-context.js';

import {
  markMealItemEaten,
} from './mark-meal-item-eaten.js';

describe(
  'markMealItemEaten',
  () => {

    it(
      'copies the planned food and quantity into the actual intake',
      async () => {

        const repositories =
          createMealItemActualTestRepositories();

        let saved:
          Parameters<
            NutritionRepositories[
              'mealItemActuals'
            ][
              'save'
            ]
          >[0] | null =
            null;

        repositories
          .mealItemActuals
          .save =
            async data => {

              saved =
                data;

              return {
                id:
                  '77777777-7777-4777-8777-777777777777' as
                    NutritionMealItemActual[
                      'id'
                    ],

                ...data,

                createdAt:
                  actualTestNow,

                updatedAt:
                  actualTestNow,
              };
            };

        await markMealItemEaten(
          createMealItemActualTestUnitOfWork(
            repositories,
          ),
          {
            mealItemId:
              actualTestMealItemId,

            userId:
              actualTestUserId,
          },
        );

        expect(
          saved,
        ).toEqual({
          dayId:
            actualTestDayId,

          mealItemId:
            actualTestMealItemId,

          userId:
            actualTestUserId,

          status:
            'EATEN',

          plannedFoodId:
            actualTestFoodId,

          plannedFoodSnapshot,

          plannedQuantity:
            140,

          actualFoodId:
            actualTestFoodId,

          actualFoodSnapshot:
            plannedFoodSnapshot,

          actualQuantity:
            140,

          notes:
            null,
        });
      },
    );

    it(
      'rejects an item without a planned quantity for the user',
      async () => {

        const repositories =
          createMealItemActualTestRepositories({
            withQuantity:
              false,
          });

        await expect(
          markMealItemEaten(
            createMealItemActualTestUnitOfWork(
              repositories,
            ),
            {
              mealItemId:
                actualTestMealItemId,

              userId:
                actualTestUserId,
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionMealItemActualPlannedQuantityNotFoundError,
        );
      },
    );
  },
);

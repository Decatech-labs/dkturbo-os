import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  NutritionRepositories,
} from '../ports/index.js';

import {
  actualTestDayId,
  actualTestFoodId,
  actualTestMealItemId,
  actualTestUserId,
  createMealItemActualTestRepositories,
  createMealItemActualTestUnitOfWork,
  plannedFoodSnapshot,
} from './meal-item-actual.test-fixture.js';

import {
  markMealItemSkipped,
} from './mark-meal-item-skipped.js';

describe(
  'markMealItemSkipped',
  () => {

    it(
      'stores the planned snapshot without actual intake',
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
                    never,

                ...data,

                createdAt:
                  new Date(),

                updatedAt:
                  new Date(),
              };
            };

        await markMealItemSkipped(
          createMealItemActualTestUnitOfWork(
            repositories,
          ),
          {
            mealItemId:
              actualTestMealItemId,

            userId:
              actualTestUserId,

            notes:
              '  No tenía hambre  ',
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
            'SKIPPED',

          plannedFoodId:
            actualTestFoodId,

          plannedFoodSnapshot,

          plannedQuantity:
            140,

          actualFoodId:
            null,

          actualFoodSnapshot:
            null,

          actualQuantity:
            null,

          notes:
            'No tenía hambre',
        });
      },
    );
  },
);

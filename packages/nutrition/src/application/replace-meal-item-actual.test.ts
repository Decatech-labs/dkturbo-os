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
  actualTestReplacementFood,
  actualTestReplacementFoodId,
  actualTestUserId,
  createMealItemActualTestRepositories,
  createMealItemActualTestUnitOfWork,
  plannedFoodSnapshot,
} from './meal-item-actual.test-fixture.js';

import {
  ArchivedNutritionReplacementFoodError,
  InvalidNutritionMealItemActualQuantityError,
  replaceMealItemActual,
} from './replace-meal-item-actual.js';

import {
  snapshotNutritionFood,
} from './food-snapshot.js';

describe(
  'replaceMealItemActual',
  () => {

    it(
      'stores the original planned snapshot and the replacement food',
      async () => {

        const repositories =
          createMealItemActualTestRepositories();

        repositories
          .foods
          .findById =
            async () =>
              actualTestReplacementFood;

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

        await replaceMealItemActual(
          createMealItemActualTestUnitOfWork(
            repositories,
          ),
          {
            mealItemId:
              actualTestMealItemId,

            userId:
              actualTestUserId,

            actualFoodId:
              actualTestReplacementFoodId,

            actualQuantity:
              250,

            notes:
              '  Cambio por disponibilidad  ',
          },
        );

        const replacementFoodSnapshot =
          snapshotNutritionFood(
            actualTestReplacementFood,
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
            'REPLACED',

          plannedFoodId:
            actualTestFoodId,

          plannedFoodSnapshot,

          plannedQuantity:
            140,

          actualFoodId:
            actualTestReplacementFoodId,

          actualFoodSnapshot:
            replacementFoodSnapshot,

          actualQuantity:
            250,

          notes:
            'Cambio por disponibilidad',
        });
      },
    );

    it(
      'rejects zero or negative actual quantities',
      async () => {

        const repositories =
          createMealItemActualTestRepositories();

        await expect(
          replaceMealItemActual(
            createMealItemActualTestUnitOfWork(
              repositories,
            ),
            {
              mealItemId:
                actualTestMealItemId,

              userId:
                actualTestUserId,

              actualFoodId:
                actualTestReplacementFoodId,

              actualQuantity:
                0,

              notes:
                null,
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidNutritionMealItemActualQuantityError,
        );
      },
    );

    it(
      'rejects archived replacement foods',
      async () => {

        const repositories =
          createMealItemActualTestRepositories();

        repositories
          .foods
          .findById =
            async () => ({
              ...actualTestReplacementFood,

              archivedAt:
                new Date(
                  '2026-09-22T13:00:00.000Z',
                ),
            });

        await expect(
          replaceMealItemActual(
            createMealItemActualTestUnitOfWork(
              repositories,
            ),
            {
              mealItemId:
                actualTestMealItemId,

              userId:
                actualTestUserId,

              actualFoodId:
                actualTestReplacementFoodId,

              actualQuantity:
                250,

              notes:
                null,
            },
          ),
        ).rejects.toBeInstanceOf(
          ArchivedNutritionReplacementFoodError,
        );
      },
    );
  },
);

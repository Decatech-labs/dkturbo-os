import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  actualTestMealItemId,
  actualTestUserId,
  createMealItemActualTestRepositories,
  createMealItemActualTestUnitOfWork,
} from './meal-item-actual.test-fixture.js';

import {
  resetMealItemActual,
} from './reset-meal-item-actual.js';

describe(
  'resetMealItemActual',
  () => {

    it(
      'deletes the actual intake for the item and user',
      async () => {

        const repositories =
          createMealItemActualTestRepositories();

        let deleted:
          {
            mealItemId:
              string;

            userId:
              string;
          } | null =
            null;

        repositories
          .mealItemActuals
          .deleteForItemAndUser =
            async (
              mealItemId,
              userId,
            ) => {

              deleted = {
                mealItemId,
                userId,
              };

              return true;
            };

        await resetMealItemActual(
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
          deleted,
        ).toEqual({
          mealItemId:
            actualTestMealItemId,

          userId:
            actualTestUserId,
        });
      },
    );

    it(
      'is idempotent when there is no actual intake to delete',
      async () => {

        const repositories =
          createMealItemActualTestRepositories();

        repositories
          .mealItemActuals
          .deleteForItemAndUser =
            async () =>
              false;

        await expect(
          resetMealItemActual(
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
        ).resolves.toBeUndefined();
      },
    );
  },
);

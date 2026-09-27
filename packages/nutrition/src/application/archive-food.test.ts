import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  NutritionFoodId,
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../index.js';

import {
  NutritionFoodNotFoundError,
} from './add-food-to-meal.js';

import {
  archiveFood,
} from './archive-food.js';

import {
  createTestPersonAccessRepository,
} from './test-person-access-repository.js';

import {
  createTestFoodPreparationConversionRepository,
} from './test-food-preparation-conversion-repository.js';

const foodId =
  '20000000-0000-4000-8000-000000000001' as NutritionFoodId;

const createUnitOfWork =
  (
    archived:
      boolean,
  ): NutritionUnitOfWork => ({
    execute:
      async <T>(
        work: (
          repositories:
            NutritionRepositories,
        ) => Promise<T>,
      ): Promise<T> =>
        work({
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
                archived,

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

            setPreparationConversion:
              async () =>
                false,

            delete:
              async () =>
                false,

            saveQuantities:
              async () => {},

            deleteQuantity:
              async () =>
                false,

            listDetailsForMeal:
              async () =>
                [],
          },

          mealItemActuals: {
            save:
              async () => {
                throw new Error(
                  'Not implemented',
                );
              },

            findForItemAndUser:
              async () =>
                null,

            deleteForItemAndUser:
              async () =>
                false,

            listForDayAndUser:
              async () =>
                [],

            listForDay:
              async () =>
                [],
          },

          personAccess:
            createTestPersonAccessRepository(),

          foodPreparationConversions:
            createTestFoodPreparationConversionRepository(),

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
        }),
  });

describe(
  'archiveFood',
  () => {

    it(
      'archives an active food',
      async () => {

        await expect(
          archiveFood(
            createUnitOfWork(
              true,
            ),
            {
              foodId,
            },
          ),
        ).resolves.toBeUndefined();
      },
    );

    it(
      'throws when the food does not exist or is already archived',
      async () => {

        await expect(
          archiveFood(
            createUnitOfWork(
              false,
            ),
            {
              foodId,
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionFoodNotFoundError,
        );
      },
    );
  },
);

import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  NutritionFood,
  NutritionFoodId,
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../index.js';

import {
  createFoodPreparationConversion,
  FoodPreparationConversionFoodNotFoundError,
  InvalidFoodPreparationConversionError,
} from './create-food-preparation-conversion.js';

import {
  createTestPersonAccessRepository,
} from './test-person-access-repository.js';

import {
  createTestFoodPreparationConversionRepository,
} from './test-food-preparation-conversion-repository.js';

const foodId =
  '10000000-0000-4000-8000-000000000001' as
    NutritionFoodId;

const food:
  NutritionFood = {
    id:
      foodId,

    name:
      'Arroz basmati',

    brand:
      'Hacendado',

    category:
      'RICE',

    referenceAmount:
      100,

    referenceUnit:
      'G',

    caloriesKcal:
      350,

    proteinG:
      8,

    carbohydratesG:
      78,

    fatG:
      1,

    fiberG:
      1,

    createdByUserId:
      '20000000-0000-4000-8000-000000000001' as never,

    archivedAt:
      null,

    createdAt:
      new Date(),

    updatedAt:
      new Date(),
  };

const createUnitOfWork =
  (
    foodResult:
      NutritionFood | null,
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
                foodResult,

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

          foodPreparationConversions: {
            ...createTestFoodPreparationConversionRepository(),

            create:
              async data => ({
                id:
                  '30000000-0000-4000-8000-000000000001' as never,

                foodId:
                  data.foodId,

                name:
                  data.name,

                rawAmount:
                  data.rawAmount,

                preparedAmount:
                  data.preparedAmount,

                preparedUnit:
                  data.preparedUnit,

                isDefault:
                  data.isDefault,

                createdAt:
                  new Date(),

                updatedAt:
                  new Date(),
              }),
          },

          meals: {
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

            delete:
              async () =>
                false,

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

            listForDay:
              async () =>
                [],

            listForDayAndUser:
              async () =>
                [],
          },

          personAccess:
            createTestPersonAccessRepository(),

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
  'createFoodPreparationConversion',
  () => {

    it(
      'creates a preparation conversion for an existing food',
      async () => {

        const result =
          await createFoodPreparationConversion(
            createUnitOfWork(
              food,
            ),
            {
              foodId,

              name:
                'Cocido',

              rawAmount:
                100,

              preparedAmount:
                214,

              preparedUnit:
                'G',

              isDefault:
                true,
            },
          );

        expect(
          result.foodId,
        ).toBe(
          foodId,
        );

        expect(
          result.name,
        ).toBe(
          'Cocido',
        );

        expect(
          result.rawAmount,
        ).toBe(
          100,
        );

        expect(
          result.preparedAmount,
        ).toBe(
          214,
        );

        expect(
          result.isDefault,
        ).toBe(
          true,
        );
      },
    );

    it(
      'rejects an unknown food',
      async () => {

        await expect(
          createFoodPreparationConversion(
            createUnitOfWork(
              null,
            ),
            {
              foodId,

              name:
                'Cocido',

              rawAmount:
                100,

              preparedAmount:
                214,

              preparedUnit:
                'G',

              isDefault:
                true,
            },
          ),
        ).rejects.toBeInstanceOf(
          FoodPreparationConversionFoodNotFoundError,
        );
      },
    );

    it(
      'rejects invalid preparation amounts',
      async () => {

        await expect(
          createFoodPreparationConversion(
            createUnitOfWork(
              food,
            ),
            {
              foodId,

              name:
                'Cocido',

              rawAmount:
                0,

              preparedAmount:
                214,

              preparedUnit:
                'G',

              isDefault:
                true,
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidFoodPreparationConversionError,
        );
      },
    );
  },
);

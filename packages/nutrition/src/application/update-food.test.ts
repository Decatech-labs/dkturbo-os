import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  DkturboUserId,
  NutritionFood,
  NutritionFoodId,
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../index.js';

import {
  InvalidNutritionFoodError,
} from './create-food.js';

import {
  NutritionFoodNotFoundError,
} from './add-food-to-meal.js';

import {
  updateFood,
} from './update-food.js';

import {
  createTestPersonAccessRepository,
} from './test-person-access-repository.js';

import {
  createTestFoodPreparationConversionRepository,
} from './test-food-preparation-conversion-repository.js';

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const foodId =
  '20000000-0000-4000-8000-000000000001' as NutritionFoodId;

const createUnitOfWork =
  (
    existing:
      boolean = true,
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
              async data => {

                if (!existing) {
                  return null;
                }

                return {
                  id:
                    data.foodId,

                  name:
                    data.name,

                  brand:
                    data.brand,

                  category:
                    data.category,

                  referenceAmount:
                    data.referenceAmount,

                  referenceUnit:
                    data.referenceUnit,

                  caloriesKcal:
                    data.caloriesKcal,

                  proteinG:
                    data.proteinG,

                  carbohydratesG:
                    data.carbohydratesG,

                  fatG:
                    data.fatG,

                  fiberG:
                    data.fiberG,

                  createdByUserId:
                    userId,

                  archivedAt:
                    null,

                  createdAt:
                    new Date(),

                  updatedAt:
                    new Date(),
                } satisfies NutritionFood;
              },

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

const validInput = {
  foodId,

  name:
    '  Avena integral  ',

  brand:
    '  Hacendado  ',

  category:
    'CEREALS' as const,

  referenceAmount:
    100,

  referenceUnit:
    'G' as const,

  caloriesKcal:
    370,

  proteinG:
    13,

  carbohydratesG:
    60,

  fatG:
    7,

  fiberG:
    10,
};

describe(
  'updateFood',
  () => {

    it(
      'updates food data and trims text values',
      async () => {

        const result =
          await updateFood(
            createUnitOfWork(),
            validInput,
          );

        expect(
          result,
        ).toMatchObject({
          id:
            foodId,

          name:
            'Avena integral',

          brand:
            'Hacendado',

          category:
            'CEREALS',

          referenceAmount:
            100,

          caloriesKcal:
            370,
        });
      },
    );

    it(
      'throws when the food does not exist',
      async () => {

        await expect(
          updateFood(
            createUnitOfWork(
              false,
            ),
            validInput,
          ),
        ).rejects.toBeInstanceOf(
          NutritionFoodNotFoundError,
        );
      },
    );

    it.each([
      {
        field:
          'referenceAmount',
        value:
          0,
      },
      {
        field:
          'caloriesKcal',
        value:
          -1,
      },
      {
        field:
          'proteinG',
        value:
          -1,
      },
      {
        field:
          'carbohydratesG',
        value:
          -1,
      },
      {
        field:
          'fatG',
        value:
          -1,
      },
      {
        field:
          'fiberG',
        value:
          -1,
      },
    ] as const)(
      'rejects invalid $field',
      async ({
        field,
        value,
      }) => {

        await expect(
          updateFood(
            createUnitOfWork(),
            {
              ...validInput,

              [field]:
                value,
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidNutritionFoodError,
        );
      },
    );
  },
);

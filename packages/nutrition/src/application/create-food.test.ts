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
  createFood,
  InvalidNutritionFoodError,
} from './create-food.js';

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
  (): NutritionUnitOfWork => ({
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
              async data =>
                ({
                  id:
                    foodId,

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
                    data.createdByUserId,

                  archivedAt:
                    null,

                  createdAt:
                    new Date(),

                  updatedAt:
                    new Date(),
                }) satisfies NutritionFood,

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
  'createFood',
  () => {

    it(
      'creates a food with nutrition data',
      async () => {

        const result =
          await createFood(
            createUnitOfWork(),
            {
              name:
                'Arroz basmati',

              brand:
                null,

              referenceAmount:
                100,

              referenceUnit:
                'G',

              caloriesKcal:
                356,

              proteinG:
                7.5,

              carbohydratesG:
                78,

              fatG:
                0.9,

              fiberG:
                1.2,

              createdByUserId:
                userId,
            },
          );

        expect(
          result,
        ).toMatchObject({
          name:
            'Arroz basmati',

          referenceAmount:
            100,

          referenceUnit:
            'G',

          caloriesKcal:
            356,

          proteinG:
            7.5,

          carbohydratesG:
            78,

          fatG:
            0.9,

          fiberG:
            1.2,
        });
      },
    );

    it(
      'trims name and brand',
      async () => {

        const result =
          await createFood(
            createUnitOfWork(),
            {
              name:
                '  Yogur griego  ',

              brand:
                '  Hacendado  ',

              referenceAmount:
                100,

              referenceUnit:
                'G',

              caloriesKcal:
                60,

              proteinG:
                10,

              carbohydratesG:
                4,

              fatG:
                0,

              fiberG:
                null,

              createdByUserId:
                userId,
            },
          );

        expect(
          result.name,
        ).toBe(
          'Yogur griego',
        );

        expect(
          result.brand,
        ).toBe(
          'Hacendado',
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
          'referenceAmount',
        value:
          -1,
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

        const input = {
          name:
            'Arroz',

          brand:
            null,

          referenceAmount:
            100,

          referenceUnit:
            'G' as const,

          caloriesKcal:
            356,

          proteinG:
            7.5,

          carbohydratesG:
            78,

          fatG:
            0.9,

          fiberG:
            1.2,

          createdByUserId:
            userId,
        };

        await expect(
          createFood(
            createUnitOfWork(),
            {
              ...input,

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

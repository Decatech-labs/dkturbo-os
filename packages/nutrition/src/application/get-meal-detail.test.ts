import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  DkturboUserId,
  NutritionDayId,
  NutritionFoodId,
  NutritionMeal,
  NutritionMealId,
  NutritionMealItemId,
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../index.js';

import {
  getMealDetail,
} from './get-meal-detail.js';

const alejandroId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const person2Id =
  '10000000-0000-4000-8000-000000000002' as DkturboUserId;

const mealId =
  '20000000-0000-4000-8000-000000000001' as NutritionMealId;

const dayId =
  '30000000-0000-4000-8000-000000000001' as NutritionDayId;

const riceId =
  '40000000-0000-4000-8000-000000000001' as NutritionFoodId;

const chickenId =
  '40000000-0000-4000-8000-000000000002' as NutritionFoodId;

const riceItemId =
  '50000000-0000-4000-8000-000000000001' as NutritionMealItemId;

const chickenItemId =
  '50000000-0000-4000-8000-000000000002' as NutritionMealItemId;

const meal:
  NutritionMeal = {
    id:
      mealId,

    dayId,

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
              async () =>
                meal,

            update:
              async () =>
                null,

            delete:
              async () =>
                false,

            findById:
              async () =>
                meal,

            listForDay:
              async () =>
                [
                  meal,
                ],
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

            delete:
              async () =>
                false,

            saveQuantities:
              async () => {},

            listDetailsForMeal:
              async () => [
                {
                  item: {
                    id:
                      riceItemId,

                    mealId,

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
                      'Arroz basmati',

                    brand:
                      null,

                    category:
                      'OTHER',

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
                      alejandroId,

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
                        'q1' as never,

                      mealItemId:
                        riceItemId,

                      userId:
                        alejandroId,

                      quantity:
                        140,

                      createdAt:
                        new Date(),

                      updatedAt:
                        new Date(),
                    },
                    {
                      id:
                        'q2' as never,

                      mealItemId:
                        riceItemId,

                      userId:
                        person2Id,

                      quantity:
                        100,

                      createdAt:
                        new Date(),

                      updatedAt:
                        new Date(),
                    },
                  ],
                },
                {
                  item: {
                    id:
                      chickenItemId,

                    mealId,

                    foodId:
                      chickenId,

                    position:
                      1,

                    notes:
                      null,

                    createdAt:
                      new Date(),

                    updatedAt:
                      new Date(),
                  },

                  food: {
                    id:
                      chickenId,

                    name:
                      'Pechuga de pollo',

                    brand:
                      null,

                    category:
                      'OTHER',

                    referenceAmount:
                      100,

                    referenceUnit:
                      'G',

                    caloriesKcal:
                      120,

                    proteinG:
                      23,

                    carbohydratesG:
                      0,

                    fatG:
                      2,

                    fiberG:
                      null,

                    createdByUserId:
                      alejandroId,

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
                        'q3' as never,

                      mealItemId:
                        chickenItemId,

                      userId:
                        alejandroId,

                      quantity:
                        220,

                      createdAt:
                        new Date(),

                      updatedAt:
                        new Date(),
                    },
                    {
                      id:
                        'q4' as never,

                      mealItemId:
                        chickenItemId,

                      userId:
                        person2Id,

                      quantity:
                        180,

                      createdAt:
                        new Date(),

                      updatedAt:
                        new Date(),
                    },
                  ],
                },
              ],
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
        }),
  });

describe(
  'getMealDetail',
  () => {

    it(
      'calculates nutrients independently for each user',
      async () => {

        const result =
          await getMealDetail(
            createUnitOfWork(),
            mealId,
          );

        const alejandro =
          result.totalsByUser.find(
            total =>
              total.userId ===
              alejandroId,
          );

        const person2 =
          result.totalsByUser.find(
            total =>
              total.userId ===
              person2Id,
          );

        expect(
          alejandro?.nutrients,
        ).toEqual({
          caloriesKcal:
            762.4,

          proteinG:
            61.1,

          carbohydratesG:
            109.2,

          fatG:
            5.66,

          fiberG:
            1.68,
        });

        expect(
          person2?.nutrients,
        ).toEqual({
          caloriesKcal:
            572,

          proteinG:
            48.9,

          carbohydratesG:
            78,

          fatG:
            4.5,

          fiberG:
            1.2,
        });
      },
    );

    it(
      'returns the meal items in detail',
      async () => {

        const result =
          await getMealDetail(
            createUnitOfWork(),
            mealId,
          );

        expect(
          result.items,
        ).toHaveLength(
          2,
        );

        expect(
          result.items.map(
            item =>
              item.food.name,
          ),
        ).toEqual([
          'Arroz basmati',
          'Pechuga de pollo',
        ]);
      },
    );
  },
);

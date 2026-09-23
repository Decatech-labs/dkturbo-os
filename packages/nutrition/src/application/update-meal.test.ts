import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  NutritionMeal,
  NutritionMealId,
} from '../domain/index.js';

import type {
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  NutritionMealNotFoundError,
} from './add-food-to-meal.js';

import {
  InvalidNutritionMealError,
} from './create-meal.js';

import {
  updateMeal,
} from './update-meal.js';

const mealId =
  'meal-1' as
    NutritionMealId;

const now =
  new Date(
    '2026-09-21T10:00:00.000Z',
  );

const meal:
  NutritionMeal = {
    id:
      mealId,

    dayId:
      'day-1' as
        NutritionMeal['dayId'],

    name:
      'Desayuno',

    plannedTime:
      '07:00',

    position:
      0,

    notes:
      'Antes de entrenar',

    createdAt:
      now,

    updatedAt:
      now,
  };

const createRepositories =
  (
    overrides:
      Partial<
        NutritionRepositories
      > = {},
  ): NutritionRepositories => ({
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

      delete:
        async () =>
          false,

      saveQuantities:
        async () => {},

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

    ...overrides,
  });

const createUnitOfWork =
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

describe(
  'updateMeal',
  () => {

    it(
      'updates only supplied meal fields',
      async () => {

        let updateInput:
          Parameters<
            NutritionRepositories[
              'meals'
            ][
              'update'
            ]
          >[0] |
          null =
            null;

        const updatedMeal:
          NutritionMeal = {
            ...meal,

            name:
              'Almuerzo',

            updatedAt:
              new Date(
                '2026-09-21T11:00:00.000Z',
              ),
          };

        const repositories =
          createRepositories({
            meals: {
              create:
                async () => {
                  throw new Error(
                    'Not implemented',
                  );
                },

              findById:
                async () =>
                  meal,

              listForDay:
                async () =>
                  [
                    meal,
                  ],

              update:
                async data => {

                  updateInput =
                    data;

                  return updatedMeal;
                },

              delete:
                async () =>
                  false,
            },
          });

        const result =
          await updateMeal(
            createUnitOfWork(
              repositories,
            ),
            {
              mealId,

              name:
                '  Almuerzo  ',
            },
          );

        expect(
          result,
        ).toEqual(
          updatedMeal,
        );

        expect(
          updateInput,
        ).toEqual({
          mealId,

          name:
            'Almuerzo',

          plannedTime:
            '07:00',

          position:
            0,

          notes:
            'Antes de entrenar',
        });
      },
    );

    it(
      'rejects an invalid meal name',
      async () => {

        const repositories =
          createRepositories({
            meals: {
              create:
                async () => {
                  throw new Error(
                    'Not implemented',
                  );
                },

              update:
                async () =>
                  meal,

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
          });

        await expect(
          updateMeal(
            createUnitOfWork(
              repositories,
            ),
            {
              mealId,

              name:
                '   ',
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidNutritionMealError,
        );
      },
    );

    it(
      'rejects an invalid meal time',
      async () => {

        const repositories =
          createRepositories({
            meals: {
              create:
                async () => {
                  throw new Error(
                    'Not implemented',
                  );
                },

              update:
                async () =>
                  meal,

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
          });

        await expect(
          updateMeal(
            createUnitOfWork(
              repositories,
            ),
            {
              mealId,

              plannedTime:
                '27:00',
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidNutritionMealError,
        );
      },
    );

    it(
      'fails when the meal does not exist',
      async () => {

        const repositories =
          createRepositories();

        await expect(
          updateMeal(
            createUnitOfWork(
              repositories,
            ),
            {
              mealId,

              name:
                'Almuerzo',
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionMealNotFoundError,
        );
      },
    );
  },
);

import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
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
  deleteMeal,
} from './delete-meal.js';

const mealId =
  'meal-1' as
    NutritionMealId;

const createRepositories =
  (
    deleted:
      boolean,
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
          deleted,

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
  'deleteMeal',
  () => {

    it(
      'deletes an existing meal',
      async () => {

        await expect(
          deleteMeal(
            createUnitOfWork(
              createRepositories(
                true,
              ),
            ),
            {
              mealId,
            },
          ),
        ).resolves.toBeUndefined();
      },
    );

    it(
      'fails when the meal does not exist',
      async () => {

        await expect(
          deleteMeal(
            createUnitOfWork(
              createRepositories(
                false,
              ),
            ),
            {
              mealId,
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionMealNotFoundError,
        );
      },
    );
  },
);

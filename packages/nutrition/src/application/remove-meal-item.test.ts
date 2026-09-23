import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  NutritionMealItemId,
} from '../domain/index.js';

import type {
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  NutritionMealItemNotFoundError,
} from './move-meal-item.js';

import {
  removeMealItem,
} from './remove-meal-item.js';

const mealItemId =
  '11111111-1111-4111-8111-111111111111' as
    NutritionMealItemId;

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

      saveQuantities:
        async () => {},

      setLocations:
        async () => {},

      delete:
        async () =>
          deleted,

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
  'removeMealItem',
  () => {

    it(
      'removes an existing meal item',
      async () => {

        await expect(
          removeMealItem(
            createUnitOfWork(
              createRepositories(
                true,
              ),
            ),
            {
              mealItemId,
            },
          ),
        ).resolves.toBeUndefined();
      },
    );

    it(
      'fails when the meal item does not exist',
      async () => {

        await expect(
          removeMealItem(
            createUnitOfWork(
              createRepositories(
                false,
              ),
            ),
            {
              mealItemId,
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionMealItemNotFoundError,
        );
      },
    );
  },
);

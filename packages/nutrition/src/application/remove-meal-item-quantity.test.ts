import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  DkturboUserId,
  NutritionMealItem,
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
  NutritionMealItemQuantityNotFoundError,
  removeMealItemQuantity,
} from './remove-meal-item-quantity.js';

import {
  createTestPersonAccessRepository,
} from './test-person-access-repository.js';

import {
  createTestFoodPreparationConversionRepository,
} from './test-food-preparation-conversion-repository.js';

const mealItemId =
  '11111111-1111-4111-8111-111111111111' as
    NutritionMealItemId;

const userId =
  '22222222-2222-4222-8222-222222222222' as
    DkturboUserId;

const now =
  new Date(
    '2026-09-21T12:00:00.000Z',
  );

const item:
  NutritionMealItem = {
    id:
      mealItemId,

    mealId:
      '33333333-3333-4333-8333-333333333333' as
        NutritionMealItem['mealId'],

    foodId:
      '44444444-4444-4444-8444-444444444444' as
        NutritionMealItem['foodId'],

    foodSnapshot: {
      name:
        'Test food',

      brand:
        null,

      category:
        'OTHER',

      referenceAmount:
        100,

      referenceUnit:
        'G',

      caloriesKcal:
        100,

      proteinG:
        10,

      carbohydratesG:
        10,

      fatG:
        1,

      fiberG:
        null,
    },

    preparationConversionId:
      null,

    position:
      0,

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };

const createRepositories =
  (
    itemExists:
      boolean,

    quantityExists:
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
          itemExists
            ? item
            : null,

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
          quantityExists,

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
  'removeMealItemQuantity',
  () => {

    it(
      'removes the quantity for one user',
      async () => {

        const repositories =
          createRepositories(
            true,
            true,
          );

        let deletedMealItemId:
          NutritionMealItemId | null =
            null;

        let deletedUserId:
          DkturboUserId | null =
            null;

        repositories
          .mealItems
          .deleteQuantity =
            async (
              receivedMealItemId,
              receivedUserId,
            ) => {

              deletedMealItemId =
                receivedMealItemId;

              deletedUserId =
                receivedUserId;

              return true;
            };

        await removeMealItemQuantity(
          createUnitOfWork(
            repositories,
          ),
          {
            mealItemId,
            userId,
          },
        );

        expect(
          deletedMealItemId,
        ).toBe(
          mealItemId,
        );

        expect(
          deletedUserId,
        ).toBe(
          userId,
        );
      },
    );

    it(
      'fails when the meal item does not exist',
      async () => {

        await expect(
          removeMealItemQuantity(
            createUnitOfWork(
              createRepositories(
                false,
                false,
              ),
            ),
            {
              mealItemId,
              userId,
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionMealItemNotFoundError,
        );
      },
    );

    it(
      'fails when the user quantity does not exist',
      async () => {

        await expect(
          removeMealItemQuantity(
            createUnitOfWork(
              createRepositories(
                true,
                false,
              ),
            ),
            {
              mealItemId,
              userId,
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionMealItemQuantityNotFoundError,
        );
      },
    );
  },
);

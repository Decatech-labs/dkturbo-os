import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  NutritionDayId,
  NutritionMeal,
  NutritionMealId,
  NutritionMealItemDetail,
  NutritionMealItemId,
} from '../domain/index.js';

import type {
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  InvalidNutritionMealItemMoveError,
  moveMealItem,
  NutritionMealItemNotFoundError,
} from './move-meal-item.js';

const dayId =
  '11111111-1111-4111-8111-111111111111' as
    NutritionDayId;

const otherDayId =
  '22222222-2222-4222-8222-222222222222' as
    NutritionDayId;

const breakfastId =
  '33333333-3333-4333-8333-333333333333' as
    NutritionMealId;

const lunchId =
  '44444444-4444-4444-8444-444444444444' as
    NutritionMealId;

const otherDayMealId =
  '55555555-5555-4555-8555-555555555555' as
    NutritionMealId;

const oatsItemId =
  '66666666-6666-4666-8666-666666666666' as
    NutritionMealItemId;

const milkItemId =
  '77777777-7777-4777-8777-777777777777' as
    NutritionMealItemId;

const breadItemId =
  '88888888-8888-4888-8888-888888888888' as
    NutritionMealItemId;

const now =
  new Date(
    '2026-09-21T12:00:00.000Z',
  );

const breakfast:
  NutritionMeal = {
    id:
      breakfastId,

    dayId,

    name:
      'Desayuno',

    plannedTime:
      '07:00',

    position:
      0,

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };

const lunch:
  NutritionMeal = {
    id:
      lunchId,

    dayId,

    name:
      'Almuerzo',

    plannedTime:
      '10:00',

    position:
      1,

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };

const otherDayMeal:
  NutritionMeal = {
    id:
      otherDayMealId,

    dayId:
      otherDayId,

    name:
      'Desayuno',

    plannedTime:
      '07:00',

    position:
      0,

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };

const createDetail =
  (
    id:
      NutritionMealItemId,

    mealId:
      NutritionMealId,

    position:
      number,

    name:
      string,
  ):
    NutritionMealItemDetail => ({
      item: {
        id,

        mealId,

        foodId:
          `${id}-food` as
            NutritionMealItemDetail[
              'food'
            ][
              'id'
            ],

        position,

        notes:
          null,

        createdAt:
          now,

        updatedAt:
          now,
      },

      food: {
        id:
          `${id}-food` as
            NutritionMealItemDetail[
              'food'
            ][
              'id'
            ],

        name,

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

        createdByUserId:
          '99999999-9999-4999-8999-999999999999' as
            NutritionMealItemDetail[
              'food'
            ][
              'createdByUserId'
            ],

        archivedAt:
          null,

        createdAt:
          now,

        updatedAt:
          now,
      },

      quantities:
        [],
    });

const oats =
  createDetail(
    oatsItemId,
    breakfastId,
    0,
    'Avena',
  );

const milk =
  createDetail(
    milkItemId,
    breakfastId,
    1,
    'Leche',
  );

const bread =
  createDetail(
    breadItemId,
    lunchId,
    0,
    'Pan',
  );

const createRepositories =
  (): NutritionRepositories => ({
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
        async mealId => {

          if (
            mealId ===
            breakfastId
          ) {
            return breakfast;
          }

          if (
            mealId ===
            lunchId
          ) {
            return lunch;
          }

          if (
            mealId ===
            otherDayMealId
          ) {
            return otherDayMeal;
          }

          return null;
        },

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
        async itemId => {

          if (
            itemId ===
            oatsItemId
          ) {
            return oats.item;
          }

          if (
            itemId ===
            milkItemId
          ) {
            return milk.item;
          }

          if (
            itemId ===
            breadItemId
          ) {
            return bread.item;
          }

          return null;
        },

      saveQuantities:
        async () => {},

      setLocations:
        async () => {},

      delete:
        async () =>
          false,

      listDetailsForMeal:
        async mealId => {

          if (
            mealId ===
            breakfastId
          ) {
            return [
              oats,
              milk,
            ];
          }

          if (
            mealId ===
            lunchId
          ) {
            return [
              bread,
            ];
          }

          return [];
        },
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
  'moveMealItem',
  () => {

    it(
      'reorders an item inside the same meal',
      async () => {

        const repositories =
          createRepositories();

        let savedLocations:
          Parameters<
            NutritionRepositories[
              'mealItems'
            ][
              'setLocations'
            ]
          >[0] =
            [];

        repositories
          .mealItems
          .setLocations =
            async data => {

              savedLocations =
                data;
            };

        await moveMealItem(
          createUnitOfWork(
            repositories,
          ),
          {
            mealItemId:
              milkItemId,

            targetMealId:
              breakfastId,

            targetPosition:
              0,
          },
        );

        expect(
          savedLocations,
        ).toEqual([
          {
            mealItemId:
              milkItemId,

            mealId:
              breakfastId,

            position:
              0,
          },

          {
            mealItemId:
              oatsItemId,

            mealId:
              breakfastId,

            position:
              1,
          },
        ]);
      },
    );

    it(
      'moves an item to another meal in the same day',
      async () => {

        const repositories =
          createRepositories();

        let savedLocations:
          Parameters<
            NutritionRepositories[
              'mealItems'
            ][
              'setLocations'
            ]
          >[0] =
            [];

        repositories
          .mealItems
          .setLocations =
            async data => {

              savedLocations =
                data;
            };

        await moveMealItem(
          createUnitOfWork(
            repositories,
          ),
          {
            mealItemId:
              oatsItemId,

            targetMealId:
              lunchId,

            targetPosition:
              1,
          },
        );

        expect(
          savedLocations,
        ).toEqual([
          {
            mealItemId:
              milkItemId,

            mealId:
              breakfastId,

            position:
              0,
          },

          {
            mealItemId:
              breadItemId,

            mealId:
              lunchId,

            position:
              0,
          },

          {
            mealItemId:
              oatsItemId,

            mealId:
              lunchId,

            position:
              1,
          },
        ]);
      },
    );

    it(
      'rejects moves between different days',
      async () => {

        const repositories =
          createRepositories();

        await expect(
          moveMealItem(
            createUnitOfWork(
              repositories,
            ),
            {
              mealItemId:
                oatsItemId,

              targetMealId:
                otherDayMealId,

              targetPosition:
                0,
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidNutritionMealItemMoveError,
        );
      },
    );

    it(
      'fails when the meal item does not exist',
      async () => {

        const repositories =
          createRepositories();

        await expect(
          moveMealItem(
            createUnitOfWork(
              repositories,
            ),
            {
              mealItemId:
                'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' as
                  NutritionMealItemId,

              targetMealId:
                lunchId,

              targetPosition:
                0,
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionMealItemNotFoundError,
        );
      },
    );
  },
);

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  DkturboUserId,
  NutritionPlan,
  NutritionPlanId,
  NutritionPlanTarget,
  NutritionPlanTargetId,
} from '../domain/index.js';

import type {
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  InvalidNutritionTargetError,
  NutritionPlanNotFoundError,
  setPlanTarget,
} from './set-plan-target.js';

import {
  createTestPersonAccessRepository,
} from './test-person-access-repository.js';

import {
  createTestFoodPreparationConversionRepository,
} from './test-food-preparation-conversion-repository.js';

const userId =
  '10000000-0000-4000-8000-000000000001' as
    DkturboUserId;

const planId =
  '20000000-0000-4000-8000-000000000001' as
    NutritionPlanId;

const targetId =
  '30000000-0000-4000-8000-000000000001' as
    NutritionPlanTargetId;

const plan:
  NutritionPlan = {
    id:
      planId,

    title:
      'Semana 21-27 septiembre',

    startDate:
      '2026-09-21',

    endDate:
      '2026-09-27',

    status:
      'DRAFT',

    createdByUserId:
      userId,

    createdAt:
      new Date(
        '2026-09-19T20:00:00.000Z',
      ),

    updatedAt:
      new Date(
        '2026-09-19T20:00:00.000Z',
      ),
  };

const createUnitOfWork =
  (
    overrides:
      Partial<NutritionRepositories> = {},
  ): NutritionUnitOfWork => ({
    execute:
      async <T>(
        work: (
          repositories:
            NutritionRepositories,
        ) => Promise<T>,
      ): Promise<T> =>
        work({
          plans: {
            create:
              async () =>
                plan,

            findById:
              async () =>
                plan,

            list:
              async () =>
                [
                  plan,
                ],
          },

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

          planTargets: {
            save:
              async data =>
                ({
                  id:
                    targetId,

                  planId:
                    data.planId,

                  userId:
                    data.userId,

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

                  createdAt:
                    new Date(
                      '2026-09-19T20:00:00.000Z',
                    ),

                  updatedAt:
                    new Date(
                      '2026-09-19T20:00:00.000Z',
                    ),
                }) satisfies NutritionPlanTarget,

            findForUser:
              async () =>
                null,

            listForPlan:
              async () =>
                [],
          },

          ...overrides,
        }),
  });

describe(
  'setPlanTarget',
  () => {

    it(
      'saves calories and macro targets for one user',
      async () => {

        const unitOfWork =
          createUnitOfWork();

        const result =
          await setPlanTarget(
            unitOfWork,
            {
              planId,

              userId,

              caloriesKcal:
                3400,

              proteinG:
                185,

              carbohydratesG:
                450,

              fatG:
                90,

              fiberG:
                35,
            },
          );

        expect(
          result,
        ).toMatchObject({
          planId,

          userId,

          caloriesKcal:
            3400,

          proteinG:
            185,

          carbohydratesG:
            450,

          fatG:
            90,

          fiberG:
            35,
        });
      },
    );

    it(
      'allows nullable nutrition targets',
      async () => {

        const unitOfWork =
          createUnitOfWork();

        const result =
          await setPlanTarget(
            unitOfWork,
            {
              planId,

              userId,

              caloriesKcal:
                null,

              proteinG:
                null,

              carbohydratesG:
                null,

              fatG:
                null,

              fiberG:
                null,
            },
          );

        expect(
          result.caloriesKcal,
        ).toBeNull();

        expect(
          result.proteinG,
        ).toBeNull();

        expect(
          result.carbohydratesG,
        ).toBeNull();

        expect(
          result.fatG,
        ).toBeNull();

        expect(
          result.fiberG,
        ).toBeNull();
      },
    );

    it.each([
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
      'rejects negative $field',
      async ({
        field,
        value,
      }) => {

        const unitOfWork =
          createUnitOfWork();

        const input = {
          planId,

          userId,

          caloriesKcal:
            3400,

          proteinG:
            185,

          carbohydratesG:
            450,

          fatG:
            90,

          fiberG:
            35,
        };

        await expect(
          setPlanTarget(
            unitOfWork,
            {
              ...input,

              [field]:
                value,
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidNutritionTargetError,
        );
      },
    );

    it(
      'rejects non-finite targets',
      async () => {

        const unitOfWork =
          createUnitOfWork();

        await expect(
          setPlanTarget(
            unitOfWork,
            {
              planId,

              userId,

              caloriesKcal:
                Number.NaN,

              proteinG:
                185,

              carbohydratesG:
                450,

              fatG:
                90,

              fiberG:
                35,
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidNutritionTargetError,
        );
      },
    );

    it(
      'rejects an unknown nutrition plan without saving',
      async () => {

        const save =
          vi.fn();

        const unitOfWork =
          createUnitOfWork({
            plans: {
              create:
                async () =>
                  plan,

              findById:
                async () =>
                  null,

              list:
                async () =>
                  [],
            },

            planTargets: {
              save,

              findForUser:
                async () =>
                  null,

              listForPlan:
                async () =>
                  [],
            },
          });

        await expect(
          setPlanTarget(
            unitOfWork,
            {
              planId,

              userId,

              caloriesKcal:
                3400,

              proteinG:
                185,

              carbohydratesG:
                450,

              fatG:
                90,

              fiberG:
                35,
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionPlanNotFoundError,
        );

        expect(
          save,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'delegates repeated saves to the repository UPSERT path',
      async () => {

        const save =
          vi.fn(
            async data =>
              ({
                id:
                  targetId,

                planId:
                  data.planId,

                userId:
                  data.userId,

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

                createdAt:
                  new Date(),

                updatedAt:
                  new Date(),
              }) satisfies NutritionPlanTarget,
          );

        const unitOfWork =
          createUnitOfWork({
            planTargets: {
              save,

              findForUser:
                async () =>
                  null,

              listForPlan:
                async () =>
                  [],
            },
          });

        await setPlanTarget(
          unitOfWork,
          {
            planId,

            userId,

            caloriesKcal:
              3400,

            proteinG:
              185,

            carbohydratesG:
              450,

            fatG:
              90,

            fiberG:
              35,
          },
        );

        await setPlanTarget(
          unitOfWork,
          {
            planId,

            userId,

            caloriesKcal:
              3600,

            proteinG:
              190,

            carbohydratesG:
              480,

            fatG:
              95,

            fiberG:
              38,
          },
        );

        expect(
          save,
        ).toHaveBeenCalledTimes(
          2,
        );

        expect(
          save,
        ).toHaveBeenLastCalledWith({
          planId,

          userId,

          caloriesKcal:
            3600,

          proteinG:
            190,

          carbohydratesG:
            480,

          fatG:
            95,

          fiberG:
            38,
        });
      },
    );
  },
);

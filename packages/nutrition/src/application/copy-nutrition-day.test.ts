import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  DkturboUserId,
  NutritionDay,
  NutritionDayId,
  NutritionFoodId,
  NutritionFoodPreparationConversionId,
  NutritionMeal,
  NutritionMealId,
  NutritionMealItem,
  NutritionMealItemDetail,
  NutritionMealItemId,
  NutritionPlan,
  NutritionPlanId,
} from '../domain/index.js';

import type {
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  copyNutritionDay,
  InvalidNutritionQuantityCopyMappingError,
  NutritionCopySameDayError,
  NutritionCopySourceDayEmptyError,
  NutritionCopyTargetDayNotEmptyError,
} from './copy-nutrition-day.js';

const sourcePlanId =
  '10000000-0000-4000-8000-000000000001' as
    NutritionPlanId;

const sourceDayId =
  '20000000-0000-4000-8000-000000000001' as
    NutritionDayId;

const targetDayId =
  '20000000-0000-4000-8000-000000000002' as
    NutritionDayId;

const sourceMealId =
  '30000000-0000-4000-8000-000000000001' as
    NutritionMealId;

const createdMealId =
  '30000000-0000-4000-8000-000000000002' as
    NutritionMealId;

const sourceItemId =
  '40000000-0000-4000-8000-000000000001' as
    NutritionMealItemId;

const createdItemId =
  '40000000-0000-4000-8000-000000000002' as
    NutritionMealItemId;

const plannedFoodId =
  '50000000-0000-4000-8000-000000000001' as
    NutritionFoodId;

const actuallyEatenFoodId =
  '50000000-0000-4000-8000-000000000002' as
    NutritionFoodId;

const preparationConversionId =
  '60000000-0000-4000-8000-000000000001' as
    NutritionFoodPreparationConversionId;

const sourceUserId =
  '70000000-0000-4000-8000-000000000001' as
    DkturboUserId;

const targetUserId =
  '70000000-0000-4000-8000-000000000002' as
    DkturboUserId;

const now =
  new Date(
    '2026-10-01T12:00:00.000Z',
  );

const plan:
  NutritionPlan = {
    id:
      sourcePlanId,

    title:
      'Semana de prueba',

    startDate:
      '2026-10-05',

    endDate:
      '2026-10-11',

    status:
      'DRAFT',

    createdByUserId:
      sourceUserId,

    createdAt:
      now,

    updatedAt:
      now,
  };

const sourceDay:
  NutritionDay = {
    id:
      sourceDayId,

    planId:
      sourcePlanId,

    date:
      '2026-10-05',

    notes:
      'Día planificado',

    createdAt:
      now,

    updatedAt:
      now,
  };

const targetDay:
  NutritionDay = {
    id:
      targetDayId,

    planId:
      sourcePlanId,

    date:
      '2026-10-08',

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };

const sourceMeal:
  NutritionMeal = {
    id:
      sourceMealId,

    dayId:
      sourceDayId,

    name:
      'Comida',

    plannedTime:
      '14:00',

    position:
      1,

    notes:
      'Comida planificada',

    createdAt:
      now,

    updatedAt:
      now,
  };

const sourceDetail:
  NutritionMealItemDetail = {
    item: {
      id:
        sourceItemId,

      mealId:
        sourceMealId,

      foodId:
        plannedFoodId,

      foodSnapshot: {
        name:
          'Arroz',

        brand:
          null,

        category:
          'RICE',

        referenceAmount:
          100,

        referenceUnit:
          'G',

        caloriesKcal:
          350,

        proteinG:
          7,

        carbohydratesG:
          78,

        fatG:
          1,

        fiberG:
          1,
      },

      preparationConversionId,

      position:
        0,

      notes:
        'Arroz planificado',

      createdAt:
        now,

      updatedAt:
        now,
    },

    food: {
      id:
        plannedFoodId,

      name:
        'Arroz',

      brand:
        null,

      category:
        'RICE',

      referenceAmount:
        100,

      referenceUnit:
        'G',

      caloriesKcal:
        350,

      proteinG:
        7,

      carbohydratesG:
        78,

      fatG:
        1,

      fiberG:
        1,

      createdByUserId:
        sourceUserId,

      archivedAt:
        null,

      createdAt:
        now,

      updatedAt:
        now,
    },

    quantities: [
      {
        id:
          '80000000-0000-4000-8000-000000000001' as
            NutritionMealItemDetail[
              'quantities'
            ][number]['id'],

        mealItemId:
          sourceItemId,

        userId:
          sourceUserId,

        quantity:
          200,

        createdAt:
          now,

        updatedAt:
          now,
      },
    ],

    preparation: {
      conversion: {
        id:
          preparationConversionId,

        foodId:
          plannedFoodId,

        name:
          'Cocido',

        rawAmount:
          100,

        preparedAmount:
          250,

        preparedUnit:
          'G',

        isDefault:
          false,

        createdAt:
          now,

        updatedAt:
          now,
      },

      source:
        'EXPLICIT',
    },
  };

interface FixtureOptions {
  sourceMeals?:
    NutritionMeal[];

  targetMeals?:
    NutritionMeal[];
}

const createFixture =
  (
    options:
      FixtureOptions = {},
  ) => {

    const createdMealInputs:
      unknown[] = [];

    const createdItemInputs:
      unknown[] = [];

    const savedQuantities:
      unknown[] = [];

    let actualRepositoryReads =
      0;

    const repositories = {
      plans: {
        findById:
          async (
            planId:
              NutritionPlanId,
          ) =>
            planId ===
              sourcePlanId
              ? plan
              : null,
      },

      days: {
        listForPlan:
          async (
            planId:
              NutritionPlanId,
          ) =>
            planId ===
              sourcePlanId
              ? [
                  sourceDay,
                  targetDay,
                ]
              : [],
      },

      meals: {
        listForDay:
          async (
            dayId:
              NutritionDayId,
          ) => {

            if (
              dayId ===
              sourceDayId
            ) {
              return (
                options.sourceMeals ??
                [sourceMeal]
              );
            }

            if (
              dayId ===
              targetDayId
            ) {
              return (
                options.targetMeals ??
                []
              );
            }

            return [];
          },

        create:
          async (
            data:
              unknown,
          ) => {

            createdMealInputs.push(
              data,
            );

            return {
              id:
                createdMealId,

              dayId:
                targetDayId,

              name:
                sourceMeal.name,

              plannedTime:
                sourceMeal.plannedTime,

              position:
                sourceMeal.position,

              notes:
                sourceMeal.notes,

              createdAt:
                now,

              updatedAt:
                now,
            } satisfies NutritionMeal;
          },
      },

      mealItems: {
        listDetailsForMeal:
          async (
            mealId:
              NutritionMealId,
          ) =>
            mealId ===
              sourceMealId
              ? [sourceDetail]
              : [],

        create:
          async (
            data:
              unknown,
          ) => {

            createdItemInputs.push(
              data,
            );

            return {
              id:
                createdItemId,

              mealId:
                createdMealId,

              foodId:
                plannedFoodId,

              foodSnapshot:
                sourceDetail.item
                  .foodSnapshot,

              preparationConversionId,

              position:
                sourceDetail.item
                  .position,

              notes:
                sourceDetail.item
                  .notes,

              createdAt:
                now,

              updatedAt:
                now,
            } satisfies NutritionMealItem;
          },

        saveQuantities:
          async (
            data:
              unknown[],
          ) => {

            savedQuantities.push(
              ...data,
            );
          },
      },

      mealItemActuals: {
        listForDay:
          async () => {

            actualRepositoryReads +=
              1;

            return [
              {
                plannedFoodId,

                actualFoodId:
                  actuallyEatenFoodId,
              },
            ];
          },
      },
    } as unknown as
      NutritionRepositories;

    const unitOfWork: NutritionUnitOfWork = {
      execute:
        async work =>
          work(
            repositories,
          ),
    };

    return {
      unitOfWork,
      createdMealInputs,
      createdItemInputs,
      savedQuantities,

      getActualRepositoryReads:
        () =>
          actualRepositoryReads,
    };
  };

describe(
  'copyNutritionDay',
  () => {

    it(
      'copies the planned food, preparation and planned quantity without reading actual replacements',
      async () => {

        const fixture =
          createFixture();

        const result =
          await copyNutritionDay(
            fixture.unitOfWork,
            {
              sourcePlanId,

              sourceDayId,

              targetPlanId:
                sourcePlanId,

              targetDayId,

              quantityMappings: [
                {
                  sourceUserId,

                  targetUserId,
                },
              ],
            },
          );

        expect(
          result.createdMeals,
        ).toHaveLength(
          1,
        );

        expect(
          result.createdItems,
        ).toHaveLength(
          1,
        );

        expect(
          fixture.createdMealInputs,
        ).toEqual([
          {
            dayId:
              targetDayId,

            name:
              'Comida',

            plannedTime:
              '14:00',

            position:
              1,

            notes:
              'Comida planificada',
          },
        ]);

        expect(
          fixture.createdItemInputs,
        ).toEqual([
          {
            mealId:
              createdMealId,

            foodId:
              plannedFoodId,

            preparationConversionId,

            foodSnapshot:
              sourceDetail.item
                .foodSnapshot,

            position:
              0,

            notes:
              'Arroz planificado',
          },
        ]);

        expect(
          fixture.savedQuantities,
        ).toEqual([
          {
            mealItemId:
              createdItemId,

            userId:
              targetUserId,

            quantity:
              200,
          },
        ]);

        expect(
          fixture.getActualRepositoryReads(),
        ).toBe(
          0,
        );

        expect(
          fixture.createdItemInputs,
        ).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              foodId:
                actuallyEatenFoodId,
            }),
          ]),
        );
      },
    );

    it(
      'rejects copying onto a non-empty target day',
      async () => {

        const existingTargetMeal:
          NutritionMeal = {
          ...sourceMeal,

          id:
            createdMealId,

          dayId:
            targetDayId,
        };

        const fixture =
          createFixture({
            targetMeals: [
              existingTargetMeal,
            ],
          });

        await expect(
          copyNutritionDay(
            fixture.unitOfWork,
            {
              sourcePlanId,

              sourceDayId,

              targetPlanId:
                sourcePlanId,

              targetDayId,

              quantityMappings: [],
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionCopyTargetDayNotEmptyError,
        );

        expect(
          fixture.createdMealInputs,
        ).toHaveLength(
          0,
        );
      },
    );

    it(
      'rejects copying an empty source day',
      async () => {

        const fixture =
          createFixture({
            sourceMeals: [],
          });

        await expect(
          copyNutritionDay(
            fixture.unitOfWork,
            {
              sourcePlanId,

              sourceDayId,

              targetPlanId:
                sourcePlanId,

              targetDayId,

              quantityMappings: [],
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionCopySourceDayEmptyError,
        );
      },
    );

    it(
      'rejects copying a day onto itself',
      async () => {

        const fixture =
          createFixture();

        await expect(
          copyNutritionDay(
            fixture.unitOfWork,
            {
              sourcePlanId,

              sourceDayId,

              targetPlanId:
                sourcePlanId,

              targetDayId:
                sourceDayId,

              quantityMappings: [],
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionCopySameDayError,
        );
      },
    );

    it(
      'rejects assigning multiple source quantities to the same target user',
      async () => {

        const fixture =
          createFixture();

        const anotherSourceUserId =
          '70000000-0000-4000-8000-000000000003' as
            DkturboUserId;

        await expect(
          copyNutritionDay(
            fixture.unitOfWork,
            {
              sourcePlanId,

              sourceDayId,

              targetPlanId:
                sourcePlanId,

              targetDayId,

              quantityMappings: [
                {
                  sourceUserId,

                  targetUserId,
                },

                {
                  sourceUserId:
                    anotherSourceUserId,

                  targetUserId,
                },
              ],
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidNutritionQuantityCopyMappingError,
        );
      },
    );
  },
);

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
  NutritionMealItemId,
  NutritionPlan,
  NutritionPlanId,
  NutritionPlanTarget,
} from '../domain/index.js';

import type {
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  copyNutritionWeek,
  InvalidNutritionWeekCopyError,
  NutritionCopyTargetWeekAlreadyExistsError,
} from './copy-nutrition-week.js';

const sourcePlanId =
  '10000000-0000-4000-8000-000000000001' as
    NutritionPlanId;

const targetPlanId =
  '10000000-0000-4000-8000-000000000002' as
    NutritionPlanId;

const sourceUserId =
  '70000000-0000-4000-8000-000000000001' as
    DkturboUserId;

const targetUserId =
  '70000000-0000-4000-8000-000000000002' as
    DkturboUserId;

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

const now =
  new Date(
    '2026-10-05T12:00:00.000Z',
  );

const sourcePlan:
  NutritionPlan = {
    id:
      sourcePlanId,

    title:
      'Semana 5-11 octubre',

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

const targetPlan:
  NutritionPlan = {
    id:
      targetPlanId,

    title:
      'Semana 12-18 octubre',

    startDate:
      '2026-10-12',

    endDate:
      '2026-10-18',

    status:
      'DRAFT',

    createdByUserId:
      sourceUserId,

    createdAt:
      now,

    updatedAt:
      now,
  };

const sourceDays =
  Array.from(
    {
      length:
        7,
    },
    (
      _,
      index,
    ) => ({
      id:
        `20000000-0000-4000-8000-00000000000${index + 1}` as
          NutritionDayId,

      planId:
        sourcePlanId,

      date:
        `2026-10-${String(
          5 + index,
        ).padStart(
          2,
          '0',
        )}`,

      notes:
        index ===
        0
          ? 'Lunes planificado'
          : null,

      createdAt:
        now,

      updatedAt:
        now,
    }),
  );

const sourceMeal:
  NutritionMeal = {
    id:
      sourceMealId,

    dayId:
      sourceDays[0]!.id,

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

const sourceTarget:
  NutritionPlanTarget = {
    id:
      '80000000-0000-4000-8000-000000000001' as
        NutritionPlanTarget['id'],

    planId:
      sourcePlanId,

    userId:
      sourceUserId,

    caloriesKcal:
      2800,

    proteinG:
      160,

    carbohydratesG:
      350,

    fatG:
      80,

    fiberG:
      30,

    createdAt:
      now,

    updatedAt:
      now,
  };

const createFixture =
  (
    options: {
      existingTargetWeek?:
        boolean;
    } = {},
  ) => {

    const createdDays:
      NutritionDay[] = [];

    const createdMealInputs:
      unknown[] = [];

    const createdItemInputs:
      unknown[] = [];

    const savedQuantities:
      unknown[] = [];

    const savedTargets:
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
              ? sourcePlan
              : null,

        list:
          async () =>
            options.existingTargetWeek
              ? [
                  sourcePlan,
                  targetPlan,
                ]
              : [
                  sourcePlan,
                ],

        create:
          async (
            data: {
              title:
                string;

              startDate:
                string;

              endDate:
                string;

              status:
                NutritionPlan['status'];

              createdByUserId:
                DkturboUserId;
            },
          ) => ({
            ...targetPlan,
            ...data,
            id:
              targetPlanId,
          }),
      },

      days: {
        listForPlan:
          async (
            planId:
              NutritionPlanId,
          ) =>
            planId ===
              sourcePlanId
              ? sourceDays
              : [],

        createMany:
          async (
            data:
              Array<{
                planId:
                  NutritionPlanId;

                date:
                  string;

                notes:
                  string | null;
              }>,
          ) => {

            createdDays.splice(
              0,
              createdDays.length,
              ...data.map(
                (
                  day,
                  index,
                ) => ({
                  id:
                    `90000000-0000-4000-8000-00000000000${index + 1}` as
                      NutritionDayId,

                  planId:
                    day.planId,

                  date:
                    day.date,

                  notes:
                    day.notes,

                  createdAt:
                    now,

                  updatedAt:
                    now,
                }),
              ),
            );

            return createdDays;
          },
      },

      meals: {
        listForDay:
          async (
            dayId:
              NutritionDayId,
          ) =>
            dayId ===
              sourceDays[0]!.id
              ? [
                  sourceMeal,
                ]
              : [],

        create:
          async (
            data:
              any,
          ) => {

            createdMealInputs.push(
              data,
            );

            return {
              id:
                createdMealId,

              dayId:
                data.dayId,

              name:
                data.name,

              plannedTime:
                data.plannedTime,

              position:
                data.position,

              notes:
                data.notes,

              createdAt:
                now,

              updatedAt:
                now,
            } as NutritionMeal;
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
              ? [
                  {
                    item: {
                      id:
                        sourceItemId,

                      mealId:
                        sourceMealId,

                      foodId:
                        plannedFoodId,

                      preparationConversionId,

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

                      position:
                        0,

                      notes:
                        'Planificado',

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
                          '81000000-0000-4000-8000-000000000001',

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
                  },
                ]
              : [],

        create:
          async (
            data:
              any,
          ) => {

            createdItemInputs.push(
              data,
            );

            return {
              id:
                createdItemId,

              mealId:
                data.mealId,

              foodId:
                data.foodId,

              preparationConversionId:
                data.preparationConversionId,

              foodSnapshot:
                data.foodSnapshot,

              position:
                data.position,

              notes:
                data.notes,

              createdAt:
                now,

              updatedAt:
                now,
            } as NutritionMealItem;
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

      planTargets: {
        listForPlan:
          async (
            planId:
              NutritionPlanId,
          ) =>
            planId ===
              sourcePlanId
              ? [
                  sourceTarget,
                ]
              : [],

        save:
          async (
            data:
              any,
          ) => {

            savedTargets.push(
              data,
            );

            return {
              ...sourceTarget,

              id:
                '80000000-0000-4000-8000-000000000002',

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
            } as NutritionPlanTarget;
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

    const unitOfWork:
      NutritionUnitOfWork = {
        execute:
          async work =>
            work(
              repositories,
            ),
      };

    return {
      unitOfWork,
      createdDays,
      createdMealInputs,
      createdItemInputs,
      savedQuantities,
      savedTargets,

      getActualRepositoryReads:
        () =>
          actualRepositoryReads,
    };
  };

describe(
  'copyNutritionWeek',
  () => {

    it(
      'creates seven consecutive target days and copies planned structure only',
      async () => {

        const fixture =
          createFixture();

        const result =
          await copyNutritionWeek(
            fixture.unitOfWork,
            {
              sourcePlanId,

              targetWeekStart:
                '2026-10-12',

              title:
                'Semana 12-18 octubre',

              createdByUserId:
                sourceUserId,

              quantityMappings: [
                {
                  sourceUserId,

                  targetUserId,
                },
              ],
            },
          );

        expect(
          result.createdDays,
        ).toHaveLength(
          7,
        );

        expect(
          result.createdDays.map(
            day =>
              day.date,
          ),
        ).toEqual([
          '2026-10-12',
          '2026-10-13',
          '2026-10-14',
          '2026-10-15',
          '2026-10-16',
          '2026-10-17',
          '2026-10-18',
        ]);

        expect(
          fixture.createdMealInputs,
        ).toHaveLength(
          1,
        );

        expect(
          fixture.createdItemInputs,
        ).toEqual([
          expect.objectContaining({
            foodId:
              plannedFoodId,

            preparationConversionId,
          }),
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
      'copies the source weekly target through the person mapping',
      async () => {

        const fixture =
          createFixture();

        await copyNutritionWeek(
          fixture.unitOfWork,
          {
            sourcePlanId,

            targetWeekStart:
              '2026-10-12',

            title:
              'Semana 12-18 octubre',

            createdByUserId:
              sourceUserId,

            quantityMappings: [
              {
                sourceUserId,

                targetUserId,
              },
            ],
          },
        );

        expect(
          fixture.savedTargets,
        ).toEqual([
          {
            planId:
              targetPlanId,

            userId:
              targetUserId,

            caloriesKcal:
              2800,

            proteinG:
              160,

            carbohydratesG:
              350,

            fatG:
              80,

            fiberG:
              30,
          },
        ]);
      },
    );

    it(
      'rejects a target week that already exists',
      async () => {

        const fixture =
          createFixture({
            existingTargetWeek:
              true,
          });

        await expect(
          copyNutritionWeek(
            fixture.unitOfWork,
            {
              sourcePlanId,

              targetWeekStart:
                '2026-10-12',

              title:
                'Semana 12-18 octubre',

              createdByUserId:
                sourceUserId,

              quantityMappings: [],
            },
          ),
        ).rejects.toBeInstanceOf(
          NutritionCopyTargetWeekAlreadyExistsError,
        );

        expect(
          fixture.createdDays,
        ).toHaveLength(
          0,
        );
      },
    );

    it(
      'rejects a target date that is not Monday',
      async () => {

        const fixture =
          createFixture();

        await expect(
          copyNutritionWeek(
            fixture.unitOfWork,
            {
              sourcePlanId,

              targetWeekStart:
                '2026-10-13',

              title:
                'Semana inválida',

              createdByUserId:
                sourceUserId,

              quantityMappings: [],
            },
          ),
        ).rejects.toBeInstanceOf(
          InvalidNutritionWeekCopyError,
        );
      },
    );
  },
);

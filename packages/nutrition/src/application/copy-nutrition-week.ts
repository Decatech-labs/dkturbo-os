import type {
  DkturboUserId,
  NutritionDay,
  NutritionMeal,
  NutritionMealItem,
  NutritionPlan,
  NutritionPlanId,
  NutritionPlanTarget,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  InvalidNutritionQuantityCopyMappingError,
  type NutritionQuantityCopyMapping,
} from './copy-nutrition-day.js';

export interface CopyNutritionWeekInput {
  sourcePlanId:
    NutritionPlanId;

  targetWeekStart:
    string;

  title:
    string;

  createdByUserId:
    DkturboUserId;

  quantityMappings:
    NutritionQuantityCopyMapping[];
}

export interface CopyNutritionWeekResult {
  sourcePlan:
    NutritionPlan;

  targetPlan:
    NutritionPlan;

  createdDays:
    NutritionDay[];

  createdMeals:
    NutritionMeal[];

  createdItems:
    NutritionMealItem[];

  createdTargets:
    NutritionPlanTarget[];
}

export class NutritionCopyWeekSourcePlanNotFoundError
extends Error {}

export class NutritionCopyTargetWeekAlreadyExistsError
extends Error {}

export class NutritionCopySourceWeekInvalidError
extends Error {}

export class InvalidNutritionWeekCopyError
extends Error {}

const DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})$/;

const parseDate =
  (
    value:
      string,
  ): Date | null => {

    const match =
      DATE_PATTERN.exec(
        value,
      );

    if (!match) {
      return null;
    }

    const year =
      Number(
        match[1],
      );

    const month =
      Number(
        match[2],
      );

    const day =
      Number(
        match[3],
      );

    const date =
      new Date(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0,
      );

    if (
      date.getFullYear() !==
        year ||
      date.getMonth() !==
        month - 1 ||
      date.getDate() !==
        day
    ) {
      return null;
    }

    return date;
  };

const formatDate =
  (
    date:
      Date,
  ): string => {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${day}`;
  };

const addDays =
  (
    date:
      Date,

    amount:
      number,
  ): Date => {

    const result =
      new Date(
        date,
      );

    result.setDate(
      result.getDate() +
        amount,
    );

    return result;
  };

export const copyNutritionWeek =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      CopyNutritionWeekInput,
  ): Promise<CopyNutritionWeekResult> => {

    const title =
      input.title.trim();

    if (
      title.length ===
        0 ||
      title.length >
        200
    ) {
      throw new InvalidNutritionWeekCopyError(
        'Invalid Nutrition target week title',
      );
    }

    const targetStartDate =
      parseDate(
        input.targetWeekStart,
      );

    if (!targetStartDate) {
      throw new InvalidNutritionWeekCopyError(
        'targetWeekStart must be a valid YYYY-MM-DD date',
      );
    }

    if (
      targetStartDate.getDay() !==
        1
    ) {
      throw new InvalidNutritionWeekCopyError(
        'targetWeekStart must be a Monday',
      );
    }

    const targetUserIds =
      new Set<string>();

    for (
      const mapping of
      input.quantityMappings
    ) {
      if (
        targetUserIds.has(
          mapping.targetUserId,
        )
      ) {
        throw new InvalidNutritionQuantityCopyMappingError(
          'A target user cannot receive more than one source quantity',
        );
      }

      targetUserIds.add(
        mapping.targetUserId,
      );
    }

    const targetEndDate =
      addDays(
        targetStartDate,
        6,
      );

    return unitOfWork.execute(
      async ({
        plans,
        planTargets,
        days,
        meals,
        mealItems,
      }) => {

        const sourcePlan =
          await plans.findById(
            input.sourcePlanId,
          );

        if (!sourcePlan) {
          throw new NutritionCopyWeekSourcePlanNotFoundError(
            'Source Nutrition plan not found',
          );
        }

        const existingPlans =
          await plans.list();

        if (
          existingPlans.some(
            plan =>
              plan.startDate ===
              input.targetWeekStart,
          )
        ) {
          throw new NutritionCopyTargetWeekAlreadyExistsError(
            'A Nutrition plan already exists for the target week',
          );
        }

        const sourceDays =
          [
            ...await days.listForPlan(
              sourcePlan.id,
            ),
          ].sort(
            (
              a,
              b,
            ) =>
              a.date.localeCompare(
                b.date,
              ),
          );

        if (
          sourceDays.length !==
          7
        ) {
          throw new NutritionCopySourceWeekInvalidError(
            'Source Nutrition plan must contain exactly seven days',
          );
        }

        const targetPlan =
          await plans.create({
            title,

            startDate:
              formatDate(
                targetStartDate,
              ),

            endDate:
              formatDate(
                targetEndDate,
              ),

            status:
              'DRAFT',

            createdByUserId:
              input.createdByUserId,
          });

        const createdDays =
          await days.createMany(
            sourceDays.map(
              (
                sourceDay,
                index,
              ) => ({
                planId:
                  targetPlan.id,

                date:
                  formatDate(
                    addDays(
                      targetStartDate,
                      index,
                    ),
                  ),

                notes:
                  sourceDay.notes,
              }),
            ),
          );

        const sortedCreatedDays =
          [
            ...createdDays,
          ].sort(
            (
              a,
              b,
            ) =>
              a.date.localeCompare(
                b.date,
              ),
          );

        if (
          sortedCreatedDays.length !==
          7
        ) {
          throw new NutritionCopySourceWeekInvalidError(
            'Target Nutrition plan did not create exactly seven days',
          );
        }

        const createdMeals:
          NutritionMeal[] = [];

        const createdItems:
          NutritionMealItem[] = [];

        for (
          let dayIndex =
            0;
          dayIndex <
          sourceDays.length;
          dayIndex +=
            1
        ) {
          const sourceDay =
            sourceDays[
              dayIndex
            ];

          const targetDay =
            sortedCreatedDays[
              dayIndex
            ];

          if (
            !sourceDay ||
            !targetDay
          ) {
            throw new NutritionCopySourceWeekInvalidError(
              'Nutrition week day mapping failed',
            );
          }

          const sourceMeals =
            [
              ...await meals.listForDay(
                sourceDay.id,
              ),
            ].sort(
              (
                a,
                b,
              ) =>
                a.position -
                b.position,
            );

          for (
            const sourceMeal of
            sourceMeals
          ) {
            const targetMeal =
              await meals.create({
                dayId:
                  targetDay.id,

                name:
                  sourceMeal.name,

                plannedTime:
                  sourceMeal.plannedTime,

                position:
                  sourceMeal.position,

                notes:
                  sourceMeal.notes,
              });

            createdMeals.push(
              targetMeal,
            );

            const sourceItems =
              [
                ...await mealItems
                  .listDetailsForMeal(
                    sourceMeal.id,
                  ),
              ].sort(
                (
                  a,
                  b,
                ) =>
                  a.item.position -
                  b.item.position,
              );

            for (
              const sourceDetail of
              sourceItems
            ) {
              const targetItem =
                await mealItems.create({
                  mealId:
                    targetMeal.id,

                  foodId:
                    sourceDetail.item
                      .foodId,

                  preparationConversionId:
                    sourceDetail.item
                      .preparationConversionId,

                  foodSnapshot:
                    sourceDetail.item
                      .foodSnapshot,

                  position:
                    sourceDetail.item
                      .position,

                  notes:
                    sourceDetail.item
                      .notes,
                });

              createdItems.push(
                targetItem,
              );

              const quantitiesToSave =
                input.quantityMappings
                  .map(
                    mapping => {

                      const sourceQuantity =
                        sourceDetail
                          .quantities
                          .find(
                            quantity =>
                              quantity.userId ===
                              mapping.sourceUserId,
                          );

                      if (
                        !sourceQuantity
                      ) {
                        return null;
                      }

                      return {
                        mealItemId:
                          targetItem.id,

                        userId:
                          mapping.targetUserId,

                        quantity:
                          sourceQuantity.quantity,
                      };
                    },
                  )
                  .filter(
                    (
                      quantity,
                    ): quantity is {
                      mealItemId:
                        NutritionMealItem['id'];

                      userId:
                        DkturboUserId;

                      quantity:
                        number;
                    } =>
                      quantity !==
                      null,
                  );

              if (
                quantitiesToSave.length >
                0
              ) {
                await mealItems
                  .saveQuantities(
                    quantitiesToSave,
                  );
              }
            }
          }
        }

        const sourceTargets =
          await planTargets
            .listForPlan(
              sourcePlan.id,
            );

        const createdTargets:
          NutritionPlanTarget[] = [];

        for (
          const mapping of
          input.quantityMappings
        ) {
          const sourceTarget =
            sourceTargets.find(
              target =>
                target.userId ===
                mapping.sourceUserId,
            );

          if (!sourceTarget) {
            continue;
          }

          const target =
            await planTargets.save({
              planId:
                targetPlan.id,

              userId:
                mapping.targetUserId,

              caloriesKcal:
                sourceTarget
                  .caloriesKcal,

              proteinG:
                sourceTarget
                  .proteinG,

              carbohydratesG:
                sourceTarget
                  .carbohydratesG,

              fatG:
                sourceTarget
                  .fatG,

              fiberG:
                sourceTarget
                  .fiberG,
            });

          createdTargets.push(
            target,
          );
        }

        return {
          sourcePlan,
          targetPlan,
          createdDays:
            sortedCreatedDays,
          createdMeals,
          createdItems,
          createdTargets,
        };
      },
    );
  };

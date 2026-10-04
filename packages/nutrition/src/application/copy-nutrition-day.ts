import type {
  DkturboUserId,
  NutritionDay,
  NutritionDayId,
  NutritionMeal,
  NutritionMealItem,
  NutritionPlanId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

export interface NutritionQuantityCopyMapping {
  sourceUserId:
    DkturboUserId;

  targetUserId:
    DkturboUserId;
}

export interface CopyNutritionDayInput {
  sourcePlanId:
    NutritionPlanId;

  sourceDayId:
    NutritionDayId;

  targetPlanId:
    NutritionPlanId;

  targetDayId:
    NutritionDayId;

  quantityMappings:
    NutritionQuantityCopyMapping[];
}

export interface CopyNutritionDayResult {
  sourceDay:
    NutritionDay;

  targetDay:
    NutritionDay;

  createdMeals:
    NutritionMeal[];

  createdItems:
    NutritionMealItem[];
}

export class NutritionCopyPlanNotFoundError
extends Error {}

export class NutritionCopyDayNotFoundError
extends Error {}

export class NutritionCopySameDayError
extends Error {}

export class NutritionCopySourceDayEmptyError
extends Error {}

export class NutritionCopyTargetDayNotEmptyError
extends Error {}

export class InvalidNutritionQuantityCopyMappingError
extends Error {}

export const copyNutritionDay =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      CopyNutritionDayInput,
  ): Promise<CopyNutritionDayResult> => {

    if (
      input.sourceDayId ===
      input.targetDayId
    ) {
      throw new NutritionCopySameDayError(
        'Source and target Nutrition days must be different',
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

    return unitOfWork.execute(
      async ({
        plans,
        days,
        meals,
        mealItems,
      }) => {

        const [
          sourcePlan,
          targetPlan,
        ] =
          await Promise.all([
            plans.findById(
              input.sourcePlanId,
            ),

            plans.findById(
              input.targetPlanId,
            ),
          ]);

        if (
          !sourcePlan ||
          !targetPlan
        ) {
          throw new NutritionCopyPlanNotFoundError(
            'Nutrition plan not found',
          );
        }

        const [
          sourcePlanDays,
          targetPlanDays,
        ] =
          input.sourcePlanId ===
          input.targetPlanId
            ? await days
                .listForPlan(
                  input.sourcePlanId,
                )
                .then(
                  planDays => [
                    planDays,
                    planDays,
                  ] as const,
                )
            : await Promise.all([
                days.listForPlan(
                  input.sourcePlanId,
                ),

                days.listForPlan(
                  input.targetPlanId,
                ),
              ]);

        const sourceDay =
          sourcePlanDays.find(
            day =>
              day.id ===
              input.sourceDayId,
          );

        const targetDay =
          targetPlanDays.find(
            day =>
              day.id ===
              input.targetDayId,
          );

        if (
          !sourceDay ||
          !targetDay
        ) {
          throw new NutritionCopyDayNotFoundError(
            'Nutrition day not found in its declared plan',
          );
        }

        const [
          sourceMeals,
          targetMeals,
        ] =
          await Promise.all([
            meals.listForDay(
              sourceDay.id,
            ),

            meals.listForDay(
              targetDay.id,
            ),
          ]);

        if (
          sourceMeals.length ===
          0
        ) {
          throw new NutritionCopySourceDayEmptyError(
            'Source Nutrition day is empty',
          );
        }

        if (
          targetMeals.length >
          0
        ) {
          throw new NutritionCopyTargetDayNotEmptyError(
            'Target Nutrition day is not empty',
          );
        }

        const createdMeals:
          NutritionMeal[] = [];

        const createdItems:
          NutritionMealItem[] = [];

        for (
          const sourceMeal of
          [...sourceMeals].sort(
            (a, b) =>
              a.position -
              b.position,
          )
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
            await mealItems
              .listDetailsForMeal(
                sourceMeal.id,
              );

          for (
            const sourceDetail of
            [...sourceItems].sort(
              (a, b) =>
                a.item.position -
                b.item.position,
            )
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
                      sourceDetail.quantities
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

        return {
          sourceDay,
          targetDay,
          createdMeals,
          createdItems,
        };
      },
    );
  };

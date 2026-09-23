import type {
  DkturboUserId,
  NutritionDayId,
  NutritionMealItemDetail,
  NutritionMealItemId,
  NutritionMealItemQuantity,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

export class NutritionMealItemActualItemNotFoundError
extends Error {}

export class NutritionMealItemActualMealNotFoundError
extends Error {}

export class NutritionMealItemActualPlannedQuantityNotFoundError
extends Error {}

export interface NutritionMealItemActualContext {
  detail:
    NutritionMealItemDetail;

  quantity:
    NutritionMealItemQuantity;

  dayId:
    NutritionDayId;
}

export const getMealItemActualContext =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input: {
      mealItemId:
        NutritionMealItemId;

      userId:
        DkturboUserId;
    },
  ): Promise<NutritionMealItemActualContext> =>
    unitOfWork.execute(
      async ({
        mealItems,
        meals,
      }) => {

        const item =
          await mealItems.findById(
            input.mealItemId,
          );

        if (!item) {
          throw new NutritionMealItemActualItemNotFoundError(
            'Nutrition meal item not found',
          );
        }

        const meal =
          await meals.findById(
            item.mealId,
          );

        if (!meal) {
          throw new NutritionMealItemActualMealNotFoundError(
            'Nutrition meal not found',
          );
        }

        const details =
          await mealItems
            .listDetailsForMeal(
              meal.id,
            );

        const detail =
          details.find(
            candidate =>
              candidate.item.id ===
              item.id,
          );

        if (!detail) {
          throw new NutritionMealItemActualItemNotFoundError(
            'Nutrition meal item detail not found',
          );
        }

        const quantity =
          detail.quantities.find(
            candidate =>
              candidate.userId ===
              input.userId,
          );

        if (!quantity) {
          throw new NutritionMealItemActualPlannedQuantityNotFoundError(
            'No planned quantity exists for this user',
          );
        }

        return {
          detail,
          quantity,
          dayId:
            meal.dayId,
        };
      },
    );

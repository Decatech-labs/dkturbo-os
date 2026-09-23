import type {
  DkturboUserId,
  NutritionMealItemActual,
  NutritionMealItemId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  getMealItemActualContext,
} from './meal-item-actual-context.js';

import {
  snapshotNutritionFood,
} from './food-snapshot.js';

export interface MarkMealItemSkippedInput {
  mealItemId:
    NutritionMealItemId;

  userId:
    DkturboUserId;

  notes:
    string | null;
}

export const markMealItemSkipped =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      MarkMealItemSkippedInput,
  ): Promise<NutritionMealItemActual> => {

    const context =
      await getMealItemActualContext(
        unitOfWork,
        input,
      );

    return unitOfWork.execute(
      async ({
        mealItemActuals,
      }) =>
        mealItemActuals.save({
          dayId:
            context.dayId,

          mealItemId:
            input.mealItemId,

          userId:
            input.userId,

          status:
            'SKIPPED',

          plannedFoodId:
            context.detail.food.id,

          plannedFoodSnapshot:
            snapshotNutritionFood(
              context.detail.food,
            ),

          plannedQuantity:
            context.quantity.quantity,

          actualFoodId:
            null,

          actualFoodSnapshot:
            null,

          actualQuantity:
            null,

          notes:
            input.notes?.trim() ||
            null,
        }),
    );
  };

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

export interface MarkMealItemEatenInput {
  mealItemId:
    NutritionMealItemId;

  userId:
    DkturboUserId;
}

export const markMealItemEaten =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      MarkMealItemEatenInput,
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
            'EATEN',

          plannedFoodId:
            context.detail.food.id,

          plannedFoodSnapshot:
            snapshotNutritionFood(
              context.detail.food,
            ),

          plannedQuantity:
            context.quantity.quantity,

          actualFoodId:
            context.detail.food.id,

          actualFoodSnapshot:
            snapshotNutritionFood(
              context.detail.food,
            ),

          actualQuantity:
            context.quantity.quantity,

          notes:
            null,
        }),
    );
  };

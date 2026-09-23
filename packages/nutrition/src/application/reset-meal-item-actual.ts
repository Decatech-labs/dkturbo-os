import type {
  DkturboUserId,
  NutritionMealItemId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  NutritionMealItemActualItemNotFoundError,
} from './meal-item-actual-context.js';

export interface ResetMealItemActualInput {
  mealItemId:
    NutritionMealItemId;

  userId:
    DkturboUserId;
}

export const resetMealItemActual =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      ResetMealItemActualInput,
  ): Promise<void> =>
    unitOfWork.execute(
      async ({
        mealItems,
        mealItemActuals,
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

        await mealItemActuals
          .deleteForItemAndUser(
            input.mealItemId,
            input.userId,
          );
      },
    );

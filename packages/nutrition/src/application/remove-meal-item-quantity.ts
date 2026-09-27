import type {
  DkturboUserId,
  NutritionMealItemId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  NutritionMealItemNotFoundError,
} from './move-meal-item.js';

export class NutritionMealItemQuantityNotFoundError
extends Error {}

export interface RemoveMealItemQuantityInput {
  mealItemId:
    NutritionMealItemId;

  userId:
    DkturboUserId;
}

export const removeMealItemQuantity =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      RemoveMealItemQuantityInput,
  ): Promise<void> =>
    unitOfWork.execute(
      async ({
        mealItems,
      }) => {

        const item =
          await mealItems.findById(
            input.mealItemId,
          );

        if (!item) {
          throw new NutritionMealItemNotFoundError(
            'Nutrition meal item not found',
          );
        }

        const deleted =
          await mealItems.deleteQuantity(
            input.mealItemId,
            input.userId,
          );

        if (!deleted) {
          throw new NutritionMealItemQuantityNotFoundError(
            'Nutrition meal item quantity not found',
          );
        }
      },
    );

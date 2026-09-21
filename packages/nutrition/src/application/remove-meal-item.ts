import type {
  NutritionMealItemId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  NutritionMealItemNotFoundError,
} from './move-meal-item.js';

export interface RemoveMealItemInput {
  mealItemId:
    NutritionMealItemId;
}

export const removeMealItem =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      RemoveMealItemInput,
  ): Promise<void> => {

    await unitOfWork.execute(
      async ({
        mealItems,
      }) => {

        const deleted =
          await mealItems.delete(
            input.mealItemId,
          );

        if (!deleted) {
          throw new NutritionMealItemNotFoundError(
            'Nutrition meal item not found',
          );
        }
      },
    );
  };

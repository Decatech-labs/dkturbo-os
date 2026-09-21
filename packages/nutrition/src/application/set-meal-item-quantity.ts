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

export interface SetMealItemQuantityInput {
  mealItemId:
    NutritionMealItemId;

  userId:
    DkturboUserId;

  quantity:
    number;
}

export class InvalidNutritionMealItemQuantityError
extends Error {}

export const setMealItemQuantity =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      SetMealItemQuantityInput,
  ): Promise<void> => {

    if (
      !Number.isFinite(
        input.quantity,
      ) ||
      input.quantity <
        0
    ) {
      throw new InvalidNutritionMealItemQuantityError(
        'Invalid Nutrition meal item quantity',
      );
    }

    await unitOfWork.execute(
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

        await mealItems.saveQuantities([
          {
            mealItemId:
              input.mealItemId,

            userId:
              input.userId,

            quantity:
              input.quantity,
          },
        ]);
      },
    );
  };

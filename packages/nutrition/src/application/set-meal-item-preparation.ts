import type {
  NutritionFoodPreparationConversionId,
  NutritionMealItemId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

export interface SetMealItemPreparationInput {
  mealItemId:
    NutritionMealItemId;

  preparationConversionId:
    NutritionFoodPreparationConversionId | null;
}

export class NutritionMealItemPreparationItemNotFoundError
extends Error {}

export class NutritionMealItemPreparationConversionNotFoundError
extends Error {}

export class NutritionMealItemPreparationFoodMismatchError
extends Error {}

export const setMealItemPreparation =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      SetMealItemPreparationInput,
  ): Promise<void> =>

    unitOfWork.execute(
      async ({
        mealItems,
        foodPreparationConversions,
      }) => {

        const item =
          await mealItems.findById(
            input.mealItemId,
          );

        if (!item) {
          throw new NutritionMealItemPreparationItemNotFoundError(
            'Nutrition meal item not found',
          );
        }

        if (
          input.preparationConversionId !==
          null
        ) {
          const conversion =
            await foodPreparationConversions.findById(
              input.preparationConversionId,
            );

          if (!conversion) {
            throw new NutritionMealItemPreparationConversionNotFoundError(
              'Food preparation conversion not found',
            );
          }

          if (
            conversion.foodId !==
            item.foodId
          ) {
            throw new NutritionMealItemPreparationFoodMismatchError(
              'Preparation conversion belongs to another food',
            );
          }
        }

        const updated =
          await mealItems.setPreparationConversion(
            input.mealItemId,
            input.preparationConversionId,
          );

        if (!updated) {
          throw new NutritionMealItemPreparationItemNotFoundError(
            'Nutrition meal item not found',
          );
        }
      },
    );

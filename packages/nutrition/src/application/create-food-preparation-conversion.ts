import type {
  NutritionFoodId,
  NutritionFoodPreparationConversion,
  NutritionUnit,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

export interface CreateFoodPreparationConversionInput {
  foodId:
    NutritionFoodId;

  name:
    string;

  rawAmount:
    number;

  preparedAmount:
    number;

  preparedUnit:
    NutritionUnit;

  isDefault:
    boolean;
}

export class InvalidFoodPreparationConversionError
extends Error {}

export class FoodPreparationConversionFoodNotFoundError
extends Error {}

const VALID_UNITS =
  new Set<NutritionUnit>([
    'G',
    'KG',
    'ML',
    'L',
    'UNIT',
  ]);

export const createFoodPreparationConversion =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      CreateFoodPreparationConversionInput,
  ): Promise<NutritionFoodPreparationConversion> => {

    const name =
      input.name.trim();

    if (
      name.length ===
        0 ||
      name.length >
        100
    ) {
      throw new InvalidFoodPreparationConversionError(
        'Invalid preparation conversion name',
      );
    }

    if (
      !Number.isFinite(
        input.rawAmount,
      ) ||
      input.rawAmount <=
        0 ||
      !Number.isFinite(
        input.preparedAmount,
      ) ||
      input.preparedAmount <=
        0
    ) {
      throw new InvalidFoodPreparationConversionError(
        'Invalid preparation conversion amounts',
      );
    }

    if (
      !VALID_UNITS.has(
        input.preparedUnit,
      )
    ) {
      throw new InvalidFoodPreparationConversionError(
        'Invalid prepared unit',
      );
    }

    return unitOfWork.execute(
      async ({
        foods,
        foodPreparationConversions,
      }) => {

        const food =
          await foods.findById(
            input.foodId,
          );

        if (!food) {
          throw new FoodPreparationConversionFoodNotFoundError(
            'Nutrition food not found',
          );
        }

        return foodPreparationConversions.create({
          foodId:
            input.foodId,

          name,

          rawAmount:
            input.rawAmount,

          preparedAmount:
            input.preparedAmount,

          preparedUnit:
            input.preparedUnit,

          isDefault:
            input.isDefault,
        });
      },
    );
  };

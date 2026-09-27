import type {
  NutritionFoodPreparationConversion,
  NutritionFoodPreparationConversionId,
  NutritionUnit,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  InvalidFoodPreparationConversionError,
} from './create-food-preparation-conversion.js';

export interface UpdateFoodPreparationConversionInput {
  conversionId:
    NutritionFoodPreparationConversionId;

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

export class FoodPreparationConversionNotFoundError
extends Error {}

const VALID_UNITS =
  new Set<NutritionUnit>([
    'G',
    'KG',
    'ML',
    'L',
    'UNIT',
  ]);

export const updateFoodPreparationConversion =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      UpdateFoodPreparationConversionInput,
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
        foodPreparationConversions,
      }) => {

        const updated =
          await foodPreparationConversions.update({
            conversionId:
              input.conversionId,

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

        if (!updated) {
          throw new FoodPreparationConversionNotFoundError(
            'Food preparation conversion not found',
          );
        }

        return updated;
      },
    );
  };

import type {
  NutritionFood,
  NutritionFoodCategory,
  NutritionFoodId,
  NutritionUnit,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  NutritionFoodNotFoundError,
} from './add-food-to-meal.js';

import {
  InvalidNutritionFoodError,
} from './create-food.js';

export interface UpdateFoodInput {
  foodId:
    NutritionFoodId;

  name:
    string;

  brand:
    string | null;

  category:
    NutritionFoodCategory;

  referenceAmount:
    number;

  referenceUnit:
    NutritionUnit;

  caloriesKcal:
    number;

  proteinG:
    number;

  carbohydratesG:
    number;

  fatG:
    number;

  fiberG:
    number | null;
}

const VALID_UNITS =
  new Set<NutritionUnit>([
    'G',
    'KG',
    'ML',
    'L',
    'UNIT',
  ]);

const isNonNegativeFinite =
  (
    value:
      number,
  ): boolean =>
    Number.isFinite(
      value,
    ) &&
    value >=
      0;

export const updateFood =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      UpdateFoodInput,
  ): Promise<NutritionFood> => {

    const name =
      input.name.trim();

    const brand =
      input.brand
        ?.trim() ||
      null;

    if (
      name.length ===
        0 ||
      name.length >
        200
    ) {
      throw new InvalidNutritionFoodError(
        'Invalid food name',
      );
    }

    if (
      !Number.isFinite(
        input.referenceAmount,
      ) ||
      input.referenceAmount <=
        0
    ) {
      throw new InvalidNutritionFoodError(
        'Invalid reference amount',
      );
    }

    if (
      !VALID_UNITS.has(
        input.referenceUnit,
      )
    ) {
      throw new InvalidNutritionFoodError(
        'Invalid nutrition unit',
      );
    }

    if (
      !isNonNegativeFinite(
        input.caloriesKcal,
      ) ||
      !isNonNegativeFinite(
        input.proteinG,
      ) ||
      !isNonNegativeFinite(
        input.carbohydratesG,
      ) ||
      !isNonNegativeFinite(
        input.fatG,
      ) ||
      (
        input.fiberG !==
          null &&
        !isNonNegativeFinite(
          input.fiberG,
        )
      )
    ) {
      throw new InvalidNutritionFoodError(
        'Invalid nutrition values',
      );
    }

    return unitOfWork.execute(
      async ({
        foods,
      }) => {

        const updated =
          await foods.update({
            foodId:
              input.foodId,

            name,

            brand,

            category:
              input.category,

            referenceAmount:
              input.referenceAmount,

            referenceUnit:
              input.referenceUnit,

            caloriesKcal:
              input.caloriesKcal,

            proteinG:
              input.proteinG,

            carbohydratesG:
              input.carbohydratesG,

            fatG:
              input.fatG,

            fiberG:
              input.fiberG,
          });

        if (!updated) {
          throw new NutritionFoodNotFoundError(
            'Nutrition food not found',
          );
        }

        return updated;
      },
    );
  };

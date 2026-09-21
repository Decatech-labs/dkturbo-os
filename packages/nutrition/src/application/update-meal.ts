import type {
  NutritionMeal,
  NutritionMealId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  InvalidNutritionMealError,
} from './create-meal.js';

import {
  NutritionMealNotFoundError,
} from './add-food-to-meal.js';

export interface UpdateMealInput {
  mealId:
    NutritionMealId;

  name?:
    string;

  plannedTime?:
    string | null;

  position?:
    number;

  notes?:
    string | null;
}

const TIME_PATTERN =
  /^([01]\d|2[0-3]):[0-5]\d$/;

export const updateMeal =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      UpdateMealInput,
  ): Promise<NutritionMeal> => {

    return unitOfWork.execute(
      async ({
        meals,
      }) => {

        const current =
          await meals.findById(
            input.mealId,
          );

        if (!current) {
          throw new NutritionMealNotFoundError(
            'Nutrition meal not found',
          );
        }

        const name =
          input.name ===
          undefined
            ? current.name
            : input.name.trim();

        if (
          name.length ===
            0 ||
          name.length >
            120
        ) {
          throw new InvalidNutritionMealError(
            'Invalid meal name',
          );
        }

        const plannedTime =
          input.plannedTime ===
          undefined
            ? current.plannedTime
            : input.plannedTime;

        if (
          plannedTime !==
            null &&
          !TIME_PATTERN.test(
            plannedTime,
          )
        ) {
          throw new InvalidNutritionMealError(
            'Invalid meal time',
          );
        }

        const position =
          input.position ===
          undefined
            ? current.position
            : input.position;

        if (
          !Number.isInteger(
            position,
          ) ||
          position <
            0
        ) {
          throw new InvalidNutritionMealError(
            'Invalid meal position',
          );
        }

        const notes =
          input.notes ===
          undefined
            ? current.notes
            : input.notes
                ?.trim() ||
              null;

        const updated =
          await meals.update({
            mealId:
              input.mealId,

            name,

            plannedTime,

            position,

            notes,
          });

        if (!updated) {
          throw new NutritionMealNotFoundError(
            'Nutrition meal not found',
          );
        }

        return updated;
      },
    );
  };

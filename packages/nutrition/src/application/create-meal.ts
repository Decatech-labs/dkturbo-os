import type {
  NutritionDayId,
  NutritionMeal,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

export interface CreateMealInput {
  dayId:
    NutritionDayId;

  name:
    string;

  plannedTime:
    string | null;

  position:
    number;

  notes:
    string | null;
}

export class InvalidNutritionMealError
extends Error {}

const TIME_PATTERN =
  /^([01]\d|2[0-3]):[0-5]\d$/;

export const createMeal =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      CreateMealInput,
  ): Promise<NutritionMeal> => {

    const name =
      input.name.trim();

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

    if (
      input.plannedTime !==
        null &&
      !TIME_PATTERN.test(
        input.plannedTime,
      )
    ) {
      throw new InvalidNutritionMealError(
        'Invalid meal time',
      );
    }

    if (
      !Number.isInteger(
        input.position,
      ) ||
      input.position <
        0
    ) {
      throw new InvalidNutritionMealError(
        'Invalid meal position',
      );
    }

    const notes =
      input.notes
        ?.trim() ||
      null;

    return unitOfWork.execute(
      async ({
        meals,
      }) =>
        meals.create({
          dayId:
            input.dayId,

          name,

          plannedTime:
            input.plannedTime,

          position:
            input.position,

          notes,
        }),
    );
  };

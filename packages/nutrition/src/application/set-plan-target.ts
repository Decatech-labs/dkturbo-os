import type {
  DkturboUserId,
  NutritionPlanId,
  NutritionPlanTarget,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

export interface SetPlanTargetInput {
  planId:
    NutritionPlanId;

  userId:
    DkturboUserId;

  caloriesKcal:
    number | null;

  proteinG:
    number | null;

  carbohydratesG:
    number | null;

  fatG:
    number | null;

  fiberG:
    number | null;
}

export class InvalidNutritionTargetError
extends Error {}

export class NutritionPlanNotFoundError
extends Error {}

const validateOptionalNumber =
  (
    value:
      number | null,
  ): boolean =>
    value ===
      null ||
    (
      Number.isFinite(
        value,
      ) &&
      value >=
        0
    );

export const setPlanTarget =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      SetPlanTargetInput,
  ): Promise<NutritionPlanTarget> => {

    if (
      !validateOptionalNumber(
        input.caloriesKcal,
      ) ||
      !validateOptionalNumber(
        input.proteinG,
      ) ||
      !validateOptionalNumber(
        input.carbohydratesG,
      ) ||
      !validateOptionalNumber(
        input.fatG,
      ) ||
      !validateOptionalNumber(
        input.fiberG,
      )
    ) {
      throw new InvalidNutritionTargetError(
        'Nutrition targets must be finite non-negative values',
      );
    }

    return unitOfWork.execute(
      async ({
        plans,
        planTargets,
      }) => {

        const plan =
          await plans.findById(
            input.planId,
          );

        if (!plan) {
          throw new NutritionPlanNotFoundError(
            'Nutrition plan not found',
          );
        }

        return planTargets.save({
          planId:
            input.planId,

          userId:
            input.userId,

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
      },
    );
  };

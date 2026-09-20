import type {
  DkturboUserId,
  NutritionMealItemDetail,
  NutritionMealUserTotals,
  NutritionNutrients,
} from '../domain/index.js';

export const emptyNutrients =
  (): NutritionNutrients => ({
    caloriesKcal:
      0,

    proteinG:
      0,

    carbohydratesG:
      0,

    fatG:
      0,

    fiberG:
      0,
  });

export const roundNutrients =
  (
    nutrients:
      NutritionNutrients,
  ): NutritionNutrients => {

    const round =
      (
        value:
          number,
      ): number =>
        Math.round(
          value * 100,
        ) / 100;

    return {
      caloriesKcal:
        round(
          nutrients.caloriesKcal,
        ),

      proteinG:
        round(
          nutrients.proteinG,
        ),

      carbohydratesG:
        round(
          nutrients.carbohydratesG,
        ),

      fatG:
        round(
          nutrients.fatG,
        ),

      fiberG:
        round(
          nutrients.fiberG,
        ),
    };
  };

export const addNutrients =
  (
    current:
      NutritionNutrients,

    addition:
      NutritionNutrients,
  ): NutritionNutrients => ({
    caloriesKcal:
      current.caloriesKcal +
      addition.caloriesKcal,

    proteinG:
      current.proteinG +
      addition.proteinG,

    carbohydratesG:
      current.carbohydratesG +
      addition.carbohydratesG,

    fatG:
      current.fatG +
      addition.fatG,

    fiberG:
      current.fiberG +
      addition.fiberG,
  });

export const calculateMealTotalsByUser =
  (
    items:
      NutritionMealItemDetail[],
  ): NutritionMealUserTotals[] => {

    const totals =
      new Map<
        DkturboUserId,
        NutritionNutrients
      >();

    for (
      const {
        food,
        quantities,
      } of items
    ) {
      for (
        const quantity of
          quantities
      ) {
        const factor =
          quantity.quantity /
          food.referenceAmount;

        const current =
          totals.get(
            quantity.userId,
          ) ??
          emptyNutrients();

        totals.set(
          quantity.userId,
          addNutrients(
            current,
            {
              caloriesKcal:
                food.caloriesKcal *
                factor,

              proteinG:
                food.proteinG *
                factor,

              carbohydratesG:
                food.carbohydratesG *
                factor,

              fatG:
                food.fatG *
                factor,

              fiberG:
                (
                  food.fiberG ??
                  0
                ) *
                factor,
            },
          ),
        );
      }
    }

    return Array.from(
      totals.entries(),
    ).map(
      ([
        userId,
        nutrients,
      ]) => ({
        userId,

        nutrients:
          roundNutrients(
            nutrients,
          ),
      }),
    );
  };

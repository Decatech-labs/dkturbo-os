import type {
  HttpRouteRegistrationContext,
} from '@dkturbo/control-plane';

import {
  createWeeklyPlan,
  getWeeklyPlanDetail,
  InvalidNutritionTargetError,
  InvalidWeeklyNutritionPlanError,
  NutritionPlanNotFoundError,
  NutritionPlanNotFoundForDetailError,
  setPlanTarget,
  addFoodToMeal,
  createFood,
  createMeal,
  updateMeal,
  deleteMeal,
  InvalidMealFoodError,
  InvalidNutritionFoodError,
  InvalidNutritionMealError,
  NutritionFoodNotFoundError,
  NutritionMealNotFoundError,
  moveMealItem,
  removeMealItem,
  setMealItemQuantity,
  InvalidNutritionMealItemMoveError,
  InvalidNutritionMealItemQuantityError,
  NutritionMealItemNotFoundError,
  archiveFood,
  updateFood,
  type DkturboUserId,
  type Nutrition,
  type NutritionPlanId,
  type NutritionDayId,
  type NutritionFoodId,
  type NutritionMealId,
  type NutritionUnit,
  type NutritionMealItemId,
  type NutritionFoodCategory,
} from '@dkturbo/nutrition';

export interface NutritionPerson {
  id:
    string;

  name:
    string;
}

export interface RegisterNutritionRoutesOptions {
  http:
    HttpRouteRegistrationContext;

  nutrition:
    Nutrition;

  listPeople:
    () => Promise<
      NutritionPerson[]
    >;
}

interface PlanParams {
  planId:
    string;
}

interface TargetParams {
  planId:
    string;

  userId:
    string;
}

interface MealItemParams {
  mealItemId:
    string;
}

interface MealItemQuantityParams {
  mealItemId:
    string;

  userId:
    string;
}

interface SetMealItemQuantityBody {
  quantity:
    number;
}

interface MoveMealItemBody {
  targetMealId:
    string;

  targetPosition:
    number;
}

interface CreatePlanBody {
  title:
    string;

  weekStart:
    string;
}

interface SetPlanTargetBody {
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

interface DayParams {
  dayId:
    string;
}

interface MealParams {
  mealId:
    string;
}

interface FoodParams {
  foodId:
    string;
}

interface FoodSearchQuery {
  query:
    string;

  category:
    NutritionFoodCategory | null;
}

interface CreateMealBody {
  name:
    string;

  plannedTime:
    string | null;

  position:
    number;

  notes:
    string | null;
}

interface UpdateMealBody {
  name?:
    string;

  plannedTime?:
    string | null;

  position?:
    number;

  notes?:
    string | null;
}

interface CreateFoodBody {
  name:
    string;

  brand:
    string | null;

  category:
    NutritionFoodCategory | null;

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

interface UpdateFoodBody {
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

interface AddFoodToMealBody {
  foodId:
    string;

  position:
    number;

  notes:
    string | null;

  quantities:
    {
      userId:
        string;

      quantity:
        number;
    }[];
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid =
  (
    value:
      unknown,
  ): value is string =>
    typeof value ===
      'string' &&
    uuidPattern.test(
      value,
    );

const parsePlanParams =
  (
    value:
      unknown,
  ): PlanParams | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      !isUuid(
        candidate.planId,
      )
    ) {
      return null;
    }

    return {
      planId:
        candidate.planId,
    };
  };

const parseTargetParams =
  (
    value:
      unknown,
  ): TargetParams | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      !isUuid(
        candidate.planId,
      ) ||
      !isUuid(
        candidate.userId,
      )
    ) {
      return null;
    }

    return {
      planId:
        candidate.planId,

      userId:
        candidate.userId,
    };
  };

const parseCreatePlanBody =
  (
    value:
      unknown,
  ): CreatePlanBody | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      typeof candidate.title !==
        'string' ||
      typeof candidate.weekStart !==
        'string'
    ) {
      return null;
    }

    return {
      title:
        candidate.title,

      weekStart:
        candidate.weekStart,
    };
  };

const parseNullableNumber =
  (
    value:
      unknown,
  ): number | null | undefined => {

    if (
      value ===
        null
    ) {
      return null;
    }

    if (
      typeof value ===
        'number' &&
      Number.isFinite(
        value,
      )
    ) {
      return value;
    }

    return undefined;
  };

const parseSetPlanTargetBody =
  (
    value:
      unknown,
  ): SetPlanTargetBody | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    const caloriesKcal =
      parseNullableNumber(
        candidate.caloriesKcal,
      );

    const proteinG =
      parseNullableNumber(
        candidate.proteinG,
      );

    const carbohydratesG =
      parseNullableNumber(
        candidate.carbohydratesG,
      );

    const fatG =
      parseNullableNumber(
        candidate.fatG,
      );

    const fiberG =
      parseNullableNumber(
        candidate.fiberG,
      );

    if (
      caloriesKcal ===
        undefined ||
      proteinG ===
        undefined ||
      carbohydratesG ===
        undefined ||
      fatG ===
        undefined ||
      fiberG ===
        undefined
    ) {
      return null;
    }

    return {
      caloriesKcal,
      proteinG,
      carbohydratesG,
      fatG,
      fiberG,
    };
  };

const parseDayParams =
  (
    value:
      unknown,
  ): DayParams | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      !isUuid(
        candidate.dayId,
      )
    ) {
      return null;
    }

    return {
      dayId:
        candidate.dayId,
    };
  };

const parseMealParams =
  (
    value:
      unknown,
  ): MealParams | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      !isUuid(
        candidate.mealId,
      )
    ) {
      return null;
    }

    return {
      mealId:
        candidate.mealId,
    };
  };

const parseMealItemParams =
  (
    value:
      unknown,
  ): MealItemParams | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      !isUuid(
        candidate.mealItemId,
      )
    ) {
      return null;
    }

    return {
      mealItemId:
        candidate.mealItemId,
    };
  };

const parseMealItemQuantityParams =
  (
    value:
      unknown,
  ): MealItemQuantityParams | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      !isUuid(
        candidate.mealItemId,
      ) ||
      !isUuid(
        candidate.userId,
      )
    ) {
      return null;
    }

    return {
      mealItemId:
        candidate.mealItemId,

      userId:
        candidate.userId,
    };
  };

const parseFoodSearchQuery =
  (
    value:
      unknown,
  ): FoodSearchQuery | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return {
        query:
          '',

        category:
          null,
      };
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    const query =
      candidate.query ===
        undefined
        ? ''
        : candidate.query;

    if (
      typeof query !==
      'string'
    ) {
      return null;
    }

    const category =
      candidate.category ===
        undefined ||
      candidate.category ===
        ''
        ? null
        : candidate.category;

    if (
      category !==
        null &&
      (
        typeof category !==
          'string' ||
        !nutritionFoodCategories.has(
          category as
            NutritionFoodCategory,
        )
      )
    ) {
      return null;
    }

    return {
      query,

      category:
        category as
          NutritionFoodCategory | null,
    };
  };

const parseNullableString =
  (
    value:
      unknown,
  ): string | null | undefined => {

    if (
      value ===
        null
    ) {
      return null;
    }

    if (
      typeof value ===
        'string'
    ) {
      return value;
    }

    return undefined;
  };

const parseCreateMealBody =
  (
    value:
      unknown,
  ): CreateMealBody | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    const plannedTime =
      parseNullableString(
        candidate.plannedTime,
      );

    const notes =
      parseNullableString(
        candidate.notes,
      );

    if (
      typeof candidate.name !==
        'string' ||
      plannedTime ===
        undefined ||
      typeof candidate.position !==
        'number' ||
      notes ===
        undefined
    ) {
      return null;
    }

    return {
      name:
        candidate.name,

      plannedTime,

      position:
        candidate.position,

      notes,
    };
  };

const parseUpdateMealBody =
  (
    value:
      unknown,
  ): UpdateMealBody | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    const hasName =
      candidate.name !==
      undefined;

    const hasPlannedTime =
      candidate.plannedTime !==
      undefined;

    const hasPosition =
      candidate.position !==
      undefined;

    const hasNotes =
      candidate.notes !==
      undefined;

    if (
      !hasName &&
      !hasPlannedTime &&
      !hasPosition &&
      !hasNotes
    ) {
      return null;
    }

    if (
      hasName &&
      typeof candidate.name !==
        'string'
    ) {
      return null;
    }

    const plannedTime =
      hasPlannedTime
        ? parseNullableString(
            candidate.plannedTime,
          )
        : undefined;

    if (
      hasPlannedTime &&
      plannedTime ===
        undefined
    ) {
      return null;
    }

    if (
      hasPosition &&
      (
        typeof candidate.position !==
          'number' ||
        !Number.isInteger(
          candidate.position,
        )
      )
    ) {
      return null;
    }

    const notes =
      hasNotes
        ? parseNullableString(
            candidate.notes,
          )
        : undefined;

    if (
      hasNotes &&
      notes ===
        undefined
    ) {
      return null;
    }

    return {
      ...(hasName
        ? {
            name:
              candidate.name as
                string,
          }
        : {}),

      ...(hasPlannedTime
        ? {
            plannedTime:
              plannedTime!,
          }
        : {}),

      ...(hasPosition
        ? {
            position:
              candidate.position as
                number,
          }
        : {}),

      ...(hasNotes
        ? {
            notes:
              notes!,
          }
        : {}),
    };
  };

const nutritionFoodCategories =
  new Set<
    NutritionFoodCategory
  >([
    'CEREALS',
    'PASTA',
    'RICE',
    'BREAD',
    'TUBERS',
    'MEAT',
    'FISH',
    'EGGS',
    'DAIRY',
    'LEGUMES',
    'FRUIT',
    'VEGETABLES',
    'NUTS_SEEDS',
    'FATS_OILS',
    'BEVERAGES',
    'SUPPLEMENTS',
    'OTHER',
  ]);

const nutritionUnits =
  new Set<NutritionUnit>([
    'G',
    'KG',
    'ML',
    'L',
    'UNIT',
  ]);

const parseCreateFoodBody =
  (
    value:
      unknown,
  ): CreateFoodBody | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    const brand =
      parseNullableString(
        candidate.brand,
      );

    const fiberG =
      parseNullableNumber(
        candidate.fiberG,
      );

    const category =
      candidate.category ===
        undefined ||
      candidate.category ===
        null
        ? null
        : candidate.category;

    if (
      typeof candidate.name !==
        'string' ||
      brand ===
        undefined ||
      (
        category !==
          null &&
        (
          typeof category !==
            'string' ||
          !nutritionFoodCategories.has(
            category as
              NutritionFoodCategory,
          )
        )
      ) ||
      typeof candidate.referenceAmount !==
        'number' ||
      typeof candidate.referenceUnit !==
        'string' ||
      !nutritionUnits.has(
        candidate.referenceUnit as
          NutritionUnit,
      ) ||
      typeof candidate.caloriesKcal !==
        'number' ||
      typeof candidate.proteinG !==
        'number' ||
      typeof candidate.carbohydratesG !==
        'number' ||
      typeof candidate.fatG !==
        'number' ||
      fiberG ===
        undefined
    ) {
      return null;
    }

    return {
      name:
        candidate.name,

      brand,

      category:
        category as
          NutritionFoodCategory | null,

      referenceAmount:
        candidate.referenceAmount,

      referenceUnit:
        candidate.referenceUnit as
          NutritionUnit,

      caloriesKcal:
        candidate.caloriesKcal,

      proteinG:
        candidate.proteinG,

      carbohydratesG:
        candidate.carbohydratesG,

      fatG:
        candidate.fatG,

      fiberG,
    };
  };

const parseUpdateFoodBody =
  (
    value:
      unknown,
  ): UpdateFoodBody | null => {

    if (
      !value ||
      typeof value !==
        'object'
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      typeof candidate.name !==
        'string' ||
      !(
        candidate.brand ===
          null ||
        typeof candidate.brand ===
          'string'
      ) ||
      typeof candidate.category !==
        'string' ||
      !nutritionFoodCategories.has(
        candidate.category as
          NutritionFoodCategory,
      ) ||
      typeof candidate.referenceAmount !==
        'number' ||
      typeof candidate.referenceUnit !==
        'string' ||
      !nutritionUnits.has(
        candidate.referenceUnit as
          NutritionUnit,
      ) ||
      typeof candidate.caloriesKcal !==
        'number' ||
      typeof candidate.proteinG !==
        'number' ||
      typeof candidate.carbohydratesG !==
        'number' ||
      typeof candidate.fatG !==
        'number' ||
      !(
        candidate.fiberG ===
          null ||
        typeof candidate.fiberG ===
          'number'
      )
    ) {
      return null;
    }

    return {
      name:
        candidate.name,

      brand:
        candidate.brand,

      category:
        candidate.category as
          NutritionFoodCategory,

      referenceAmount:
        candidate.referenceAmount,

      referenceUnit:
        candidate.referenceUnit as
          NutritionUnit,

      caloriesKcal:
        candidate.caloriesKcal,

      proteinG:
        candidate.proteinG,

      carbohydratesG:
        candidate.carbohydratesG,

      fatG:
        candidate.fatG,

      fiberG:
        candidate.fiberG,
    };
  };

const parseAddFoodToMealBody =
  (
    value:
      unknown,
  ): AddFoodToMealBody | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    const notes =
      parseNullableString(
        candidate.notes,
      );

    if (
      !isUuid(
        candidate.foodId,
      ) ||
      typeof candidate.position !==
        'number' ||
      notes ===
        undefined ||
      !Array.isArray(
        candidate.quantities,
      )
    ) {
      return null;
    }

    const quantities:
      AddFoodToMealBody['quantities'] =
        [];

    for (
      const value of
      candidate.quantities
    ) {
      if (
        typeof value !==
          'object' ||
        value ===
          null
      ) {
        return null;
      }

      const quantity =
        value as
          Record<
            string,
            unknown
          >;

      if (
        !isUuid(
          quantity.userId,
        ) ||
        typeof quantity.quantity !==
          'number'
      ) {
        return null;
      }

      quantities.push({
        userId:
          quantity.userId,

        quantity:
          quantity.quantity,
      });
    }

    return {
      foodId:
        candidate.foodId,

      position:
        candidate.position,

      notes,

      quantities,
    };
  };

const parseSetMealItemQuantityBody =
  (
    value:
      unknown,
  ): SetMealItemQuantityBody | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      typeof candidate.quantity !==
        'number' ||
      !Number.isFinite(
        candidate.quantity,
      )
    ) {
      return null;
    }

    return {
      quantity:
        candidate.quantity,
    };
  };

const parseMoveMealItemBody =
  (
    value:
      unknown,
  ): MoveMealItemBody | null => {

    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      !isUuid(
        candidate.targetMealId,
      ) ||
      typeof candidate.targetPosition !==
        'number' ||
      !Number.isInteger(
        candidate.targetPosition,
      )
    ) {
      return null;
    }

    return {
      targetMealId:
        candidate.targetMealId,

      targetPosition:
        candidate.targetPosition,
    };
  };

export const registerNutritionRoutes =
  ({
    http,
    nutrition,
    listPeople,
  }: RegisterNutritionRoutesOptions):
    void => {

    const {
      app,
      requireAccessPermission,
    } = http;

    /*
     * Shared family Nutrition space.
     *
     * app.nutrition.access grants access to the
     * household Nutrition domain. V1 intentionally
     * does not use per-plan privacy.
     */

    app.get(
      '/api/nutrition/people',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        return listPeople();
      },
    );

    app.get(
      '/api/nutrition/foods',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const query =
          parseFoodSearchQuery(
            request.query,
          );

        if (!query) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        return nutrition
          .unitOfWork
          .execute(
            ({
              foods,
            }) =>
              foods.searchActive(
                query.query,
                query.category,
              )
          );
      },
    );

    app.patch<{
      Params:
        FoodParams;

      Body:
        UpdateFoodBody;
    }>(
      '/api/nutrition/foods/:foodId',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        if (
          !isUuid(
            request.params
              .foodId,
          )
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        const body =
          parseUpdateFoodBody(
            request.body,
          );

        if (!body) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {

          const food =
            await updateFood(
              nutrition.unitOfWork,
              {
                foodId:
                  request.params
                    .foodId as
                    NutritionFoodId,

                ...body,
              },
            );

          return food;

        } catch (
          error
        ) {

          if (
            error instanceof
            NutritionFoodNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_food_not_found',
              });
          }

          if (
            error instanceof
            InvalidNutritionFoodError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_food',
              });
          }

          throw error;
        }
      },
    );

    app.delete<{
      Params:
        FoodParams;
    }>(
      '/api/nutrition/foods/:foodId',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        if (
          !isUuid(
            request.params
              .foodId,
          )
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {

          await archiveFood(
            nutrition.unitOfWork,
            {
              foodId:
                request.params
                  .foodId as
                  NutritionFoodId,
            },
          );

          return reply
            .code(204)
            .send();

        } catch (
          error
        ) {

          if (
            error instanceof
            NutritionFoodNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_food_not_found',
              });
          }

          throw error;
        }
      },
    );

    app.post(
      '/api/nutrition/foods',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const body =
          parseCreateFoodBody(
            request.body,
          );

        if (!body) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          const food =
            await createFood(
              nutrition.unitOfWork,
              {
                ...body,

                createdByUserId:
                  actor.id as
                    DkturboUserId,
              },
            );

          return reply
            .code(201)
            .send(
              food,
            );
        } catch (
          error
        ) {
          if (
            error instanceof
              InvalidNutritionFoodError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_food',
              });
          }

          request.log.error(
            error,
            'Failed to create Nutrition food',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    app.post(
      '/api/nutrition/days/:dayId/meals',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseDayParams(
            request.params,
          );

        const body =
          parseCreateMealBody(
            request.body,
          );

        if (
          !params ||
          !body
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          const meal =
            await createMeal(
              nutrition.unitOfWork,
              {
                dayId:
                  params.dayId as
                    NutritionDayId,

                name:
                  body.name,

                plannedTime:
                  body.plannedTime,

                position:
                  body.position,

                notes:
                  body.notes,
              },
            );

          return reply
            .code(201)
            .send(
              meal,
            );
        } catch (
          error
        ) {
          if (
            error instanceof
              InvalidNutritionMealError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_meal',
              });
          }

          request.log.error(
            error,
            'Failed to create Nutrition meal',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

        app.patch(
      '/api/nutrition/meals/:mealId',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseMealParams(
            request.params,
          );

        const body =
          parseUpdateMealBody(
            request.body,
          );

        if (
          !params ||
          !body
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {

          const meal =
            await updateMeal(
              nutrition.unitOfWork,
              {
                mealId:
                  params.mealId as
                    NutritionMealId,

                ...body,
              },
            );

          return reply
            .code(200)
            .send(
              meal,
            );

        } catch (
          error
        ) {

          if (
            error instanceof
              InvalidNutritionMealError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_meal',
              });
          }

          if (
            error instanceof
              NutritionMealNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_meal_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to update Nutrition meal',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    app.delete(
      '/api/nutrition/meals/:mealId',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseMealParams(
            request.params,
          );

        if (!params) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {

          await deleteMeal(
            nutrition.unitOfWork,
            {
              mealId:
                params.mealId as
                  NutritionMealId,
            },
          );

          return reply
            .code(204)
            .send();

        } catch (
          error
        ) {

          if (
            error instanceof
              NutritionMealNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_meal_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to delete Nutrition meal',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

        app.patch(
      '/api/nutrition/meal-items/:mealItemId/quantities/:userId',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseMealItemQuantityParams(
            request.params,
          );

        const body =
          parseSetMealItemQuantityBody(
            request.body,
          );

        if (
          !params ||
          !body
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {

          await setMealItemQuantity(
            nutrition.unitOfWork,
            {
              mealItemId:
                params.mealItemId as
                  NutritionMealItemId,

              userId:
                params.userId as
                  DkturboUserId,

              quantity:
                body.quantity,
            },
          );

          return reply
            .code(204)
            .send();

        } catch (
          error
        ) {

          if (
            error instanceof
              InvalidNutritionMealItemQuantityError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_meal_item_quantity',
              });
          }

          if (
            error instanceof
              NutritionMealItemNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_meal_item_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to update Nutrition meal item quantity',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

        app.delete(
      '/api/nutrition/meal-items/:mealItemId',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseMealItemParams(
            request.params,
          );

        if (!params) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {

          await removeMealItem(
            nutrition.unitOfWork,
            {
              mealItemId:
                params.mealItemId as
                  NutritionMealItemId,
            },
          );

          return reply
            .code(204)
            .send();

        } catch (
          error
        ) {

          if (
            error instanceof
              NutritionMealItemNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_meal_item_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to remove Nutrition meal item',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

        app.post(
      '/api/nutrition/meal-items/:mealItemId/move',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseMealItemParams(
            request.params,
          );

        const body =
          parseMoveMealItemBody(
            request.body,
          );

        if (
          !params ||
          !body
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {

          await moveMealItem(
            nutrition.unitOfWork,
            {
              mealItemId:
                params.mealItemId as
                  NutritionMealItemId,

              targetMealId:
                body.targetMealId as
                  NutritionMealId,

              targetPosition:
                body.targetPosition,
            },
          );

          return reply
            .code(204)
            .send();

        } catch (
          error
        ) {

          if (
            error instanceof
              InvalidNutritionMealItemMoveError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_meal_item_move',
              });
          }

          if (
            error instanceof
              NutritionMealItemNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_meal_item_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to move Nutrition meal item',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    app.post(
      '/api/nutrition/meals/:mealId/items',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseMealParams(
            request.params,
          );

        const body =
          parseAddFoodToMealBody(
            request.body,
          );

        if (
          !params ||
          !body
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          const detail =
            await addFoodToMeal(
              nutrition.unitOfWork,
              {
                mealId:
                  params.mealId as
                    NutritionMealId,

                foodId:
                  body.foodId as
                    NutritionFoodId,

                position:
                  body.position,

                notes:
                  body.notes,

                quantities:
                  body.quantities.map(
                    (
                      quantity,
                    ) => ({
                      userId:
                        quantity.userId as
                          DkturboUserId,

                      quantity:
                        quantity.quantity,
                    }),
                  ),
              },
            );

          return reply
            .code(201)
            .send(
              detail,
            );
        } catch (
          error
        ) {
          if (
            error instanceof
              InvalidMealFoodError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_meal_food',
              });
          }

          if (
            error instanceof
              NutritionMealNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_meal_not_found',
              });
          }

          if (
            error instanceof
              NutritionFoodNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_food_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to add food to Nutrition meal',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    app.get(
      '/api/nutrition/plans',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        return nutrition
          .unitOfWork
          .execute(
            ({
              plans,
            }) =>
              plans.list(),
          );
      },
    );

    app.post(
      '/api/nutrition/plans',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const body =
          parseCreatePlanBody(
            request.body,
          );

        if (!body) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          const created =
            await createWeeklyPlan(
              nutrition.unitOfWork,
              {
                title:
                  body.title,

                weekStart:
                  body.weekStart,

                createdByUserId:
                  actor.id as
                    DkturboUserId,
              },
            );

          return reply
            .code(201)
            .send(
              created,
            );
        } catch (
          error
        ) {
          if (
            error instanceof
              InvalidWeeklyNutritionPlanError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_plan',
              });
          }

          request.log.error(
            error,
            'Failed to create Nutrition plan',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    app.get(
      '/api/nutrition/plans/:planId',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parsePlanParams(
            request.params,
          );

        if (!params) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          return await getWeeklyPlanDetail(
            nutrition.unitOfWork,
            params.planId as
              NutritionPlanId,
          );
        } catch (
          error
        ) {
          if (
            error instanceof
              NutritionPlanNotFoundForDetailError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_plan_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to get Nutrition plan detail',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    app.put(
      '/api/nutrition/plans/:planId/targets/:userId',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.nutrition.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseTargetParams(
            request.params,
          );

        const body =
          parseSetPlanTargetBody(
            request.body,
          );

        if (
          !params ||
          !body
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          return await setPlanTarget(
            nutrition.unitOfWork,
            {
              planId:
                params.planId as
                  NutritionPlanId,

              userId:
                params.userId as
                  DkturboUserId,

              caloriesKcal:
                body.caloriesKcal,

              proteinG:
                body.proteinG,

              carbohydratesG:
                body.carbohydratesG,

              fatG:
                body.fatG,

              fiberG:
                body.fiberG,
            },
          );
        } catch (
          error
        ) {
          if (
            error instanceof
              InvalidNutritionTargetError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_target',
              });
          }

          if (
            error instanceof
              NutritionPlanNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_plan_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to set Nutrition target',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );
  };

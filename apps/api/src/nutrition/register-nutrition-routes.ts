import type {
  HttpRouteRegistrationContext,
} from '@dkturbo/control-plane';

import {
  buildNutritionWeekPdf,
} from './build-nutrition-week-pdf.js';

import {
  buildPdfContentDisposition,
  normalizePdfFilename,
} from '../pdf/report-pdf.js';

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
  markMealItemEaten,
  markMealItemSkipped,
  replaceMealItemActual,
  resetMealItemActual,
  InvalidNutritionMealItemActualQuantityError,
  ArchivedNutritionReplacementFoodError,
  NutritionMealItemActualItemNotFoundError,
  NutritionMealItemActualMealNotFoundError,
  NutritionMealItemActualPlannedQuantityNotFoundError,
  listNutritionPersonAccessAdministration,
  setNutritionPersonAccessAdministration,
  NutritionSelfAccessAdministrationError,
  NutritionPersonManageAccessDeniedError,
  requireNutritionPersonManageAccess,
  removeMealItemQuantity,
  NutritionMealItemQuantityNotFoundError,
  createFoodPreparationConversion,
  updateFoodPreparationConversion,
  deleteFoodPreparationConversion,
  listFoodPreparationConversions,
  InvalidFoodPreparationConversionError,
  FoodPreparationConversionFoodNotFoundError,
  FoodPreparationConversionNotFoundError,
  setMealItemPreparation,
  NutritionMealItemPreparationItemNotFoundError,
  NutritionMealItemPreparationConversionNotFoundError,
  NutritionMealItemPreparationFoodMismatchError,
  copyNutritionDay,
  InvalidNutritionQuantityCopyMappingError,
  NutritionCopyPlanNotFoundError,
  NutritionCopyDayNotFoundError,
  NutritionCopySameDayError,
  NutritionCopySourceDayEmptyError,
  NutritionCopyTargetDayNotEmptyError,
  copyNutritionWeek,
  InvalidNutritionWeekCopyError,
  NutritionCopyTargetWeekAlreadyExistsError,
  NutritionCopySourceWeekInvalidError,
  NutritionCopyWeekSourcePlanNotFoundError,
  NutritionPersonReadAccessDeniedError,
  requireNutritionPersonReadAccess,
  type DkturboUserId,
  type Nutrition,
  type NutritionPlanId,
  type NutritionDayId,
  type NutritionFoodId,
  type NutritionMealId,
  type NutritionUnit,
  type NutritionMealItemId,
  type NutritionFoodCategory,
  type NutritionPersonAccessRole,
  type NutritionWeeklyPlanDetail,
  type NutritionFoodPreparationConversionId,
} from '@dkturbo/nutrition';

export interface NutritionPerson {
  id:
    string;

  name:
    string;

  accessRole?:
    | 'SELF'
    | 'VIEWER'
    | 'MANAGER';
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

interface NutritionAdminUserParams {
  userId:
    string;
}

interface NutritionAdminPersonAccessParams {
  userId:
    string;

  subjectUserId:
    string;
}

interface SetNutritionPersonAccessBody {
  role:
    NutritionPersonAccessRole | null;
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

interface MealItemActualParams {
  mealItemId:
    string;

  userId:
    string;
}

type SetMealItemActualBody =
  | {
      status:
        'EATEN';
    }
  | {
      status:
        'SKIPPED';

      notes:
        string | null;
    }
  | {
      status:
        'REPLACED';

      actualFoodId:
        string;

      actualQuantity:
        number;

      notes:
        string | null;
    };

interface SetMealItemQuantityBody {
  quantity:
    number;
}

interface SetMealItemPreparationBody {
  preparationConversionId:
    string | null;
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

interface NutritionQuantityCopyMappingBody {
  sourceUserId:
    string;

  targetUserId:
    string;
}

interface CopyNutritionDayBody {
  sourcePlanId:
    string;

  targetPlanId:
    string;

  targetDayId:
    string;

  quantityMappings:
    NutritionQuantityCopyMappingBody[];
}

interface CopyNutritionWeekBody {
  targetWeekStart:
    string;

  title:
    string;

  quantityMappings:
    NutritionQuantityCopyMappingBody[];
}

interface MealParams {
  mealId:
    string;
}

interface FoodParams {
  foodId:
    string;
}

interface FoodPreparationConversionParams {
  conversionId:
    string;
}

interface CreateFoodPreparationConversionBody {
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

interface UpdateFoodPreparationConversionBody {
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

const parseNutritionAdminUserParams =
  (
    value:
      unknown,
  ): NutritionAdminUserParams | null => {

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
        candidate.userId,
      )
    ) {
      return null;
    }

    return {
      userId:
        candidate.userId,
    };
  };

const parseNutritionAdminPersonAccessParams =
  (
    value:
      unknown,
  ): NutritionAdminPersonAccessParams | null => {

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
        candidate.userId,
      ) ||
      !isUuid(
        candidate.subjectUserId,
      )
    ) {
      return null;
    }

    return {
      userId:
        candidate.userId,

      subjectUserId:
        candidate.subjectUserId,
    };
  };

const parseSetNutritionPersonAccessBody =
  (
    value:
      unknown,
  ): SetNutritionPersonAccessBody | null => {

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
      candidate.role !==
        null &&
      candidate.role !==
        'VIEWER' &&
      candidate.role !==
        'MANAGER'
    ) {
      return null;
    }

    return {
      role:
        candidate.role as
          NutritionPersonAccessRole | null,
    };
  };

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

const parseSetMealItemPreparationBody =
  (
    value:
      unknown,
  ): SetMealItemPreparationBody | null => {

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
      candidate.preparationConversionId !==
        null &&
      !isUuid(
        candidate.preparationConversionId,
      )
    ) {
      return null;
    }

    return {
      preparationConversionId:
        candidate.preparationConversionId as
          string | null,
    };
  };

const parseMealItemActualParams =
  (
    value:
      unknown,
  ): MealItemActualParams | null => {

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

const parseSetMealItemActualBody =
  (
    value:
      unknown,
  ): SetMealItemActualBody | null => {

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
      candidate.status ===
        'EATEN'
    ) {
      return {
        status:
          'EATEN',
      };
    }

    const notes =
      candidate.notes ===
        undefined
        ? null
        : parseNullableString(
            candidate.notes,
          );

    if (
      notes ===
        undefined
    ) {
      return null;
    }

    if (
      candidate.status ===
        'SKIPPED'
    ) {
      return {
        status:
          'SKIPPED',

        notes,
      };
    }

    if (
      candidate.status ===
        'REPLACED'
    ) {

      if (
        !isUuid(
          candidate.actualFoodId,
        ) ||
        typeof candidate.actualQuantity !==
          'number' ||
        !Number.isFinite(
          candidate.actualQuantity,
        )
      ) {
        return null;
      }

      return {
        status:
          'REPLACED',

        actualFoodId:
          candidate.actualFoodId,

        actualQuantity:
          candidate.actualQuantity,

        notes,
      };
    }

    return null;
  };

const parseCopyNutritionDayBody =
  (
    value:
      unknown,
  ): CopyNutritionDayBody | null => {

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
        candidate.sourcePlanId,
      ) ||
      !isUuid(
        candidate.targetPlanId,
      ) ||
      !isUuid(
        candidate.targetDayId,
      ) ||
      !Array.isArray(
        candidate.quantityMappings,
      )
    ) {
      return null;
    }

    const quantityMappings:
      NutritionQuantityCopyMappingBody[] = [];

    for (
      const value of
      candidate.quantityMappings
    ) {
      if (
        typeof value !==
          'object' ||
        value ===
          null
      ) {
        return null;
      }

      const mapping =
        value as
          Record<
            string,
            unknown
          >;

      if (
        !isUuid(
          mapping.sourceUserId,
        ) ||
        !isUuid(
          mapping.targetUserId,
        )
      ) {
        return null;
      }

      quantityMappings.push({
        sourceUserId:
          mapping.sourceUserId,

        targetUserId:
          mapping.targetUserId,
      });
    }

    return {
      sourcePlanId:
        candidate.sourcePlanId,

      targetPlanId:
        candidate.targetPlanId,

      targetDayId:
        candidate.targetDayId,

      quantityMappings,
    };
  };

const parseCopyNutritionWeekBody =
  (
    value:
      unknown,
  ): CopyNutritionWeekBody | null => {

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
      typeof candidate.targetWeekStart !==
        'string' ||
      typeof candidate.title !==
        'string' ||
      !Array.isArray(
        candidate.quantityMappings,
      )
    ) {
      return null;
    }

    const quantityMappings:
      NutritionQuantityCopyMappingBody[] = [];

    for (
      const value of
      candidate.quantityMappings
    ) {
      if (
        typeof value !==
          'object' ||
        value ===
          null
      ) {
        return null;
      }

      const mapping =
        value as
          Record<
            string,
            unknown
          >;

      if (
        !isUuid(
          mapping.sourceUserId,
        ) ||
        !isUuid(
          mapping.targetUserId,
        )
      ) {
        return null;
      }

      quantityMappings.push({
        sourceUserId:
          mapping.sourceUserId,

        targetUserId:
          mapping.targetUserId,
      });
    }

    return {
      targetWeekStart:
        candidate.targetWeekStart,

      title:
        candidate.title,

      quantityMappings,
    };
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

const parseFoodPreparationConversionBody =
  (
    value:
      unknown,
  ):
    CreateFoodPreparationConversionBody | null => {

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
      typeof candidate.name !==
        'string' ||
      typeof candidate.rawAmount !==
        'number' ||
      typeof candidate.preparedAmount !==
        'number' ||
      typeof candidate.preparedUnit !==
        'string' ||
      !nutritionUnits.has(
        candidate.preparedUnit as
          NutritionUnit,
      ) ||
      typeof candidate.isDefault !==
        'boolean'
    ) {
      return null;
    }

    return {
      name:
        candidate.name,

      rawAmount:
        candidate.rawAmount,

      preparedAmount:
        candidate.preparedAmount,

      preparedUnit:
        candidate.preparedUnit as
          NutritionUnit,

      isDefault:
        candidate.isDefault,
    };
  };

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

const filterWeeklyPlanDetailForUsers =
  (
    detail:
      NutritionWeeklyPlanDetail,

    readableUserIds:
      ReadonlySet<string>,
  ): NutritionWeeklyPlanDetail => ({
    ...detail,

    targets:
      detail.targets.filter(
        target =>
          readableUserIds.has(
            target.userId,
          ),
      ),

    days:
      detail.days.map(
        day => ({
          ...day,

          meals:
            day.meals.map(
              meal => ({
                ...meal,

                items:
                  meal.items.map(
                    item => ({
                      ...item,

                      quantities:
                        item.quantities.filter(
                          quantity =>
                            readableUserIds.has(
                              quantity.userId,
                            ),
                        ),
                    }),
                  ),

                totalsByUser:
                  meal.totalsByUser.filter(
                    total =>
                      readableUserIds.has(
                        total.userId,
                      ),
                  ),
              }),
            ),

          actuals:
            day.actuals.filter(
              actual =>
                readableUserIds.has(
                  actual.userId,
                ),
            ),

          dailyTotalsByUser:
            day.dailyTotalsByUser.filter(
              total =>
                readableUserIds.has(
                  total.userId,
                ),
            ),

          progressByUser:
            day.progressByUser.filter(
              progress =>
                readableUserIds.has(
                  progress.userId,
                ),
            ),
        }),
      ),

    weeklyTotalsByUser:
      detail.weeklyTotalsByUser.filter(
        total =>
          readableUserIds.has(
            total.userId,
          ),
      ),
  });

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
      requireOwnerActor,
    } = http;

    const requirePersonReadAccess =
      async (
        actorUserId:
          DkturboUserId,

        subjectUserId:
          DkturboUserId,
      ): Promise<void> =>
        nutrition.unitOfWork.execute(
          async ({
            personAccess,
          }) =>
            requireNutritionPersonReadAccess(
              personAccess,
              actorUserId,
              subjectUserId,
            ),
        );

    const requireReadAccessForUserIds =
      async (
        actorUserId:
          DkturboUserId,

        userIds:
          Iterable<DkturboUserId>,
      ): Promise<void> => {

        const uniqueUserIds =
          new Set(
            userIds,
          );

        for (
          const userId of
          uniqueUserIds
        ) {
          await requirePersonReadAccess(
            actorUserId,
            userId,
          );
        }
      };

    const requirePersonManageAccess =
      async (
        actorUserId:
          DkturboUserId,

        subjectUserId:
          DkturboUserId,
      ): Promise<void> =>
        nutrition.unitOfWork.execute(
          async ({
            personAccess,
          }) =>
            requireNutritionPersonManageAccess(
              personAccess,
              actorUserId,
              subjectUserId,
            ),
        );

    const requireManageAccessForUserIds =
      async (
        actorUserId:
          DkturboUserId,

        userIds:
          Iterable<DkturboUserId>,
      ): Promise<void> => {

        const uniqueUserIds =
          new Set(
            userIds,
          );

        for (
          const userId of
            uniqueUserIds
        ) {
          await requirePersonManageAccess(
            actorUserId,
            userId,
          );
        }
      };

    const getMealItemAffectedUserIds =
      async (
        mealItemId:
          NutritionMealItemId,
      ): Promise<DkturboUserId[]> =>
        nutrition.unitOfWork.execute(
          async ({
            meals,
            mealItems,
            mealItemActuals,
          }) => {

            const item =
              await mealItems.findById(
                mealItemId,
              );

            if (!item) {
              throw new NutritionMealItemNotFoundError(
                'Nutrition meal item not found',
              );
            }

            const meal =
              await meals.findById(
                item.mealId,
              );

            if (!meal) {
              throw new NutritionMealNotFoundError(
                'Nutrition meal not found',
              );
            }

            const details =
              await mealItems.listDetailsForMeal(
                item.mealId,
              );

            const detail =
              details.find(
                candidate =>
                  candidate.item.id ===
                  item.id,
              );

            if (!detail) {
              throw new NutritionMealItemNotFoundError(
                'Nutrition meal item detail not found',
              );
            }

            const actuals =
              await mealItemActuals.listForDay(
                meal.dayId,
              );

            return Array.from(
              new Set<DkturboUserId>([
                ...detail.quantities.map(
                  quantity =>
                    quantity.userId,
                ),

                ...actuals
                  .filter(
                    actual =>
                      actual.mealItemId ===
                      item.id,
                  )
                  .map(
                    actual =>
                      actual.userId,
                  ),
              ]),
            );
          },
        );

    const getMealAffectedUserIds =
      async (
        mealId:
          NutritionMealId,
      ): Promise<DkturboUserId[]> =>
        nutrition.unitOfWork.execute(
          async ({
            meals,
            mealItems,
            mealItemActuals,
          }) => {

            const meal =
              await meals.findById(
                mealId,
              );

            if (!meal) {
              throw new NutritionMealNotFoundError(
                'Nutrition meal not found',
              );
            }

            const items =
              await mealItems.listDetailsForMeal(
                mealId,
              );

            const mealItemIds =
              new Set(
                items.map(
                  item =>
                    item.item.id,
                ),
              );

            const actuals =
              await mealItemActuals.listForDay(
                meal.dayId,
              );

            return Array.from(
              new Set<DkturboUserId>([
                ...items.flatMap(
                  item =>
                    item.quantities.map(
                      quantity =>
                        quantity.userId,
                    ),
                ),

                ...actuals
                  .filter(
                    actual =>
                      actual.mealItemId !==
                        null &&
                      mealItemIds.has(
                        actual.mealItemId,
                      ),
                  )
                  .map(
                    actual =>
                      actual.userId,
                  ),
              ]),
            );
          },
        );

    const listReadablePersonIds =
      async (
        actorUserId:
          DkturboUserId,
      ): Promise<Set<string>> =>
        nutrition.unitOfWork.execute(
          async ({
            personAccess,
          }) => {

            const accesses =
              await personAccess.listForGrantee(
                actorUserId,
              );

            return new Set<string>([
              actorUserId,

              ...accesses.map(
                access =>
                  access.subjectUserId,
              ),
            ]);
          },
        );

    /*
    * Owner-only Nutrition person access administration.
    *
    * Administering person_access does not itself grant
    * ordinary Nutrition app access.
    */

    app.get(
      '/api/nutrition/admin/users/:userId/person-access',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireOwnerActor(
            request,
            reply,
          );

        if (!actor) {
          return;
        }

        const params =
          parseNutritionAdminUserParams(
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

        const people =
          await listPeople();

        const granteeExists =
          people.some(
            person =>
              person.id ===
              params.userId,
          );

        if (!granteeExists) {
          return reply
            .code(404)
            .send({
              error:
                'nutrition_user_not_found',
            });
        }

        const entries =
          await listNutritionPersonAccessAdministration(
            nutrition.unitOfWork,
            {
              granteeUserId:
                params.userId as
                  DkturboUserId,

              people:
                people.map(
                  person => ({
                    id:
                      person.id as
                        DkturboUserId,

                    name:
                      person.name,
                  }),
                ),
            },
          );

        return entries;
      },
    );

    app.put(
      '/api/nutrition/admin/users/:userId/people/:subjectUserId/access',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireOwnerActor(
            request,
            reply,
          );

        if (!actor) {
          return;
        }

        const params =
          parseNutritionAdminPersonAccessParams(
            request.params,
          );

        const body =
          parseSetNutritionPersonAccessBody(
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

        const people =
          await listPeople();

        const granteeExists =
          people.some(
            person =>
              person.id ===
              params.userId,
          );

        const subjectExists =
          people.some(
            person =>
              person.id ===
              params.subjectUserId,
          );

        if (
          !granteeExists ||
          !subjectExists
        ) {
          return reply
            .code(404)
            .send({
              error:
                'nutrition_user_not_found',
            });
        }

        try {

          const result =
            await setNutritionPersonAccessAdministration(
              nutrition.unitOfWork,
              {
                granteeUserId:
                  params.userId as
                    DkturboUserId,

                subjectUserId:
                  params.subjectUserId as
                    DkturboUserId,

                role:
                  body.role,
              },
            );

          return {
            userId:
              params.userId,

            subjectUserId:
              params.subjectUserId,

            role:
              result.access?.role ??
              (
                params.userId ===
                params.subjectUserId
                  ? 'MANAGER'
                  : null
              ),
          };

        } catch (
          error
        ) {

          if (
            error instanceof
              NutritionSelfAccessAdministrationError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'nutrition_self_access_is_implicit',
              });
          }

          request.log.error(
            error,
            'Failed to administer Nutrition person access',
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

        const [
          people,
          accesses,
        ] =
          await Promise.all([
            listPeople(),

            nutrition.unitOfWork.execute(
              async ({
                personAccess,
              }) =>
                personAccess.listForGrantee(
                  actor.id as
                    DkturboUserId,
                ),
            ),
          ]);

        const accessBySubject =
          new Map(
            accesses.map(
              access => [
                access.subjectUserId,
                access.role,
              ] as const,
            ),
          );

        return people
        .map(
          person => {

            if (
              person.id ===
              actor.id
            ) {
              return {
                ...person,

                accessRole:
                  'SELF' as const,
              };
            }

            const role =
              accessBySubject.get(
                person.id as
                  DkturboUserId,
              );

            if (!role) {
              return null;
            }

            return {
              ...person,

              accessRole:
                role,
            };
          },
        )
        .filter(
          (
            person,
          ): person is
            NonNullable<
              typeof person
            > =>
            person !==
            null,
        );
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

    app.get<{
      Params:
        FoodParams;
    }>(
      '/api/nutrition/foods/:foodId/preparation-conversions',

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
          return await listFoodPreparationConversions(
            nutrition.unitOfWork,
            request.params
              .foodId as
              NutritionFoodId,
          );
        } catch (
          error
        ) {
          if (
            error instanceof
            FoodPreparationConversionFoodNotFoundError
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

    app.post<{
      Params:
        FoodParams;

      Body:
        CreateFoodPreparationConversionBody;
    }>(
      '/api/nutrition/foods/:foodId/preparation-conversions',

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
          parseFoodPreparationConversionBody(
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
          const conversion =
            await createFoodPreparationConversion(
              nutrition.unitOfWork,
              {
                foodId:
                  request.params
                    .foodId as
                    NutritionFoodId,

                ...body,
              },
            );

          return reply
            .code(201)
            .send(
              conversion,
            );
        } catch (
          error
        ) {
          if (
            error instanceof
            FoodPreparationConversionFoodNotFoundError
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
            InvalidFoodPreparationConversionError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_food_preparation_conversion',
              });
          }

          throw error;
        }
      },
    );

    app.patch<{
      Params:
        FoodPreparationConversionParams;

      Body:
        UpdateFoodPreparationConversionBody;
    }>(
      '/api/nutrition/food-preparation-conversions/:conversionId',

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
              .conversionId,
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
          parseFoodPreparationConversionBody(
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
          return await updateFoodPreparationConversion(
            nutrition.unitOfWork,
            {
              conversionId:
                request.params
                  .conversionId as
                  NutritionFoodPreparationConversionId,

              ...body,
            },
          );
        } catch (
          error
        ) {
          if (
            error instanceof
            FoodPreparationConversionNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'food_preparation_conversion_not_found',
              });
          }

          if (
            error instanceof
            InvalidFoodPreparationConversionError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_food_preparation_conversion',
              });
          }

          throw error;
        }
      },
    );

    app.delete<{
      Params:
        FoodPreparationConversionParams;
    }>(
      '/api/nutrition/food-preparation-conversions/:conversionId',

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
              .conversionId,
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
          await deleteFoodPreparationConversion(
            nutrition.unitOfWork,
            {
              conversionId:
                request.params
                  .conversionId as
                  NutritionFoodPreparationConversionId,
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
            FoodPreparationConversionNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'food_preparation_conversion_not_found',
              });
          }

          throw error;
        }
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
      '/api/nutrition/days/:dayId/copy',

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
          parseCopyNutritionDayBody(
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

          await requireReadAccessForUserIds(
            actor.id as
              DkturboUserId,

            body.quantityMappings.map(
              mapping =>
                mapping.sourceUserId as
                  DkturboUserId,
            ),
          );

          await requireManageAccessForUserIds(
            actor.id as
              DkturboUserId,

            body.quantityMappings.map(
              mapping =>
                mapping.targetUserId as
                  DkturboUserId,
            ),
          );

          const result =
            await copyNutritionDay(
              nutrition.unitOfWork,
              {
                sourcePlanId:
                  body.sourcePlanId as
                    NutritionPlanId,

                sourceDayId:
                  params.dayId as
                    NutritionDayId,

                targetPlanId:
                  body.targetPlanId as
                    NutritionPlanId,

                targetDayId:
                  body.targetDayId as
                    NutritionDayId,

                quantityMappings:
                  body.quantityMappings.map(
                    mapping => ({
                      sourceUserId:
                        mapping.sourceUserId as
                          DkturboUserId,

                      targetUserId:
                        mapping.targetUserId as
                          DkturboUserId,
                    }),
                  ),
              },
            );

          return reply
            .code(201)
            .send(
              result,
            );

        } catch (
          error
        ) {

          if (
            error instanceof
              NutritionPersonReadAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_read_access_denied',
              });
          }

          if (
            error instanceof
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
              });
          }

          if (
            error instanceof
              NutritionCopyPlanNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_copy_plan_not_found',
              });
          }

          if (
            error instanceof
              NutritionCopyDayNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_copy_day_not_found',
              });
          }

          if (
            error instanceof
              NutritionCopySameDayError ||
            error instanceof
              InvalidNutritionQuantityCopyMappingError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_day_copy',
              });
          }

          if (
            error instanceof
              NutritionCopySourceDayEmptyError
          ) {
            return reply
              .code(409)
              .send({
                error:
                  'nutrition_copy_source_day_empty',
              });
          }

          if (
            error instanceof
              NutritionCopyTargetDayNotEmptyError
          ) {
            return reply
              .code(409)
              .send({
                error:
                  'nutrition_copy_target_day_not_empty',
              });
          }

          request.log.error(
            error,
            'Failed to copy Nutrition day',
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

          const affectedUserIds =
            await getMealAffectedUserIds(
              params.mealId as
                NutritionMealId,
            );

          await requireManageAccessForUserIds(
            actor.id as
              DkturboUserId,

            affectedUserIds,
          );

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
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
              });
          }

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

          const affectedUserIds =
            await getMealAffectedUserIds(
              params.mealId as
                NutritionMealId,
            );

          await requireManageAccessForUserIds(
            actor.id as
              DkturboUserId,

            affectedUserIds,
          );

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
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
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

          await requirePersonManageAccess(
            actor.id as
              DkturboUserId,

            params.userId as
              DkturboUserId,
          );

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
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
              });
          }

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

        if (!params) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {

          await requirePersonManageAccess(
            actor.id as
              DkturboUserId,

            params.userId as
              DkturboUserId,
          );

          await removeMealItemQuantity(
            nutrition.unitOfWork,
            {
              mealItemId:
                params.mealItemId as
                  NutritionMealItemId,

              userId:
                params.userId as
                  DkturboUserId,
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
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
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

          if (
            error instanceof
              NutritionMealItemQuantityNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_meal_item_quantity_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to remove Nutrition meal item quantity',
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
      '/api/nutrition/meal-items/:mealItemId/actuals/:userId',

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
          parseMealItemActualParams(
            request.params,
          );

        const body =
          parseSetMealItemActualBody(
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

          await requirePersonManageAccess(
            actor.id as
              DkturboUserId,

            params.userId as
              DkturboUserId,
          );

          if (
            body.status ===
              'EATEN'
          ) {
            const actual =
              await markMealItemEaten(
                nutrition.unitOfWork,
                {
                  mealItemId:
                    params.mealItemId as
                      NutritionMealItemId,

                  userId:
                    params.userId as
                      DkturboUserId,
                },
              );

            return reply
              .code(200)
              .send(
                actual,
              );
          }

          if (
            body.status ===
              'SKIPPED'
          ) {
            const actual =
              await markMealItemSkipped(
                nutrition.unitOfWork,
                {
                  mealItemId:
                    params.mealItemId as
                      NutritionMealItemId,

                  userId:
                    params.userId as
                      DkturboUserId,

                  notes:
                    body.notes,
                },
              );

            return reply
              .code(200)
              .send(
                actual,
              );
          }

          const actual =
            await replaceMealItemActual(
              nutrition.unitOfWork,
              {
                mealItemId:
                  params.mealItemId as
                    NutritionMealItemId,

                userId:
                  params.userId as
                    DkturboUserId,

                actualFoodId:
                  body.actualFoodId as
                    NutritionFoodId,

                actualQuantity:
                  body.actualQuantity,

                notes:
                  body.notes,
              },
            );

          return reply
            .code(200)
            .send(
              actual,
            );

        } catch (
          error
        ) {

          if (
            error instanceof
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
              });
          }

          if (
            error instanceof
              InvalidNutritionMealItemActualQuantityError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_meal_item_actual_quantity',
              });
          }

          if (
            error instanceof
              ArchivedNutritionReplacementFoodError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'archived_nutrition_replacement_food',
              });
          }

          if (
            error instanceof
              NutritionMealItemActualItemNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_meal_item_not_found',
              });
          }

          if (
            error instanceof
              NutritionMealItemActualMealNotFoundError
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
              NutritionMealItemActualPlannedQuantityNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_meal_item_quantity_not_found',
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
            'Failed to set Nutrition meal item actual',
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
      '/api/nutrition/meal-items/:mealItemId/actuals/:userId',

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
          parseMealItemActualParams(
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

          await requirePersonManageAccess(
            actor.id as
              DkturboUserId,

            params.userId as
              DkturboUserId,
          );

          await resetMealItemActual(
            nutrition.unitOfWork,
            {
              mealItemId:
                params.mealItemId as
                  NutritionMealItemId,

              userId:
                params.userId as
                  DkturboUserId,
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
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
              });
          }

          if (
            error instanceof
              NutritionMealItemActualItemNotFoundError
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
            'Failed to reset Nutrition meal item actual',
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

          const affectedUserIds =
            await getMealItemAffectedUserIds(
              params.mealItemId as
                NutritionMealItemId,
            );

          await requireManageAccessForUserIds(
            actor.id as
              DkturboUserId,

            affectedUserIds,
          );

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
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
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

    app.patch(
      '/api/nutrition/meal-items/:mealItemId/preparation',
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
          parseSetMealItemPreparationBody(
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

          const affectedUserIds =
            await getMealItemAffectedUserIds(
              params.mealItemId as
                NutritionMealItemId,
            );

          await requireManageAccessForUserIds(
            actor.id as
              DkturboUserId,

            affectedUserIds,
          );

          await setMealItemPreparation(
            nutrition.unitOfWork,
            {
              mealItemId:
                params.mealItemId as
                  NutritionMealItemId,

              preparationConversionId:
                body.preparationConversionId ===
                  null
                  ? null
                  : body.preparationConversionId as
                      NutritionFoodPreparationConversionId,
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
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
              });
          }

          if (
            error instanceof
              NutritionMealItemPreparationItemNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_meal_item_not_found',
              });
          }

          if (
            error instanceof
              NutritionMealItemPreparationConversionNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_food_preparation_conversion_not_found',
              });
          }

          if (
            error instanceof
              NutritionMealItemPreparationFoodMismatchError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'nutrition_food_preparation_conversion_food_mismatch',
              });
          }

          request.log.error(
            error,
            'Failed to update Nutrition meal item preparation',
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

          const affectedUserIds =
            await getMealItemAffectedUserIds(
              params.mealItemId as
                NutritionMealItemId,
            );

          await requireManageAccessForUserIds(
            actor.id as
              DkturboUserId,

            affectedUserIds,
          );

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
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
              });
          }

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

        for (
          const quantity of
            body.quantities
        ) {
          try {
            await requirePersonManageAccess(
              actor.id as
                DkturboUserId,

              quantity.userId as
                DkturboUserId,
            );
          } catch (
            error
          ) {
            if (
              error instanceof
                NutritionPersonManageAccessDeniedError
            ) {
              return reply
                .code(403)
                .send({
                  error:
                    'nutrition_person_manage_access_denied',
                });
            }

            throw error;
          }
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

    app.post(
      '/api/nutrition/plans/:planId/copy',

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

        const body =
          parseCopyNutritionWeekBody(
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

          await requireReadAccessForUserIds(
            actor.id as
              DkturboUserId,

            body.quantityMappings.map(
              mapping =>
                mapping.sourceUserId as
                  DkturboUserId,
            ),
          );

          await requireManageAccessForUserIds(
            actor.id as
              DkturboUserId,

            body.quantityMappings.map(
              mapping =>
                mapping.targetUserId as
                  DkturboUserId,
            ),
          );

          const result =
            await copyNutritionWeek(
              nutrition.unitOfWork,
              {
                sourcePlanId:
                  params.planId as
                    NutritionPlanId,

                targetWeekStart:
                  body.targetWeekStart,

                title:
                  body.title,

                createdByUserId:
                  actor.id as
                    DkturboUserId,

                quantityMappings:
                  body.quantityMappings.map(
                    mapping => ({
                      sourceUserId:
                        mapping.sourceUserId as
                          DkturboUserId,

                      targetUserId:
                        mapping.targetUserId as
                          DkturboUserId,
                    }),
                  ),
              },
            );

          return reply
            .code(201)
            .send(
              result,
            );

        } catch (
          error
        ) {

          if (
            error instanceof
              NutritionPersonReadAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_read_access_denied',
              });
          }

          if (
            error instanceof
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
              });
          }

          if (
            error instanceof
              NutritionCopyWeekSourcePlanNotFoundError
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_copy_source_week_not_found',
              });
          }

          if (
            error instanceof
              NutritionCopyTargetWeekAlreadyExistsError
          ) {
            return reply
              .code(409)
              .send({
                error:
                  'nutrition_copy_target_week_already_exists',
              });
          }

          if (
            error instanceof
              NutritionCopySourceWeekInvalidError
          ) {
            return reply
              .code(409)
              .send({
                error:
                  'nutrition_copy_source_week_invalid',
              });
          }

          if (
            error instanceof
              InvalidNutritionWeekCopyError ||
            error instanceof
              InvalidNutritionQuantityCopyMappingError
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_nutrition_week_copy',
              });
          }

          request.log.error(
            error,
            'Failed to copy Nutrition week',
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

          const [
            detail,
            readableUserIds,
          ] =
            await Promise.all([
              getWeeklyPlanDetail(
                nutrition.unitOfWork,
                params.planId as
                  NutritionPlanId,
              ),

              listReadablePersonIds(
                actor.id as
                  DkturboUserId,
              ),
            ]);

          return filterWeeklyPlanDetailForUsers(
            detail,
            readableUserIds,
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

    app.get(
      '/api/nutrition/plans/:planId/export',

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

        const query =
          request.query as
            Record<
              string,
              unknown
            >;

        const userId =
          typeof query.userId ===
            'string'
            ? query.userId
            : null;

        const requestedFilename =
          typeof query.filename ===
            'string'
            ? query.filename
            : null;

        if (
          !params ||
          !userId ||
          !isUuid(
            userId,
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

          const [
            detail,
            readableUserIds,
            people,
          ] =
            await Promise.all([
              getWeeklyPlanDetail(
                nutrition.unitOfWork,
                params.planId as
                  NutritionPlanId,
              ),

              listReadablePersonIds(
                actor.id as
                  DkturboUserId,
              ),

              listPeople(),
            ]);

          if (
            !readableUserIds.has(
              userId,
            )
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_access_denied',
              });
          }

          const person =
            people.find(
              candidate =>
                candidate.id ===
                userId,
            );

          if (!person) {
            return reply
              .code(404)
              .send({
                error:
                  'nutrition_person_not_found',
              });
          }

          const personalDetail =
            filterWeeklyPlanDetailForUsers(
              detail,
              new Set([
                userId,
              ]),
            );

          const pdf =
            await buildNutritionWeekPdf({
              personId:
                userId,

              personName:
                person.name,

              detail:
                personalDetail,
            });

          const filename =
            normalizePdfFilename(
              requestedFilename ??
              `Nutrición semanal - ${person.name} - ${detail.plan.startDate}`,
            );

          reply.header(
            'Content-Type',
            'application/pdf',
          );

          reply.header(
            'Content-Disposition',
            buildPdfContentDisposition(
              filename,
            ),
          );

          reply.header(
            'Cache-Control',
            'private, no-store',
          );

          reply.header(
            'Content-Length',
            String(
              pdf.length,
            ),
          );

          return reply
            .code(200)
            .send(
              Buffer.from(
                pdf,
              ),
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
            'Failed to export Nutrition week PDF',
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

          await requirePersonManageAccess(
            actor.id as
              DkturboUserId,

            params.userId as
              DkturboUserId,
          );

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
              NutritionPersonManageAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'nutrition_person_manage_access_denied',
              });
          }

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

import {
  cookies,
} from 'next/headers';

const API_BASE_URL =
  (
    process.env.DKTURBO_API_URL ??
    'http://127.0.0.1:3001'
  ).replace(
    /\/$/,
    '',
  );

export interface NutritionPersonResponse {
  id:
    string;

  name:
    string;
}

export interface NutritionPlanResponse {
  id:
    string;

  title:
    string;

  startDate:
    string;

  endDate:
    string;

  status:
    | 'DRAFT'
    | 'ACTIVE'
    | 'ARCHIVED';

  createdByUserId:
    string;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface NutritionPlanTargetResponse {
  id:
    string;

  planId:
    string;

  userId:
    string;

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

  createdAt:
    string;

  updatedAt:
    string;
}

export interface NutritionDayResponse {
  id:
    string;

  planId:
    string;

  date:
    string;

  notes:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface NutritionMealResponse {
  id:
    string;

  dayId:
    string;

  name:
    string;

  plannedTime:
    string | null;

  position:
    number;

  notes:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface NutritionFoodResponse {
  id:
    string;

  name:
    string;

  brand:
    string | null;

  category:
    | 'CEREALS'
    | 'PASTA'
    | 'RICE'
    | 'BREAD'
    | 'TUBERS'
    | 'MEAT'
    | 'FISH'
    | 'EGGS'
    | 'DAIRY'
    | 'LEGUMES'
    | 'FRUIT'
    | 'VEGETABLES'
    | 'NUTS_SEEDS'
    | 'FATS_OILS'
    | 'BEVERAGES'
    | 'SUPPLEMENTS'
    | 'OTHER';

  referenceAmount:
    number;

  referenceUnit:
    | 'G'
    | 'KG'
    | 'ML'
    | 'L'
    | 'UNIT';

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

  createdByUserId:
    string;

  archivedAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface NutritionMealItemResponse {
  id:
    string;

  mealId:
    string;

  foodId:
    string;

  position:
    number;

  notes:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface NutritionMealItemQuantityResponse {
  id:
    string;

  mealItemId:
    string;

  userId:
    string;

  quantity:
    number;

  createdAt:
    string;

  updatedAt:
    string;
}

export type NutritionFoodSnapshotResponse =
  Pick<
    NutritionFoodResponse,
    | 'name'
    | 'brand'
    | 'category'
    | 'referenceAmount'
    | 'referenceUnit'
    | 'caloriesKcal'
    | 'proteinG'
    | 'carbohydratesG'
    | 'fatG'
    | 'fiberG'
  >;

export interface NutritionMealItemActualResponse {
  id:
    string;

  dayId:
    string;

  mealItemId:
    string | null;

  userId:
    string;

  status:
    | 'EATEN'
    | 'SKIPPED'
    | 'REPLACED';

  plannedFoodId:
    string;

  plannedFoodSnapshot:
    NutritionFoodSnapshotResponse;

  plannedQuantity:
    number;

  actualFoodId:
    string | null;

  actualFoodSnapshot:
    NutritionFoodSnapshotResponse | null;

  actualQuantity:
    number | null;

  notes:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface NutritionMealItemDetailResponse {
  item:
    NutritionMealItemResponse;

  food:
    NutritionFoodResponse;

  quantities:
    NutritionMealItemQuantityResponse[];
}

export interface NutritionNutrientsResponse {
  caloriesKcal:
    number;

  proteinG:
    number;

  carbohydratesG:
    number;

  fatG:
    number;

  fiberG:
    number;
}

export interface NutritionTargetRemainingResponse {
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

export interface NutritionMealUserTotalsResponse {
  userId:
    string;

  nutrients:
    NutritionNutrientsResponse;
}

export interface NutritionMealDetailResponse {
  meal:
    NutritionMealResponse;

  items:
    NutritionMealItemDetailResponse[];

  totalsByUser:
    NutritionMealUserTotalsResponse[];
}

export interface NutritionDailyProgressResponse {
  userId:
    string;

  planned:
    NutritionNutrientsResponse;

  actual:
    NutritionNutrientsResponse;

  target:
    NutritionPlanTargetResponse | null;

  remaining:
    NutritionTargetRemainingResponse;
}

export interface NutritionWeekDayDetailResponse {
  day:
    NutritionDayResponse;

  meals:
    NutritionMealDetailResponse[];

  actuals:
    NutritionMealItemActualResponse[];

  dailyTotalsByUser:
    NutritionMealUserTotalsResponse[];

  progressByUser:
    NutritionDailyProgressResponse[];
}

export interface NutritionWeeklyPlanDetailResponse {
  plan:
    NutritionPlanResponse;

  targets:
    NutritionPlanTargetResponse[];

  days:
    NutritionWeekDayDetailResponse[];

  weeklyTotalsByUser:
    NutritionMealUserTotalsResponse[];
}

export class NutritionApiError
extends Error {

  public constructor(
    public readonly status:
      number,

    public readonly path:
      string,
  ) {
    super(
      `Nutrition API request failed: ${status} ${path}`,
    );

    this.name =
      'NutritionApiError';
  }
}

const getCookieHeader =
  async (): Promise<string> => {

    const cookieStore =
      await cookies();

    return cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join('; ');
  };

const getNutritionJson =
  async <T>(
    path:
      string,
  ): Promise<T> => {

    const cookie =
      await getCookieHeader();

    const response =
      await fetch(
        `${API_BASE_URL}${path}`,
        {
          headers: {
            cookie,
          },

          cache:
            'no-store',
        },
      );

    if (!response.ok) {
      throw new NutritionApiError(
        response.status,
        path,
      );
    }

    return response.json() as
      Promise<T>;
  };

export const getNutritionPlans =
  (): Promise<
    NutritionPlanResponse[]
  > =>
    getNutritionJson(
      '/api/nutrition/plans',
    );

export const getNutritionPlanDetail =
  (
    planId:
      string,
  ): Promise<
    NutritionWeeklyPlanDetailResponse
  > =>
    getNutritionJson(
      `/api/nutrition/plans/${encodeURIComponent(
        planId,
      )}`,
    );

export const getNutritionPeople =
  (): Promise<
    NutritionPersonResponse[]
  > =>
    getNutritionJson(
      '/api/nutrition/people',
    );
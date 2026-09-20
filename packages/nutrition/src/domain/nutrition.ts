export type NutritionPlanId =
  string & {
    readonly __brand:
      'NutritionPlanId';
  };

export type NutritionDayId =
  string & {
    readonly __brand:
      'NutritionDayId';
  };

export type NutritionMealId =
  string & {
    readonly __brand:
      'NutritionMealId';
  };

export type NutritionFoodId =
  string & {
    readonly __brand:
      'NutritionFoodId';
  };

export type NutritionMealItemId =
  string & {
    readonly __brand:
      'NutritionMealItemId';
  };

export type DkturboUserId =
  string & {
    readonly __brand:
      'DkturboUserId';
  };

export type NutritionPlanTargetId =
  string & {
    readonly __brand:
      'NutritionPlanTargetId';
  };

export type NutritionMealItemQuantityId =
  string & {
    readonly __brand:
      'NutritionMealItemQuantityId';
  };

export type NutritionPlanStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'ARCHIVED';

export type NutritionUnit =
  | 'G'
  | 'KG'
  | 'ML'
  | 'L'
  | 'UNIT';

export interface NutritionPlan {
  id:
    NutritionPlanId;

  title:
    string;

  startDate:
    string;

  endDate:
    string;

  status:
    NutritionPlanStatus;

  createdByUserId:
    DkturboUserId;

  createdAt:
    Date;

  updatedAt:
    Date;
}

export interface NutritionPlanTarget {
  id:
    NutritionPlanTargetId;

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

  createdAt:
    Date;

  updatedAt:
    Date;
}

export interface NutritionDay {
  id:
    NutritionDayId;

  planId:
    NutritionPlanId;

  date:
    string;

  notes:
    string | null;

  createdAt:
    Date;

  updatedAt:
    Date;
}

export interface NutritionMeal {
  id:
    NutritionMealId;

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

  createdAt:
    Date;

  updatedAt:
    Date;
}

export interface NutritionFood {
  id:
    NutritionFoodId;

  name:
    string;

  brand:
    string | null;

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

  createdByUserId:
    DkturboUserId;

  archivedAt:
    Date | null;

  createdAt:
    Date;

  updatedAt:
    Date;
}

export interface NutritionMealItem {
  id:
    NutritionMealItemId;

  mealId:
    NutritionMealId;

  foodId:
    NutritionFoodId;

  position:
    number;

  notes:
    string | null;

  createdAt:
    Date;

  updatedAt:
    Date;
}

export interface NutritionMealItemQuantity {
  id:
    NutritionMealItemQuantityId;

  mealItemId:
    NutritionMealItemId;

  userId:
    DkturboUserId;

  quantity:
    number;

  createdAt:
    Date;

  updatedAt:
    Date;
}

export interface NutritionMealItemDetail {
  item:
    NutritionMealItem;

  food:
    NutritionFood;

  quantities:
    NutritionMealItemQuantity[];
}

export interface NutritionNutrients {
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

export interface NutritionMealUserTotals {
  userId:
    DkturboUserId;

  nutrients:
    NutritionNutrients;
}

export interface NutritionMealDetail {
  meal:
    NutritionMeal;

  items:
    NutritionMealItemDetail[];

  totalsByUser:
    NutritionMealUserTotals[];
}
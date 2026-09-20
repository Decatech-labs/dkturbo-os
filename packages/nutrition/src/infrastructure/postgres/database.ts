import type {
  ColumnType,
  Generated,
} from 'kysely';

export interface NutritionPlanTable {
  id:
    Generated<string>;

  title:
    string;

  start_date:
    ColumnType<
      string | Date,
      string,
      string
    >;

  end_date:
    ColumnType<
      string | Date,
      string,
      string
    >;

  status:
    ColumnType<
      string,
      string | undefined,
      string
    >;

  created_by_user_id:
    string;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface NutritionPlanTargetTable {
  id:
    Generated<string>;

  plan_id:
    string;

  user_id:
    string;

  calories_kcal:
    string | null;

  protein_g:
    string | null;

  carbohydrates_g:
    string | null;

  fat_g:
    string | null;

  fiber_g:
    string | null;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface NutritionDayTable {
  id:
    Generated<string>;

  plan_id:
    string;

  date:
    ColumnType<
      string | Date,
      string,
      string
    >;

  notes:
    string | null;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface NutritionMealTable {
  id:
    Generated<string>;

  day_id:
    string;

  name:
    string;

  planned_time:
    string | null;

  position:
    number;

  notes:
    string | null;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface NutritionFoodTable {
  id:
    Generated<string>;

  name:
    string;

  brand:
    string | null;

  reference_amount:
    string;

  reference_unit:
    string;

  calories_kcal:
    string;

  protein_g:
    string;

  carbohydrates_g:
    string;

  fat_g:
    string;

  fiber_g:
    string | null;

  created_by_user_id:
    string;

  archived_at:
    Date | null;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface NutritionMealItemTable {
  id:
    Generated<string>;

  meal_id:
    string;

  food_id:
    string;

  position:
    number;

  notes:
    string | null;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface NutritionMealItemQuantityTable {
  id:
    Generated<string>;

  meal_item_id:
    string;

  user_id:
    string;

  quantity:
    string;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface NutritionDatabase {
  'nutrition.plans':
    NutritionPlanTable;

  'nutrition.plan_targets':
    NutritionPlanTargetTable;

  'nutrition.days':
    NutritionDayTable;

  'nutrition.meals':
    NutritionMealTable;

  'nutrition.foods':
    NutritionFoodTable;

  'nutrition.meal_items':
    NutritionMealItemTable;

  'nutrition.meal_item_quantities':
    NutritionMealItemQuantityTable;
}

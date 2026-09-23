import type {
  DayRepository,
} from './day-repository.port.js';

import type {
  FoodRepository,
} from './food-repository.port.js';

import type {
  MealItemRepository,
} from './meal-item-repository.port.js';

import type {
  MealRepository,
} from './meal-repository.port.js';

import type {
  PlanRepository,
} from './plan-repository.port.js';

import type {
  PlanTargetRepository,
} from './plan-target-repository.port.js';

import type {
  MealItemActualRepository,
} from './meal-item-actual-repository.port.js';

export interface NutritionRepositories {
  days:
    DayRepository;

  foods:
    FoodRepository;

  meals:
    MealRepository;

  mealItems:
    MealItemRepository;

  mealItemActuals:
    MealItemActualRepository;

  plans:
    PlanRepository;

  planTargets:
    PlanTargetRepository;
}

export interface NutritionUnitOfWork {
  execute<T>(
    work: (
      repositories:
        NutritionRepositories,
    ) => Promise<T>,
  ): Promise<T>;
}

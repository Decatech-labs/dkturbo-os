import type {
  DayRepository,
} from './day-repository.port.js';

import type {
  FoodRepository,
} from './food-repository.port.js';

import type {
  FoodPreparationConversionRepository,
} from './food-preparation-conversion-repository.port.js';

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

import type {
  PersonAccessRepository,
} from './person-access-repository.port.js';

export interface NutritionRepositories {
  days:
    DayRepository;

  foods:
    FoodRepository;

  foodPreparationConversions:
    FoodPreparationConversionRepository;

  meals:
    MealRepository;

  mealItems:
    MealItemRepository;

  mealItemActuals:
    MealItemActualRepository;

  personAccess:
    PersonAccessRepository;

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

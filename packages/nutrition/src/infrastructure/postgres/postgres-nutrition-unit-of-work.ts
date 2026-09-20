import type {
  Kysely,
} from 'kysely';

import type {
  NutritionRepositories,
  NutritionUnitOfWork,
} from '../../ports/index.js';

import type {
  NutritionDatabase,
} from './database.js';

import {
  PostgresFoodRepository,
} from './postgres-food.repository.js';

import {
  PostgresPlanRepository,
} from './postgres-plan.repository.js';

import {
  PostgresDayRepository,
} from './postgres-day.repository.js';

import {
  PostgresPlanTargetRepository,
} from './postgres-plan-target.repository.js';

import {
  PostgresMealItemRepository,
} from './postgres-meal-item.repository.js';

import {
  PostgresMealRepository,
} from './postgres-meal.repository.js';

export class PostgresNutritionUnitOfWork
implements NutritionUnitOfWork {

  public constructor(
    private readonly db:
      Kysely<NutritionDatabase>,
  ) {}

  public execute<T>(
    work: (
      repositories:
        NutritionRepositories,
    ) => Promise<T>,
  ): Promise<T> {

    return this.db
      .transaction()
      .execute(
        async (
          transaction,
        ): Promise<T> =>
          work({
            days:
              new PostgresDayRepository(
                transaction,
              ),

            foods:
              new PostgresFoodRepository(
                transaction,
              ),

            meals:
              new PostgresMealRepository(
                transaction,
              ),

            mealItems:
              new PostgresMealItemRepository(
                transaction,
              ),

            plans:
              new PostgresPlanRepository(
                transaction,
              ),

            planTargets:
              new PostgresPlanTargetRepository(
                transaction,
              ),
          }),
      );
  }
}

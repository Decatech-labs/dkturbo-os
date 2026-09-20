import type {
  Kysely,
} from 'kysely';

import type {
  NutritionDatabase,
} from '../infrastructure/postgres/database.js';

import {
  PostgresNutritionUnitOfWork,
} from '../infrastructure/postgres/postgres-nutrition-unit-of-work.js';

export interface CreateNutritionOptions {
  database:
    Kysely<NutritionDatabase>;
}

export const createNutrition =
  ({
    database,
  }: CreateNutritionOptions) => {

    const unitOfWork =
      new PostgresNutritionUnitOfWork(
        database,
      );

    return {
      unitOfWork,
    };
  };

export type Nutrition =
  ReturnType<
    typeof createNutrition
  >;

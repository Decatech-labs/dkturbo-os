import {
  Kysely,
  PostgresDialect,
} from 'kysely';

import {
  Pool,
} from 'pg';

import type {
  NutritionDatabase,
} from './database.js';

export interface CreateNutritionDatabaseOptions {
  connectionString:
    string;
}

export const createNutritionDatabase =
  ({
    connectionString,
  }: CreateNutritionDatabaseOptions):
    Kysely<NutritionDatabase> => {

    const dialect =
      new PostgresDialect({
        pool:
          new Pool({
            connectionString,
          }),
      });

    return new Kysely<NutritionDatabase>({
      dialect,
    });
  };

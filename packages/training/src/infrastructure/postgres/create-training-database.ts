import {
  Kysely,
  PostgresDialect,
} from 'kysely';

import {
  Pool,
} from 'pg';

import type {
  TrainingDatabase,
} from './database.js';

export interface CreateTrainingDatabaseOptions {
  connectionString:
    string;
}

export const createTrainingDatabase =
  ({
    connectionString,
  }: CreateTrainingDatabaseOptions):
    Kysely<TrainingDatabase> => {

    const dialect =
      new PostgresDialect({
        pool:
          new Pool({
            connectionString,
          }),
      });

    return new Kysely<TrainingDatabase>({
      dialect,
    });
  };

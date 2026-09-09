import type {
  Kysely,
} from 'kysely';

import type {
  TrainingDatabase,
} from '../infrastructure/postgres/database.js';

import {
  PostgresTrainingUnitOfWork,
} from '../infrastructure/postgres/postgres-training-unit-of-work.js';

export interface CreateTrainingOptions {
  database:
    Kysely<TrainingDatabase>;
}

export const createTraining =
  ({
    database,
  }: CreateTrainingOptions) => {

    const unitOfWork =
      new PostgresTrainingUnitOfWork(
        database,
      );

    return {
      unitOfWork,
    };
  };

export type Training =
  ReturnType<
    typeof createTraining
  >;

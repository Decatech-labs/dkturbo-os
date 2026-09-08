import type {
  Kysely,
} from 'kysely';

import type {
  TrainingRepositories,
  TrainingUnitOfWork,
} from '../../ports/index.js';

import type {
  TrainingDatabase,
} from './database.js';

import {
  PostgresAthleteRepository,
} from './postgres-athlete.repository.js';

import {
  PostgresWeekRepository,
} from './postgres-week.repository.js';

export class PostgresTrainingUnitOfWork
implements TrainingUnitOfWork {

  public constructor(
    private readonly db:
      Kysely<TrainingDatabase>,
  ) {}

  public execute<T>(
    work: (
      repositories:
        TrainingRepositories,
    ) => Promise<T>,
  ): Promise<T> {

    return this.db
      .transaction()
      .execute(
        async (
          transaction,
        ): Promise<T> =>
          work({
            athletes:
              new PostgresAthleteRepository(
                transaction,
              ),

            weeks:
              new PostgresWeekRepository(
                transaction,
              ),
          }),
      );
  }
}

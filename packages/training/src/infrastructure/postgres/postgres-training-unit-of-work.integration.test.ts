import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  Kysely,
  PostgresDialect,
} from 'kysely';

import {
  Pool,
} from 'pg';

import type {
  DkturboUserId,
} from '../../domain/index.js';

import {
  createAthleteProfile,
} from '../../application/index.js';

import type {
  TrainingDatabase,
} from './database.js';

import {
  PostgresTrainingUnitOfWork,
} from './postgres-training-unit-of-work.js';

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required for Training integration tests',
  );
}

const testUserId =
  '10000000-0000-4000-8000-000000000099' as DkturboUserId;

describe(
  'PostgresTrainingUnitOfWork',
  () => {

    let db:
      Kysely<TrainingDatabase>;

    beforeAll(
      async () => {

        db =
          new Kysely<TrainingDatabase>({
            dialect:
              new PostgresDialect({
                pool:
                  new Pool({
                    connectionString:
                      databaseUrl,
                  }),
              }),
          });

        await db
          .deleteFrom(
            'training.athlete_access',
          )
          .where(
            'user_id',
            '=',
            testUserId,
          )
          .execute();

        await db
          .deleteFrom(
            'training.athletes',
          )
          .where(
            'display_name',
            '=',
            'Atomicity Test Athlete',
          )
          .execute();
      },
    );

    afterAll(
      async () => {

        await db
          .deleteFrom(
            'training.athlete_access',
          )
          .where(
            'user_id',
            '=',
            testUserId,
          )
          .execute();

        await db
          .deleteFrom(
            'training.athletes',
          )
          .where(
            'display_name',
            '=',
            'Atomicity Test Athlete',
          )
          .execute();

        await db.destroy();
      },
    );

    it(
      'rolls back athlete creation when SELF access creation fails',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        await expect(
          createAthleteProfile(
            unitOfWork,
            {
              userId:
                testUserId,

              displayName:
                'Atomicity Test Athlete',
            },
          ),
        ).rejects.toThrow();

        const persistedAthlete =
          await db
            .selectFrom(
              'training.athletes',
            )
            .select([
              'id',
              'display_name',
            ])
            .where(
              'display_name',
              '=',
              'Atomicity Test Athlete',
            )
            .executeTakeFirst();

        expect(
          persistedAthlete,
        ).toBeUndefined();
      },
    );
  },
);

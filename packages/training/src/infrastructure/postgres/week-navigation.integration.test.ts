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
  sql,
} from 'kysely';

import {
  Pool,
} from 'pg';

import {
  getWeekDetail,
  listWeeksForAthlete,
} from '../../application/index.js';

import type {
  AthleteId,
  DkturboUserId,
  TrainingWeekId,
} from '../../domain/index.js';

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

/*
 * Dedicated e* namespace.
 * Existing Training/API suites use other prefixes,
 * so Vitest can execute concurrently safely.
 */
const coachUserId =
  'e1000000-0000-4000-8000-000000000001' as DkturboUserId;

const viewerUserId =
  'e1000000-0000-4000-8000-000000000002' as DkturboUserId;

const athleteId =
  'e2000000-0000-4000-8000-000000000001' as AthleteId;

const currentWeekId =
  'e3000000-0000-4000-8000-000000000001' as TrainingWeekId;

const nextWeekId =
  'e3000000-0000-4000-8000-000000000002' as TrainingWeekId;

const dayIds = [
  'e4000000-0000-4000-8000-000000000001',
  'e4000000-0000-4000-8000-000000000002',
  'e4000000-0000-4000-8000-000000000003',
  'e4000000-0000-4000-8000-000000000004',
  'e4000000-0000-4000-8000-000000000005',
  'e4000000-0000-4000-8000-000000000006',
  'e4000000-0000-4000-8000-000000000007',
] as const;

const earlySessionId =
  'e5000000-0000-4000-8000-000000000001';

const lateSessionId =
  'e5000000-0000-4000-8000-000000000002';

const secondDaySessionId =
  'e5000000-0000-4000-8000-000000000003';

describe(
  'Training week navigation PostgreSQL integration',
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

        /*
         * Defensive cleanup from interrupted executions.
         */
        await db
          .deleteFrom(
            'training.athletes',
          )
          .where(
            'id',
            '=',
            athleteId,
          )
          .execute();

        await sql`
          delete from identity.users
          where id in (
            ${coachUserId},
            ${viewerUserId}
          )
        `.execute(
          db,
        );

        /*
         * Platform identities.
         */
        await sql`
          insert into identity.users (
            id,
            name,
            role,
            created_at
          )
          values
          (
            ${coachUserId},
            'Week Navigation Coach',
            'member',
            current_timestamp
          ),
          (
            ${viewerUserId},
            'Week Navigation Viewer',
            'member',
            current_timestamp
          )
        `.execute(
          db,
        );

        /*
         * Athlete and explicit Training access.
         */
        await db
          .insertInto(
            'training.athletes',
          )
          .values({
            id:
              athleteId,

            display_name:
              'Week Navigation Athlete',
          })
          .execute();

        await db
          .insertInto(
            'training.athlete_access',
          )
          .values([
            {
              athlete_id:
                athleteId,

              user_id:
                coachUserId,

              role:
                'COACH',
            },
            {
              athlete_id:
                athleteId,

              user_id:
                viewerUserId,

              role:
                'VIEWER',
            },
          ])
          .execute();

        /*
         * Insert weeks deliberately out of chronological order.
         *
         * Repository must return newest first.
         */
        await db
          .insertInto(
            'training.weeks',
          )
          .values([
            {
              id:
                currentWeekId,

              athlete_id:
                athleteId,

              week_start:
                '2026-09-07',

              status:
                'IN_PROGRESS',

              title:
                'Semana actual',

              notes:
                'Semana detallada',

              created_by_user_id:
                coachUserId,
            },
            {
              id:
                nextWeekId,

              athlete_id:
                athleteId,

              week_start:
                '2026-09-14',

              status:
                'PLANNED',

              title:
                'Semana siguiente',

              notes:
                null,

              created_by_user_id:
                coachUserId,
            },
          ])
          .execute();

        /*
         * Seven days inserted deliberately out of order.
         *
         * listDaysForWeek() must return chronological order.
         */
        await db
          .insertInto(
            'training.days',
          )
          .values([
            {
              id:
                dayIds[6],

              week_id:
                currentWeekId,

              athlete_id:
                athleteId,

              date:
                '2026-09-13',

              notes:
                null,
            },
            {
              id:
                dayIds[2],

              week_id:
                currentWeekId,

              athlete_id:
                athleteId,

              date:
                '2026-09-09',

              notes:
                null,
            },
            {
              id:
                dayIds[0],

              week_id:
                currentWeekId,

              athlete_id:
                athleteId,

              date:
                '2026-09-07',

              notes:
                'Lunes',
            },
            {
              id:
                dayIds[4],

              week_id:
                currentWeekId,

              athlete_id:
                athleteId,

              date:
                '2026-09-11',

              notes:
                null,
            },
            {
              id:
                dayIds[1],

              week_id:
                currentWeekId,

              athlete_id:
                athleteId,

              date:
                '2026-09-08',

              notes:
                null,
            },
            {
              id:
                dayIds[5],

              week_id:
                currentWeekId,

              athlete_id:
                athleteId,

              date:
                '2026-09-12',

              notes:
                null,
            },
            {
              id:
                dayIds[3],

              week_id:
                currentWeekId,

              athlete_id:
                athleteId,

              date:
                '2026-09-10',

              notes:
                null,
            },
          ])
          .execute();

        /*
         * Monday sessions inserted in reverse time order.
         *
         * listForDay() must return 09:00 before 18:00.
         */
        await db
          .insertInto(
            'training.sessions',
          )
          .values([
            {
              id:
                lateSessionId,

              day_id:
                dayIds[0],

              athlete_id:
                athleteId,

              type:
                'STRENGTH',

              title:
                'Gimnasio tarde',

              planned_start_time:
                '18:00',

              planned_duration_minutes:
                75,

              actual_start_time:
                null,

              actual_duration_minutes:
                null,

              status:
                'PLANNED',

              planned_notes:
                null,

              actual_notes:
                null,

              planned_rpe:
                '8',

              actual_rpe:
                null,

              source:
                'MANUAL',

              external_id:
                null,

              created_by_user_id:
                coachUserId,
            },
            {
              id:
                earlySessionId,

              day_id:
                dayIds[0],

              athlete_id:
                athleteId,

              type:
                'SWIMMING',

              title:
                'Piscina mañana',

              planned_start_time:
                '09:00',

              planned_duration_minutes:
                60,

              actual_start_time:
                null,

              actual_duration_minutes:
                null,

              status:
                'PLANNED',

              planned_notes:
                null,

              actual_notes:
                null,

              planned_rpe:
                '5',

              actual_rpe:
                null,

              source:
                'MANUAL',

              external_id:
                null,

              created_by_user_id:
                coachUserId,
            },
            {
              id:
                secondDaySessionId,

              day_id:
                dayIds[1],

              athlete_id:
                athleteId,

              type:
                'REHAB',

              title:
                'Rehabilitación',

              planned_start_time:
                '11:00',

              planned_duration_minutes:
                45,

              actual_start_time:
                null,

              actual_duration_minutes:
                null,

              status:
                'PLANNED',

              planned_notes:
                null,

              actual_notes:
                null,

              planned_rpe:
                '4',

              actual_rpe:
                null,

              source:
                'MANUAL',

              external_id:
                null,

              created_by_user_id:
                coachUserId,
            },
          ])
          .execute();
      },
    );

    afterAll(
      async () => {

        /*
         * Athlete deletion cascades through
         * access, weeks, days and sessions.
         */
        await db
          .deleteFrom(
            'training.athletes',
          )
          .where(
            'id',
            '=',
            athleteId,
          )
          .execute();

        await sql`
          delete from identity.users
          where id in (
            ${coachUserId},
            ${viewerUserId}
          )
        `.execute(
          db,
        );

        await db.destroy();
      },
    );

    it(
      'lists athlete weeks newest first with write access for a coach',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        const result =
          await listWeeksForAthlete(
            unitOfWork,
            {
              athleteId,

              userId:
                coachUserId,
            },
          );

        expect(
          result,
        ).toHaveLength(
          2,
        );

        expect(
          result.map(
            ({
              week,
            }) =>
              week.weekStart,
          ),
        ).toEqual([
          '2026-09-14',
          '2026-09-07',
        ]);

        expect(
          result.map(
            ({
              week,
            }) =>
              week.title,
          ),
        ).toEqual([
          'Semana siguiente',
          'Semana actual',
        ]);

        expect(
          result.every(
            ({
              accessRole,
            }) =>
              accessRole ===
              'COACH',
          ),
        ).toBe(
          true,
        );

        expect(
          result.every(
            ({
              canWrite,
            }) =>
              canWrite,
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      'returns ordered week detail to a viewer as read-only',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        const result =
          await getWeekDetail(
            unitOfWork,
            {
              athleteId,

              weekId:
                currentWeekId,

              userId:
                viewerUserId,
            },
          );

        expect(
          result.accessRole,
        ).toBe(
          'VIEWER',
        );

        expect(
          result.canWrite,
        ).toBe(
          false,
        );

        expect(
          result.week.id,
        ).toBe(
          currentWeekId,
        );

        expect(
          result.week.title,
        ).toBe(
          'Semana actual',
        );

        /*
         * Seven chronological days.
         */
        expect(
          result.days,
        ).toHaveLength(
          7,
        );

        expect(
          result.days.map(
            ({
              day,
            }) =>
              day.date,
          ),
        ).toEqual([
          '2026-09-07',
          '2026-09-08',
          '2026-09-09',
          '2026-09-10',
          '2026-09-11',
          '2026-09-12',
          '2026-09-13',
        ]);

        /*
         * Monday sessions ordered by planned start.
         */
        expect(
          result.days[0]
            ?.sessions
            .map(
              ({
                title,
              }) =>
                title,
            ),
        ).toEqual([
          'Piscina mañana',
          'Gimnasio tarde',
        ]);

        expect(
          result.days[0]
            ?.sessions
            .map(
              ({
                plannedStartTime,
              }) =>
                plannedStartTime,
            ),
        ).toEqual([
          '09:00',
          '18:00',
        ]);

        expect(
          result.days[1]
            ?.sessions[0]
            ?.title,
        ).toBe(
          'Rehabilitación',
        );

        /*
         * Days without sessions remain present.
         */
        expect(
          result.days[2]
            ?.sessions,
        ).toEqual([]);

        expect(
          result.days[6]
            ?.sessions,
        ).toEqual([]);
      },
    );
  },
);

import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {

  await sql`
    create schema if not exists training
  `.execute(db);

  await db.schema
    .withSchema('training')
    .createTable('athletes')
    .addColumn(
      'id',
      'uuid',
      (column) =>
        column
          .primaryKey()
          .notNull()
          .defaultTo(
            sql`pg_catalog.gen_random_uuid()`,
          ),
    )
    .addColumn(
      'display_name',
      'text',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'created_at',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .execute();

  await db.schema
    .withSchema('training')
    .createTable('athlete_access')
    .addColumn(
      'id',
      'uuid',
      (column) =>
        column
          .primaryKey()
          .notNull()
          .defaultTo(
            sql`pg_catalog.gen_random_uuid()`,
          ),
    )
    .addColumn(
      'athlete_id',
      'uuid',
      (column) =>
        column
          .notNull()
          .references(
            'training.athletes.id',
          )
          .onDelete('cascade'),
    )
    .addColumn(
      'user_id',
      'uuid',
      (column) =>
        column
          .notNull()
          .references(
            'identity.users.id',
          )
          .onDelete('cascade'),
    )
    .addColumn(
      'role',
      'text',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'created_at',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addUniqueConstraint(
      'athlete_access_athlete_user_unique',
      [
        'athlete_id',
        'user_id',
      ],
    )
    .addCheckConstraint(
      'athlete_access_role_check',
      sql`
        role in (
          'SELF',
          'COACH',
          'VIEWER'
        )
      `,
    )
    .execute();

  await db.schema
    .withSchema('training')
    .createTable('weeks')
    .addColumn(
      'id',
      'uuid',
      (column) =>
        column
          .primaryKey()
          .notNull()
          .defaultTo(
            sql`pg_catalog.gen_random_uuid()`,
          ),
    )
    .addColumn(
      'athlete_id',
      'uuid',
      (column) =>
        column
          .notNull()
          .references(
            'training.athletes.id',
          )
          .onDelete('cascade'),
    )
    .addColumn(
      'week_start',
      'date',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'status',
      'text',
      (column) =>
        column
          .notNull()
          .defaultTo('DRAFT'),
    )
    .addColumn(
      'title',
      'text',
    )
    .addColumn(
      'notes',
      'text',
    )
    .addColumn(
      'created_by_user_id',
      'uuid',
      (column) =>
        column
          .notNull()
          .references(
            'identity.users.id',
          ),
    )
    .addColumn(
      'created_at',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addUniqueConstraint(
      'weeks_athlete_week_start_unique',
      [
        'athlete_id',
        'week_start',
      ],
    )
    .addUniqueConstraint(
      'weeks_id_athlete_unique',
      [
        'id',
        'athlete_id',
      ],
    )
    .addCheckConstraint(
      'weeks_status_check',
      sql`
        status in (
          'DRAFT',
          'PLANNED',
          'IN_PROGRESS',
          'COMPLETED',
          'SUBMITTED',
          'CLOSED'
        )
      `,
    )
    .addCheckConstraint(
      'weeks_start_monday_check',
      sql`
        extract(
          isodow
          from week_start
        ) = 1
      `,
    )
    .execute();

  await db.schema
    .withSchema('training')
    .createTable('days')
    .addColumn(
      'id',
      'uuid',
      (column) =>
        column
          .primaryKey()
          .notNull()
          .defaultTo(
            sql`pg_catalog.gen_random_uuid()`,
          ),
    )
    .addColumn(
      'week_id',
      'uuid',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'athlete_id',
      'uuid',
      (column) =>
        column
          .notNull()
          .references(
            'training.athletes.id',
          )
          .onDelete('cascade'),
    )
    .addColumn(
      'date',
      'date',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'notes',
      'text',
    )
    .addColumn(
      'created_at',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addUniqueConstraint(
      'days_athlete_date_unique',
      [
        'athlete_id',
        'date',
      ],
    )
    .addUniqueConstraint(
      'days_id_athlete_unique',
      [
        'id',
        'athlete_id',
      ],
    )
    .addForeignKeyConstraint(
      'days_week_athlete_fkey',
      [
        'week_id',
        'athlete_id',
      ],
      'training.weeks',
      [
        'id',
        'athlete_id',
      ],
      (constraint) =>
        constraint.onDelete(
          'cascade',
        ),
    )
    .execute();

  await db.schema
    .withSchema('training')
    .createTable('sessions')
    .addColumn(
      'id',
      'uuid',
      (column) =>
        column
          .primaryKey()
          .notNull()
          .defaultTo(
            sql`pg_catalog.gen_random_uuid()`,
          ),
    )
    .addColumn(
      'day_id',
      'uuid',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'athlete_id',
      'uuid',
      (column) =>
        column
          .notNull()
          .references(
            'training.athletes.id',
          )
          .onDelete('cascade'),
    )
    .addColumn(
      'type',
      'text',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'title',
      'text',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'planned_start_time',
      'time',
    )
    .addColumn(
      'planned_duration_minutes',
      'integer',
    )
    .addColumn(
      'actual_start_time',
      'time',
    )
    .addColumn(
      'actual_duration_minutes',
      'integer',
    )
    .addColumn(
      'status',
      'text',
      (column) =>
        column
          .notNull()
          .defaultTo('PLANNED'),
    )
    .addColumn(
      'planned_notes',
      'text',
    )
    .addColumn(
      'actual_notes',
      'text',
    )
    .addColumn(
      'planned_rpe',
      'numeric',
    )
    .addColumn(
      'actual_rpe',
      'numeric',
    )
    .addColumn(
      'source',
      'text',
      (column) =>
        column
          .notNull()
          .defaultTo('MANUAL'),
    )
    .addColumn(
      'external_id',
      'text',
    )
    .addColumn(
      'created_by_user_id',
      'uuid',
      (column) =>
        column
          .notNull()
          .references(
            'identity.users.id',
          ),
    )
    .addColumn(
      'created_at',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addForeignKeyConstraint(
      'sessions_day_athlete_fkey',
      [
        'day_id',
        'athlete_id',
      ],
      'training.days',
      [
        'id',
        'athlete_id',
      ],
      (constraint) =>
        constraint.onDelete(
          'cascade',
        ),
    )
    .addCheckConstraint(
      'sessions_type_check',
      sql`
        type in (
          'RUNNING',
          'STRENGTH',
          'SWIMMING',
          'CYCLING',
          'POLE_VAULT',
          'JUMPS',
          'THROWS',
          'TECHNIQUE',
          'REHAB',
          'MOBILITY',
          'OTHER'
        )
      `,
    )
    .addCheckConstraint(
      'sessions_status_check',
      sql`
        status in (
          'PLANNED',
          'COMPLETED',
          'PARTIAL',
          'SKIPPED',
          'CANCELLED'
        )
      `,
    )
    .addCheckConstraint(
      'sessions_source_check',
      sql`
        source in (
          'MANUAL',
          'GARMIN',
          'FIT',
          'TCX',
          'APPLE_HEALTH',
          'IMPORT'
        )
      `,
    )
    .addCheckConstraint(
      'sessions_planned_duration_check',
      sql`
        planned_duration_minutes
          is null
        or
        planned_duration_minutes >= 0
      `,
    )
    .addCheckConstraint(
      'sessions_actual_duration_check',
      sql`
        actual_duration_minutes
          is null
        or
        actual_duration_minutes >= 0
      `,
    )
    .addCheckConstraint(
      'sessions_planned_rpe_check',
      sql`
        planned_rpe is null
        or (
          planned_rpe >= 0
          and planned_rpe <= 10
        )
      `,
    )
    .addCheckConstraint(
      'sessions_actual_rpe_check',
      sql`
        actual_rpe is null
        or (
          actual_rpe >= 0
          and actual_rpe <= 10
        )
      `,
    )
    .execute();

}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {

  await db.schema
    .withSchema('training')
    .dropTable('sessions')
    .execute();

  await db.schema
    .withSchema('training')
    .dropTable('days')
    .execute();

  await db.schema
    .withSchema('training')
    .dropTable('weeks')
    .execute();

  await db.schema
    .withSchema('training')
    .dropTable('athlete_access')
    .execute();

  await db.schema
    .withSchema('training')
    .dropTable('athletes')
    .execute();

  await sql`
    drop schema if exists training
  `.execute(db);

}

import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {

  /*
   * Candidate key required by the composite FK from
   * session_blocks.
   */
  await db.schema
    .withSchema('training')
    .alterTable('sessions')
    .addUniqueConstraint(
      'sessions_id_athlete_unique',
      [
        'id',
        'athlete_id',
      ],
    )
    .execute();

  await db.schema
    .withSchema('training')
    .createTable('session_blocks')
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
      'session_id',
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
      'position',
      'integer',
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
      'session_blocks_session_position_unique',
      [
        'session_id',
        'position',
      ],
    )
    .addUniqueConstraint(
      'session_blocks_id_session_athlete_unique',
      [
        'id',
        'session_id',
        'athlete_id',
      ],
    )
    .addForeignKeyConstraint(
      'session_blocks_session_athlete_fkey',
      [
        'session_id',
        'athlete_id',
      ],
      'training.sessions',
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
      'session_blocks_position_check',
      sql`
        position >= 0
      `,
    )
    .execute();

  await db.schema
    .withSchema('training')
    .createTable('exercise_catalog')
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
      'name',
      'text',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'category',
      'text',
    )
    .addColumn(
      'sport',
      'text',
    )
    .addColumn(
      'metric_profile',
      'text',
      (column) =>
        column
          .notNull()
          .defaultTo(
            'GENERIC',
          ),
    )
    .addColumn(
      'origin',
      'text',
      (column) =>
        column
          .notNull()
          .defaultTo(
            'CUSTOM',
          ),
    )
    .addColumn(
      'created_by_user_id',
      'uuid',
      (column) =>
        column.references(
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
    .addColumn(
      'archived_at',
      'timestamptz',
    )
    .addCheckConstraint(
      'exercise_catalog_metric_profile_check',
      sql`
        metric_profile in (
          'STRENGTH',
          'INTERVAL',
          'CONTINUOUS',
          'ATTEMPT_DISTANCE',
          'ATTEMPT_HEIGHT',
          'REHAB',
          'GENERIC'
        )
      `,
    )
    .addCheckConstraint(
      'exercise_catalog_origin_check',
      sql`
        origin in (
          'SYSTEM',
          'CUSTOM'
        )
      `,
    )
    .addCheckConstraint(
      'exercise_catalog_creator_check',
      sql`
        (
          origin = 'SYSTEM'
          and created_by_user_id is null
        )
        or
        (
          origin = 'CUSTOM'
          and created_by_user_id is not null
        )
      `,
    )
    .execute();

  await db.schema
    .withSchema('training')
    .createTable('session_exercises')
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
      'block_id',
      'uuid',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'session_id',
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
      'exercise_id',
      'uuid',
      (column) =>
        column
          .notNull()
          .references(
            'training.exercise_catalog.id',
          ),
    )
    .addColumn(
      'position',
      'integer',
      (column) =>
        column.notNull(),
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
      'session_exercises_block_position_unique',
      [
        'block_id',
        'position',
      ],
    )
    .addUniqueConstraint(
      'session_exercises_id_athlete_unique',
      [
        'id',
        'athlete_id',
      ],
    )
    .addForeignKeyConstraint(
      'session_exercises_block_session_athlete_fkey',
      [
        'block_id',
        'session_id',
        'athlete_id',
      ],
      'training.session_blocks',
      [
        'id',
        'session_id',
        'athlete_id',
      ],
      (constraint) =>
        constraint.onDelete(
          'cascade',
        ),
    )
    .addCheckConstraint(
      'session_exercises_position_check',
      sql`
        position >= 0
      `,
    )
    .execute();

  await db.schema
    .withSchema('training')
    .createTable('performance_entries')
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
      'session_exercise_id',
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
      'position',
      'integer',
      (column) =>
        column.notNull(),
    )

    /*
     * Common typed metrics.
     *
     * Planned and actual are deliberately separate.
     */
    .addColumn(
      'planned_reps',
      'integer',
    )
    .addColumn(
      'actual_reps',
      'integer',
    )
    .addColumn(
      'planned_load_kg',
      'numeric',
    )
    .addColumn(
      'actual_load_kg',
      'numeric',
    )
    .addColumn(
      'planned_distance_m',
      'numeric',
    )
    .addColumn(
      'actual_distance_m',
      'numeric',
    )
    .addColumn(
      'planned_duration_ms',
      'integer',
    )
    .addColumn(
      'actual_duration_ms',
      'integer',
    )
    .addColumn(
      'planned_result_m',
      'numeric',
    )
    .addColumn(
      'actual_result_m',
      'numeric',
    )
    .addColumn(
      'planned_height_m',
      'numeric',
    )
    .addColumn(
      'actual_height_m',
      'numeric',
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
      'planned_rir',
      'numeric',
    )
    .addColumn(
      'actual_rir',
      'numeric',
    )
    .addColumn(
      'planned_rest_seconds',
      'integer',
    )
    .addColumn(
      'actual_rest_seconds',
      'integer',
    )
    .addColumn(
      'actual_success',
      'boolean',
    )
    .addColumn(
      'actual_is_foul',
      'boolean',
    )

    /*
     * Escape hatch for uncommon metrics.
     *
     * Core analytics should prefer the typed columns above.
     */
    .addColumn(
      'planned_metrics',
      'jsonb',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`'{}'::jsonb`,
          ),
    )
    .addColumn(
      'actual_metrics',
      'jsonb',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`'{}'::jsonb`,
          ),
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
      'performance_entries_exercise_position_unique',
      [
        'session_exercise_id',
        'position',
      ],
    )
    .addForeignKeyConstraint(
      'performance_entries_exercise_athlete_fkey',
      [
        'session_exercise_id',
        'athlete_id',
      ],
      'training.session_exercises',
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
      'performance_entries_position_check',
      sql`
        position >= 0
      `,
    )
    .addCheckConstraint(
      'performance_entries_reps_check',
      sql`
        (planned_reps is null or planned_reps >= 0)
        and
        (actual_reps is null or actual_reps >= 0)
      `,
    )
    .addCheckConstraint(
      'performance_entries_load_check',
      sql`
        (planned_load_kg is null or planned_load_kg >= 0)
        and
        (actual_load_kg is null or actual_load_kg >= 0)
      `,
    )
    .addCheckConstraint(
      'performance_entries_distance_check',
      sql`
        (planned_distance_m is null or planned_distance_m >= 0)
        and
        (actual_distance_m is null or actual_distance_m >= 0)
      `,
    )
    .addCheckConstraint(
      'performance_entries_duration_check',
      sql`
        (planned_duration_ms is null or planned_duration_ms >= 0)
        and
        (actual_duration_ms is null or actual_duration_ms >= 0)
      `,
    )
    .addCheckConstraint(
      'performance_entries_result_check',
      sql`
        (planned_result_m is null or planned_result_m >= 0)
        and
        (actual_result_m is null or actual_result_m >= 0)
      `,
    )
    .addCheckConstraint(
      'performance_entries_height_check',
      sql`
        (planned_height_m is null or planned_height_m >= 0)
        and
        (actual_height_m is null or actual_height_m >= 0)
      `,
    )
    .addCheckConstraint(
      'performance_entries_rpe_check',
      sql`
        (
          planned_rpe is null
          or (
            planned_rpe >= 0
            and planned_rpe <= 10
          )
        )
        and
        (
          actual_rpe is null
          or (
            actual_rpe >= 0
            and actual_rpe <= 10
          )
        )
      `,
    )
    .addCheckConstraint(
      'performance_entries_rir_check',
      sql`
        (planned_rir is null or planned_rir >= 0)
        and
        (actual_rir is null or actual_rir >= 0)
      `,
    )
    .addCheckConstraint(
      'performance_entries_rest_check',
      sql`
        (
          planned_rest_seconds is null
          or planned_rest_seconds >= 0
        )
        and
        (
          actual_rest_seconds is null
          or actual_rest_seconds >= 0
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
    .dropTable(
      'performance_entries',
    )
    .execute();

  await db.schema
    .withSchema('training')
    .dropTable(
      'session_exercises',
    )
    .execute();

  await db.schema
    .withSchema('training')
    .dropTable(
      'exercise_catalog',
    )
    .execute();

  await db.schema
    .withSchema('training')
    .dropTable(
      'session_blocks',
    )
    .execute();

  await db.schema
    .withSchema('training')
    .alterTable(
      'sessions',
    )
    .dropConstraint(
      'sessions_id_athlete_unique',
    )
    .execute();
}

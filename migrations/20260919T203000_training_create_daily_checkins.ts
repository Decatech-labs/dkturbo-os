import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {

  await db.schema
    .withSchema('training')
    .createTable('daily_checkins')
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
      'date',
      'date',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'weight_kg',
      'numeric(6, 2)',
    )
    .addColumn(
      'sleep_quality',
      'smallint',
    )
    .addColumn(
      'fatigue',
      'smallint',
    )
    .addColumn(
      'soreness',
      'smallint',
    )
    .addColumn(
      'stress',
      'smallint',
    )
    .addColumn(
      'motivation',
      'smallint',
    )
    .addColumn(
      'notes',
      'text',
    )
    .addColumn(
      'recorded_by_user_id',
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
      'daily_checkins_athlete_date_unique',
      [
        'athlete_id',
        'date',
      ],
    )
    .addCheckConstraint(
      'daily_checkins_weight_check',
      sql`
        weight_kg is null
        or (
          weight_kg > 0
          and weight_kg <= 500
        )
      `,
    )
    .addCheckConstraint(
      'daily_checkins_sleep_quality_check',
      sql`
        sleep_quality is null
        or sleep_quality between 1 and 5
      `,
    )
    .addCheckConstraint(
      'daily_checkins_fatigue_check',
      sql`
        fatigue is null
        or fatigue between 1 and 5
      `,
    )
    .addCheckConstraint(
      'daily_checkins_soreness_check',
      sql`
        soreness is null
        or soreness between 1 and 5
      `,
    )
    .addCheckConstraint(
      'daily_checkins_stress_check',
      sql`
        stress is null
        or stress between 1 and 5
      `,
    )
    .addCheckConstraint(
      'daily_checkins_motivation_check',
      sql`
        motivation is null
        or motivation between 1 and 5
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
      'daily_checkins',
    )
    .execute();
}

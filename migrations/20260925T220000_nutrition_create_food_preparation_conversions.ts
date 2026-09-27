import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db:
    Kysely<unknown>,
): Promise<void> {

  await db.schema
    .createTable(
      'nutrition.food_preparation_conversions',
    )
    .addColumn(
      'id',
      'uuid',
      column =>
        column
          .primaryKey()
          .defaultTo(
            sql`pg_catalog.gen_random_uuid()`,
          ),
    )
    .addColumn(
      'food_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'nutrition.foods.id',
          )
          .onDelete(
            'cascade',
          ),
    )
    .addColumn(
      'name',
      'text',
      column =>
        column.notNull(),
    )
    .addColumn(
      'raw_amount',
      'numeric(12, 3)',
      column =>
        column.notNull(),
    )
    .addColumn(
      'prepared_amount',
      'numeric(12, 3)',
      column =>
        column.notNull(),
    )
    .addColumn(
      'prepared_unit',
      'text',
      column =>
        column.notNull(),
    )
    .addColumn(
      'is_default',
      'boolean',
      column =>
        column
          .notNull()
          .defaultTo(
            false,
          ),
    )
    .addColumn(
      'created_at',
      'timestamptz',
      column =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      column =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addUniqueConstraint(
      'nutrition_food_preparation_conversions_food_name_unique',
      [
        'food_id',
        'name',
      ],
    )
    .addCheckConstraint(
      'nutrition_food_preparation_conversions_name_check',
      sql`
        length(trim(name)) > 0
      `,
    )
    .addCheckConstraint(
      'nutrition_food_preparation_conversions_raw_amount_check',
      sql`
        raw_amount > 0
      `,
    )
    .addCheckConstraint(
      'nutrition_food_preparation_conversions_prepared_amount_check',
      sql`
        prepared_amount > 0
      `,
    )
    .addCheckConstraint(
      'nutrition_food_preparation_conversions_prepared_unit_check',
      sql`
        prepared_unit IN (
          'G',
          'KG',
          'ML',
          'L',
          'UNIT'
        )
      `,
    )
    .execute();

  await db.schema
    .createIndex(
      'nutrition_food_preparation_conversions_food_idx',
    )
    .on(
      'nutrition.food_preparation_conversions',
    )
    .column(
      'food_id',
    )
    .execute();

  await sql`
    CREATE UNIQUE INDEX
      nutrition_food_preparation_conversions_default_unique
    ON nutrition.food_preparation_conversions (
      food_id
    )
    WHERE is_default = true
  `.execute(
    db,
  );
}

export async function down(
  db:
    Kysely<unknown>,
): Promise<void> {

  await db.schema
    .dropTable(
      'nutrition.food_preparation_conversions',
    )
    .ifExists()
    .execute();
}

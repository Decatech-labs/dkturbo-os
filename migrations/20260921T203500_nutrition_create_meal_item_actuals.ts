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
      'nutrition.meal_item_actuals',
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
      'day_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'nutrition.days.id',
          )
          .onDelete(
            'cascade',
          ),
    )
    .addColumn(
      'meal_item_id',
      'uuid',
      column =>
        column
          .references(
            'nutrition.meal_items.id',
          )
          .onDelete(
            'set null',
          ),
    )
    .addColumn(
      'user_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'identity.users.id',
          ),
    )
    .addColumn(
      'status',
      'text',
      column =>
        column.notNull(),
    )
    .addColumn(
      'planned_food_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'nutrition.foods.id',
          ),
    )
    .addColumn(
      'planned_quantity',
      'numeric(12, 3)',
      column =>
        column.notNull(),
    )
    .addColumn(
      'actual_food_id',
      'uuid',
      column =>
        column.references(
          'nutrition.foods.id',
        ),
    )
    .addColumn(
      'actual_quantity',
      'numeric(12, 3)',
    )
    .addColumn(
      'notes',
      'text',
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
    .addCheckConstraint(
      'nutrition_meal_item_actuals_status_check',
      sql`
        status IN (
          'EATEN',
          'SKIPPED',
          'REPLACED'
        )
      `,
    )
    .addCheckConstraint(
      'nutrition_meal_item_actuals_planned_quantity_check',
      sql`
        planned_quantity >= 0
      `,
    )
    .addCheckConstraint(
      'nutrition_meal_item_actuals_actual_quantity_check',
      sql`
        actual_quantity IS NULL
        OR actual_quantity >= 0
      `,
    )
    .addCheckConstraint(
      'nutrition_meal_item_actuals_payload_check',
      sql`
        (
          status = 'SKIPPED'
          AND actual_food_id IS NULL
          AND actual_quantity IS NULL
        )
        OR
        (
          status = 'EATEN'
          AND actual_food_id = planned_food_id
          AND actual_quantity = planned_quantity
        )
        OR
        (
          status = 'REPLACED'
          AND actual_food_id IS NOT NULL
          AND actual_quantity IS NOT NULL
        )
      `,
    )
    .execute();

  await db.schema
    .createIndex(
      'nutrition_meal_item_actuals_day_user_idx',
    )
    .on(
      'nutrition.meal_item_actuals',
    )
    .columns([
      'day_id',
      'user_id',
    ])
    .execute();

  await sql`
    CREATE UNIQUE INDEX
      nutrition_meal_item_actuals_item_user_unique
    ON nutrition.meal_item_actuals (
      meal_item_id,
      user_id
    )
    WHERE meal_item_id IS NOT NULL
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
      'nutrition.meal_item_actuals',
    )
    .ifExists()
    .execute();
}

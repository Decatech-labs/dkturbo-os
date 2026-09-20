import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db:
    Kysely<unknown>,
): Promise<void> {

  await db.schema
    .createSchema(
      'nutrition',
    )
    .ifNotExists()
    .execute();

  await db.schema
    .createTable(
      'nutrition.plans',
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
      'title',
      'text',
      column =>
        column.notNull(),
    )
    .addColumn(
      'start_date',
      'date',
      column =>
        column.notNull(),
    )
    .addColumn(
      'end_date',
      'date',
      column =>
        column.notNull(),
    )
    .addColumn(
      'status',
      'text',
      column =>
        column
          .notNull()
          .defaultTo(
            'DRAFT',
          ),
    )
    .addColumn(
      'created_by_user_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'identity.users.id',
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
    .addCheckConstraint(
      'nutrition_plans_date_range_check',
      sql`end_date >= start_date`,
    )
    .addCheckConstraint(
      'nutrition_plans_status_check',
      sql`
        status IN (
          'DRAFT',
          'ACTIVE',
          'ARCHIVED'
        )
      `,
    )
    .execute();

  await db.schema
    .createTable(
      'nutrition.plan_targets',
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
      'plan_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'nutrition.plans.id',
          )
          .onDelete(
            'cascade',
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
      'calories_kcal',
      'numeric(10, 2)',
    )
    .addColumn(
      'protein_g',
      'numeric(10, 3)',
    )
    .addColumn(
      'carbohydrates_g',
      'numeric(10, 3)',
    )
    .addColumn(
      'fat_g',
      'numeric(10, 3)',
    )
    .addColumn(
      'fiber_g',
      'numeric(10, 3)',
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
      'nutrition_plan_targets_plan_user_unique',
      [
        'plan_id',
        'user_id',
      ],
    )
    .addCheckConstraint(
      'nutrition_plan_targets_values_check',
      sql`
        (calories_kcal IS NULL OR calories_kcal >= 0)
        AND
        (protein_g IS NULL OR protein_g >= 0)
        AND
        (carbohydrates_g IS NULL OR carbohydrates_g >= 0)
        AND
        (fat_g IS NULL OR fat_g >= 0)
        AND
        (fiber_g IS NULL OR fiber_g >= 0)
      `,
    )
    .execute();

  await db.schema
    .createTable(
      'nutrition.days',
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
      'plan_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'nutrition.plans.id',
          )
          .onDelete(
            'cascade',
          ),
    )
    .addColumn(
      'date',
      'date',
      column =>
        column.notNull(),
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
    .addUniqueConstraint(
      'nutrition_days_plan_date_unique',
      [
        'plan_id',
        'date',
      ],
    )
    .execute();

  await db.schema
    .createTable(
      'nutrition.meals',
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
      'name',
      'text',
      column =>
        column.notNull(),
    )
    .addColumn(
      'planned_time',
      'time',
    )
    .addColumn(
      'position',
      'integer',
      column =>
        column.notNull(),
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
      'nutrition_meals_position_check',
      sql`position >= 0`,
    )
    .execute();

  await db.schema
    .createTable(
      'nutrition.foods',
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
      'name',
      'text',
      column =>
        column.notNull(),
    )
    .addColumn(
      'brand',
      'text',
    )
    .addColumn(
      'reference_amount',
      'numeric(12, 3)',
      column =>
        column.notNull(),
    )
    .addColumn(
      'reference_unit',
      'text',
      column =>
        column.notNull(),
    )
    .addColumn(
      'calories_kcal',
      'numeric(12, 3)',
      column =>
        column.notNull(),
    )
    .addColumn(
      'protein_g',
      'numeric(12, 3)',
      column =>
        column.notNull(),
    )
    .addColumn(
      'carbohydrates_g',
      'numeric(12, 3)',
      column =>
        column.notNull(),
    )
    .addColumn(
      'fat_g',
      'numeric(12, 3)',
      column =>
        column.notNull(),
    )
    .addColumn(
      'fiber_g',
      'numeric(12, 3)',
    )
    .addColumn(
      'created_by_user_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'identity.users.id',
          ),
    )
    .addColumn(
      'archived_at',
      'timestamptz',
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
      'nutrition_foods_reference_amount_check',
      sql`reference_amount > 0`,
    )
    .addCheckConstraint(
      'nutrition_foods_unit_check',
      sql`
        reference_unit IN (
          'G',
          'KG',
          'ML',
          'L',
          'UNIT'
        )
      `,
    )
    .addCheckConstraint(
      'nutrition_foods_nutrients_check',
      sql`
        calories_kcal >= 0
        AND protein_g >= 0
        AND carbohydrates_g >= 0
        AND fat_g >= 0
        AND (
          fiber_g IS NULL
          OR fiber_g >= 0
        )
      `,
    )
    .execute();

  await db.schema
    .createTable(
      'nutrition.meal_items',
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
      'meal_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'nutrition.meals.id',
          )
          .onDelete(
            'cascade',
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
          ),
    )
    .addColumn(
      'position',
      'integer',
      column =>
        column.notNull(),
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
      'nutrition_meal_items_position_check',
      sql`position >= 0`,
    )
    .execute();

  await db.schema
    .createTable(
      'nutrition.meal_item_quantities',
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
      'meal_item_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'nutrition.meal_items.id',
          )
          .onDelete(
            'cascade',
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
      'quantity',
      'numeric(12, 3)',
      column =>
        column.notNull(),
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
      'nutrition_meal_item_quantities_item_user_unique',
      [
        'meal_item_id',
        'user_id',
      ],
    )
    .addCheckConstraint(
      'nutrition_meal_item_quantities_quantity_check',
      sql`quantity >= 0`,
    )
    .execute();

  await db.schema
    .createIndex(
      'nutrition_meals_day_position_idx',
    )
    .on(
      'nutrition.meals',
    )
    .columns([
      'day_id',
      'position',
    ])
    .execute();

  await db.schema
    .createIndex(
      'nutrition_meal_items_meal_position_idx',
    )
    .on(
      'nutrition.meal_items',
    )
    .columns([
      'meal_id',
      'position',
    ])
    .execute();

  await db.schema
    .createIndex(
      'nutrition_foods_name_idx',
    )
    .on(
      'nutrition.foods',
    )
    .column(
      'name',
    )
    .execute();
}

export async function down(
  db:
    Kysely<unknown>,
): Promise<void> {

  await db.schema
    .dropTable(
      'nutrition.meal_item_quantities',
    )
    .ifExists()
    .execute();

  await db.schema
    .dropTable(
      'nutrition.meal_items',
    )
    .ifExists()
    .execute();

  await db.schema
    .dropTable(
      'nutrition.foods',
    )
    .ifExists()
    .execute();

  await db.schema
    .dropTable(
      'nutrition.meals',
    )
    .ifExists()
    .execute();

  await db.schema
    .dropTable(
      'nutrition.days',
    )
    .ifExists()
    .execute();

  await db.schema
    .dropTable(
      'nutrition.plan_targets',
    )
    .ifExists()
    .execute();

  await db.schema
    .dropTable(
      'nutrition.plans',
    )
    .ifExists()
    .execute();

  await db.schema
    .dropSchema(
      'nutrition',
    )
    .ifExists()
    .execute();
}

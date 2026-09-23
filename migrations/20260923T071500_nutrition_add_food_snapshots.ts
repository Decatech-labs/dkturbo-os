import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db:
    Kysely<unknown>,
): Promise<void> {

  /*
   * 1. Snapshot del alimento dentro del plan.
   */
  await db.schema
    .alterTable(
      'nutrition.meal_items',
    )
    .addColumn(
      'food_snapshot',
      'jsonb',
    )
    .execute();

  await sql`
    UPDATE nutrition.meal_items AS item
    SET food_snapshot =
      jsonb_build_object(
        'name', food.name,
        'brand', food.brand,
        'category', food.category,
        'referenceAmount', food.reference_amount::numeric,
        'referenceUnit', food.reference_unit,
        'caloriesKcal', food.calories_kcal::numeric,
        'proteinG', food.protein_g::numeric,
        'carbohydratesG', food.carbohydrates_g::numeric,
        'fatG', food.fat_g::numeric,
        'fiberG',
          CASE
            WHEN food.fiber_g IS NULL
              THEN NULL
            ELSE food.fiber_g::numeric
          END
      )
    FROM nutrition.foods AS food
    WHERE food.id =
      item.food_id
  `.execute(
    db,
  );

  await sql`
    ALTER TABLE nutrition.meal_items
    ALTER COLUMN food_snapshot
    SET NOT NULL
  `.execute(
    db,
  );

  /*
   * 2. Snapshots dentro del consumo real.
   */
  await db.schema
    .alterTable(
      'nutrition.meal_item_actuals',
    )
    .addColumn(
      'planned_food_snapshot',
      'jsonb',
    )
    .addColumn(
      'actual_food_snapshot',
      'jsonb',
    )
    .execute();

  /*
   * Snapshot de lo que estaba planificado.
   */
  await sql`
    UPDATE nutrition.meal_item_actuals AS actual
    SET planned_food_snapshot =
      jsonb_build_object(
        'name', food.name,
        'brand', food.brand,
        'category', food.category,
        'referenceAmount', food.reference_amount::numeric,
        'referenceUnit', food.reference_unit,
        'caloriesKcal', food.calories_kcal::numeric,
        'proteinG', food.protein_g::numeric,
        'carbohydratesG', food.carbohydrates_g::numeric,
        'fatG', food.fat_g::numeric,
        'fiberG',
          CASE
            WHEN food.fiber_g IS NULL
              THEN NULL
            ELSE food.fiber_g::numeric
          END
      )
    FROM nutrition.foods AS food
    WHERE food.id =
      actual.planned_food_id
  `.execute(
    db,
  );

  /*
   * Snapshot de lo realmente consumido.
   * SKIPPED mantiene NULL.
   */
  await sql`
    UPDATE nutrition.meal_item_actuals AS actual
    SET actual_food_snapshot =
      jsonb_build_object(
        'name', food.name,
        'brand', food.brand,
        'category', food.category,
        'referenceAmount', food.reference_amount::numeric,
        'referenceUnit', food.reference_unit,
        'caloriesKcal', food.calories_kcal::numeric,
        'proteinG', food.protein_g::numeric,
        'carbohydratesG', food.carbohydrates_g::numeric,
        'fatG', food.fat_g::numeric,
        'fiberG',
          CASE
            WHEN food.fiber_g IS NULL
              THEN NULL
            ELSE food.fiber_g::numeric
          END
      )
    FROM nutrition.foods AS food
    WHERE actual.actual_food_id IS NOT NULL
      AND food.id =
        actual.actual_food_id
  `.execute(
    db,
  );

  await sql`
    ALTER TABLE nutrition.meal_item_actuals
    ALTER COLUMN planned_food_snapshot
    SET NOT NULL
  `.execute(
    db,
  );

  await sql`
    ALTER TABLE nutrition.meal_item_actuals
    ADD CONSTRAINT
      nutrition_meal_item_actuals_snapshot_payload_check
    CHECK (
      (
        status = 'SKIPPED'
        AND actual_food_snapshot IS NULL
      )
      OR
      (
        status IN (
          'EATEN',
          'REPLACED'
        )
        AND actual_food_snapshot IS NOT NULL
      )
    )
  `.execute(
    db,
  );
}

export async function down(
  db:
    Kysely<unknown>,
): Promise<void> {

  await sql`
    ALTER TABLE nutrition.meal_item_actuals
    DROP CONSTRAINT IF EXISTS
      nutrition_meal_item_actuals_snapshot_payload_check
  `.execute(
    db,
  );

  await db.schema
    .alterTable(
      'nutrition.meal_item_actuals',
    )
    .dropColumn(
      'actual_food_snapshot',
    )
    .dropColumn(
      'planned_food_snapshot',
    )
    .execute();

  await db.schema
    .alterTable(
      'nutrition.meal_items',
    )
    .dropColumn(
      'food_snapshot',
    )
    .execute();
}

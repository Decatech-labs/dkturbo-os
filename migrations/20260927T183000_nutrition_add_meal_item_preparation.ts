import {
  type Kysely,
} from 'kysely';

export async function up(
  db:
    Kysely<unknown>,
): Promise<void> {

  await db.schema
    .alterTable(
      'nutrition.meal_items',
    )
    .addColumn(
      'preparation_conversion_id',
      'uuid',
      column =>
        column
          .references(
            'nutrition.food_preparation_conversions.id',
          )
          .onDelete(
            'set null',
          ),
    )
    .execute();

  await db.schema
    .createIndex(
      'nutrition_meal_items_preparation_conversion_idx',
    )
    .on(
      'nutrition.meal_items',
    )
    .column(
      'preparation_conversion_id',
    )
    .execute();
}

export async function down(
  db:
    Kysely<unknown>,
): Promise<void> {

  await db.schema
    .alterTable(
      'nutrition.meal_items',
    )
    .dropColumn(
      'preparation_conversion_id',
    )
    .execute();
}

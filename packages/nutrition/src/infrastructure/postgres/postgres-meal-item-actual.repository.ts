import type {
  Kysely,
} from 'kysely';

import type {
  DkturboUserId,
  NutritionDayId,
  NutritionFoodId,
  NutritionMealItemActual,
  NutritionMealItemActualId,
  NutritionMealItemActualStatus,
  NutritionMealItemId,
  NutritionFoodSnapshot,
} from '../../domain/index.js';

import type {
  MealItemActualRepository,
  SaveMealItemActualData,
} from '../../ports/index.js';

import type {
  NutritionDatabase,
} from './database.js';

const mapMealItemActual =
  (
    row: {
      id:
        string;

      day_id:
        string;

      meal_item_id:
        string | null;

      user_id:
        string;

      status:
        string;

      planned_food_id:
        string;

      planned_quantity:
        string;

      actual_food_id:
        string | null;

      actual_quantity:
        string | null;

      planned_food_snapshot:
        NutritionFoodSnapshot;

      actual_food_snapshot:
        NutritionFoodSnapshot | null;

      notes:
        string | null;

      created_at:
        Date;

      updated_at:
        Date;
    },
  ): NutritionMealItemActual => ({
    id:
      row.id as
        NutritionMealItemActualId,

    dayId:
      row.day_id as
        NutritionDayId,

    mealItemId:
      row.meal_item_id ===
        null
        ? null
        : row.meal_item_id as
          NutritionMealItemId,

    userId:
      row.user_id as
        DkturboUserId,

    status:
      row.status as
        NutritionMealItemActualStatus,

    plannedFoodId:
      row.planned_food_id as
        NutritionFoodId,
        
    plannedFoodSnapshot:
      row.planned_food_snapshot,

    plannedQuantity:
      Number(
        row.planned_quantity,
      ),

    actualFoodId:
      row.actual_food_id ===
        null
        ? null
        : row.actual_food_id as
          NutritionFoodId,

    actualFoodSnapshot:
      row.actual_food_snapshot,

    actualQuantity:
      row.actual_quantity ===
        null
        ? null
        : Number(
          row.actual_quantity,
        ),

    notes:
      row.notes,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  });

export class PostgresMealItemActualRepository
implements MealItemActualRepository {

  public constructor(
    private readonly db:
      Kysely<NutritionDatabase>,
  ) {}

  public async save(
    data:
      SaveMealItemActualData,
  ): Promise<NutritionMealItemActual> {

    const now =
      new Date();

    const row =
      await this.db
        .insertInto(
          'nutrition.meal_item_actuals',
        )
        .values({
          day_id:
            data.dayId,

          meal_item_id:
            data.mealItemId,

          user_id:
            data.userId,

          status:
            data.status,

          planned_food_id:
            data.plannedFoodId,

          planned_food_snapshot:
            data.plannedFoodSnapshot,

          planned_quantity:
            String(
              data.plannedQuantity,
            ),

          actual_food_id:
            data.actualFoodId,

          actual_food_snapshot:
            data.actualFoodSnapshot,

          actual_quantity:
            data.actualQuantity ===
              null
              ? null
              : String(
                data.actualQuantity,
              ),

          notes:
            data.notes,

          updated_at:
            now,
        })
        .onConflict(
          conflict =>
            conflict
              .columns([
                'meal_item_id',
                'user_id',
              ])
              .where(
                'meal_item_id',
                'is not',
                null,
              )
              .doUpdateSet({
                day_id:
                  data.dayId,

                status:
                  data.status,

                planned_food_id:
                  data.plannedFoodId,

                planned_food_snapshot:
                  data.plannedFoodSnapshot,

                planned_quantity:
                  String(
                    data.plannedQuantity,
                  ),

                actual_food_id:
                  data.actualFoodId,

                actual_food_snapshot:
                  data.actualFoodSnapshot,

                actual_quantity:
                  data.actualQuantity ===
                    null
                    ? null
                    : String(
                      data.actualQuantity,
                    ),

                notes:
                  data.notes,

                updated_at:
                  now,
              }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapMealItemActual(
      row,
    );
  }

  public async findForItemAndUser(
    mealItemId:
      NutritionMealItemId,

    userId:
      DkturboUserId,
  ): Promise<NutritionMealItemActual | null> {

    const row =
      await this.db
        .selectFrom(
          'nutrition.meal_item_actuals',
        )
        .selectAll()
        .where(
          'meal_item_id',
          '=',
          mealItemId,
        )
        .where(
          'user_id',
          '=',
          userId,
        )
        .executeTakeFirst();

    return row
      ? mapMealItemActual(
          row,
        )
      : null;
  }

  public async deleteForItemAndUser(
    mealItemId:
      NutritionMealItemId,

    userId:
      DkturboUserId,
  ): Promise<boolean> {

    const deleted =
      await this.db
        .deleteFrom(
          'nutrition.meal_item_actuals',
        )
        .where(
          'meal_item_id',
          '=',
          mealItemId,
        )
        .where(
          'user_id',
          '=',
          userId,
        )
        .returning(
          'id',
        )
        .executeTakeFirst();

    return Boolean(
      deleted,
    );
  }

  public async listForDay(
    dayId:
      NutritionDayId,
  ): Promise<NutritionMealItemActual[]> {

    const rows =
      await this.db
        .selectFrom(
          'nutrition.meal_item_actuals',
        )
        .selectAll()
        .where(
          'day_id',
          '=',
          dayId,
        )
        .orderBy(
          'created_at',
          'asc',
        )
        .execute();

    return rows.map(
      mapMealItemActual,
    );
  }

  public async listForDayAndUser(
    dayId:
      NutritionDayId,

    userId:
      DkturboUserId,
  ): Promise<NutritionMealItemActual[]> {

    const rows =
      await this.db
        .selectFrom(
          'nutrition.meal_item_actuals',
        )
        .selectAll()
        .where(
          'day_id',
          '=',
          dayId,
        )
        .where(
          'user_id',
          '=',
          userId,
        )
        .orderBy(
          'created_at',
          'asc',
        )
        .execute();

    return rows.map(
      mapMealItemActual,
    );
  }
}

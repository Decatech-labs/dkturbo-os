import type {
  Kysely,
} from 'kysely';

import type {
  DkturboUserId,
  NutritionFood,
  NutritionFoodId,
  NutritionMealId,
  NutritionMealItem,
  NutritionMealItemDetail,
  NutritionMealItemId,
  NutritionMealItemQuantity,
  NutritionMealItemQuantityId,
  NutritionUnit,
  NutritionFoodCategory,
  NutritionFoodSnapshot,
  NutritionFoodPreparationConversion,
  NutritionFoodPreparationConversionId,
} from '../../domain/index.js';

import type {
  AddNutritionMealItemData,
  MealItemRepository,
  SaveMealItemQuantityData,
  SetMealItemLocationData,
} from '../../ports/index.js';

import type {
  NutritionDatabase,
} from './database.js';

const mapMealItem =
  (
    row: {
      id:
        string;

      meal_id:
        string;

      food_id:
        string;

      food_snapshot:
        NutritionFoodSnapshot;

      preparation_conversion_id:
        string | null;

      position:
        number;

      notes:
        string | null;

      created_at:
        Date;

      updated_at:
        Date;
    },
  ): NutritionMealItem => ({
    id:
      row.id as
        NutritionMealItemId,

    mealId:
      row.meal_id as
        NutritionMealId,

    foodId:
      row.food_id as
        NutritionFoodId,

    foodSnapshot:
      row.food_snapshot,

    preparationConversionId:
      row.preparation_conversion_id ===
        null
        ? null
        : row.preparation_conversion_id as
            NutritionFoodPreparationConversionId,

    position:
      row.position,

    notes:
      row.notes,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  });

const mapFood =
  (
    row: {
      id:
        string;

      name:
        string;

      brand:
        string | null;

      category:
        string;

      reference_amount:
        string;

      reference_unit:
        string;

      calories_kcal:
        string;

      protein_g:
        string;

      carbohydrates_g:
        string;

      fat_g:
        string;

      fiber_g:
        string | null;

      created_by_user_id:
        string;

      archived_at:
        Date | null;

      created_at:
        Date;

      updated_at:
        Date;
    },
  ): NutritionFood => ({
    id:
      row.id as
        NutritionFoodId,

    name:
      row.name,

    brand:
      row.brand,

    category:
      row.category as
        NutritionFoodCategory,

    referenceAmount:
      Number(
        row.reference_amount,
      ),

    referenceUnit:
      row.reference_unit as
        NutritionUnit,

    caloriesKcal:
      Number(
        row.calories_kcal,
      ),

    proteinG:
      Number(
        row.protein_g,
      ),

    carbohydratesG:
      Number(
        row.carbohydrates_g,
      ),

    fatG:
      Number(
        row.fat_g,
      ),

    fiberG:
      row.fiber_g ===
        null
        ? null
        : Number(
            row.fiber_g,
          ),

    createdByUserId:
      row.created_by_user_id as
        DkturboUserId,

    archivedAt:
      row.archived_at,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  });

export class PostgresMealItemRepository
implements MealItemRepository {

  public constructor(
    private readonly db:
      Kysely<NutritionDatabase>,
  ) {}

  public async create(
    data:
      AddNutritionMealItemData,
  ): Promise<NutritionMealItem> {

    const row =
      await this.db
        .insertInto(
          'nutrition.meal_items',
        )
        .values({
          meal_id:
            data.mealId,

          food_id:
            data.foodId,

          food_snapshot:
            data.foodSnapshot,

          preparation_conversion_id:
            data.preparationConversionId,

          position:
            data.position,

          notes:
            data.notes,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapMealItem(
      row,
    );
  }

  public async findById(
    mealItemId:
      NutritionMealItemId,
  ): Promise<NutritionMealItem | null> {

    const row =
      await this.db
        .selectFrom(
          'nutrition.meal_items',
        )
        .selectAll()
        .where(
          'id',
          '=',
          mealItemId,
        )
        .executeTakeFirst();

    return row
      ? mapMealItem(
          row,
        )
      : null;
  }

  public async saveQuantities(
    data:
      SaveMealItemQuantityData[],
  ): Promise<void> {

    if (
      data.length ===
      0
    ) {
      return;
    }

    for (
      const quantity of data
    ) {
      const now =
        new Date();

      await this.db
        .insertInto(
          'nutrition.meal_item_quantities',
        )
        .values({
          meal_item_id:
            quantity.mealItemId,

          user_id:
            quantity.userId,

          quantity:
            String(
              quantity.quantity,
            ),

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
              .doUpdateSet({
                quantity:
                  String(
                    quantity.quantity,
                  ),

                updated_at:
                  now,
              }),
        )
        .execute();
    }
  }

  public async setPreparationConversion(
    mealItemId:
      NutritionMealItemId,

    preparationConversionId:
      NutritionFoodPreparationConversionId | null,
  ): Promise<boolean> {

    const updated =
      await this.db
        .updateTable(
          'nutrition.meal_items',
        )
        .set({
          preparation_conversion_id:
            preparationConversionId,

          updated_at:
            new Date(),
        })
        .where(
          'id',
          '=',
          mealItemId,
        )
        .returning(
          'id',
        )
        .executeTakeFirst();

    return Boolean(
      updated,
    );
  }

  public async deleteQuantity(
    mealItemId:
      NutritionMealItemId,

    userId:
      DkturboUserId,
  ): Promise<boolean> {

    const deleted =
      await this.db
        .deleteFrom(
          'nutrition.meal_item_quantities',
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

    public async setLocations(
    data:
      SetMealItemLocationData[],
  ): Promise<void> {

    const now =
      new Date();

    for (
      const item of data
    ) {

      await this.db
        .updateTable(
          'nutrition.meal_items',
        )
        .set({
          meal_id:
            item.mealId,

          position:
            item.position,

          updated_at:
            now,
        })
        .where(
          'id',
          '=',
          item.mealItemId,
        )
        .execute();
    }
  }

  public async delete(
    mealItemId:
      NutritionMealItemId,
  ): Promise<boolean> {

    const deleted =
      await this.db
        .deleteFrom(
          'nutrition.meal_items',
        )
        .where(
          'id',
          '=',
          mealItemId,
        )
        .returning(
          'id',
        )
        .executeTakeFirst();

    return Boolean(
      deleted,
    );
  }

  public async listDetailsForMeal(
    mealId:
      NutritionMealId,
  ): Promise<NutritionMealItemDetail[]> {

    const rows =
      await this.db
        .selectFrom(
          'nutrition.meal_items as item',
        )
        .innerJoin(
          'nutrition.foods as food',
          'food.id',
          'item.food_id',
        )
        .select([
          'item.id as item_id',
          'item.meal_id as item_meal_id',
          'item.food_id as item_food_id',
          'item.food_snapshot as item_food_snapshot',
          'item.preparation_conversion_id as item_preparation_conversion_id',
          'item.position as item_position',
          'item.notes as item_notes',
          'item.created_at as item_created_at',
          'item.updated_at as item_updated_at',

          'food.id as food_id',
          'food.name as food_name',
          'food.brand as food_brand',
          'food.category as food_category',
          'food.reference_amount as food_reference_amount',
          'food.reference_unit as food_reference_unit',
          'food.calories_kcal as food_calories_kcal',
          'food.protein_g as food_protein_g',
          'food.carbohydrates_g as food_carbohydrates_g',
          'food.fat_g as food_fat_g',
          'food.fiber_g as food_fiber_g',
          'food.created_by_user_id as food_created_by_user_id',
          'food.archived_at as food_archived_at',
          'food.created_at as food_created_at',
          'food.updated_at as food_updated_at',
        ])
        .where(
          'item.meal_id',
          '=',
          mealId,
        )
        .orderBy(
          'item.position',
          'asc',
        )
        .execute();

    if (
      rows.length ===
      0
    ) {
      return [];
    }

    const quantities =
      await this.db
        .selectFrom(
          'nutrition.meal_item_quantities',
        )
        .selectAll()
        .where(
          'meal_item_id',
          'in',
          rows.map(
            row =>
              row.item_id,
          ),
        )
        .execute();

      const foodIds =
        [
          ...new Set(
            rows.map(
              row =>
                row.item_food_id,
            ),
          ),
        ];

      const preparationConversions =
        foodIds.length ===
          0
          ? []
          : await this.db
              .selectFrom(
                'nutrition.food_preparation_conversions',
              )
              .selectAll()
              .where(
                'food_id',
                'in',
                foodIds,
              )
              .execute();

      const mapPreparationConversion =
        (
          row:
            typeof preparationConversions[number],
        ): NutritionFoodPreparationConversion => ({
          id:
            row.id as
              NutritionFoodPreparationConversionId,

          foodId:
            row.food_id as
              NutritionFoodId,

          name:
            row.name,

          rawAmount:
            Number(
              row.raw_amount,
            ),

          preparedAmount:
            Number(
              row.prepared_amount,
            ),

          preparedUnit:
            row.prepared_unit as
              NutritionUnit,

          isDefault:
            row.is_default,

          createdAt:
            row.created_at,

          updatedAt:
            row.updated_at,
        });

    return rows.map(
      row => {

        const item =
          mapMealItem({
            id:
              row.item_id,

            meal_id:
              row.item_meal_id,

            food_id:
              row.item_food_id,

            food_snapshot:
              row.item_food_snapshot,

            preparation_conversion_id:
              row.item_preparation_conversion_id,

            position:
              row.item_position,

            notes:
              row.item_notes,

            created_at:
              row.item_created_at,

            updated_at:
              row.item_updated_at,
          });

        const food =
          mapFood({
            id:
              row.food_id,

            name:
              row.food_name,

            brand:
              row.food_brand,

            category:
              row.food_category,

            reference_amount:
              row.food_reference_amount,

            reference_unit:
              row.food_reference_unit,

            calories_kcal:
              row.food_calories_kcal,

            protein_g:
              row.food_protein_g,

            carbohydrates_g:
              row.food_carbohydrates_g,

            fat_g:
              row.food_fat_g,

            fiber_g:
              row.food_fiber_g,

            created_by_user_id:
              row.food_created_by_user_id,

            archived_at:
              row.food_archived_at,

            created_at:
              row.food_created_at,

            updated_at:
              row.food_updated_at,
          });

        const historicalFood: NutritionFood = {
          ...food,

          name:
            item.foodSnapshot.name,

          brand:
            item.foodSnapshot.brand,

          category:
            item.foodSnapshot.category,

          referenceAmount:
            item.foodSnapshot.referenceAmount,

          referenceUnit:
            item.foodSnapshot.referenceUnit,

          caloriesKcal:
            item.foodSnapshot.caloriesKcal,

          proteinG:
            item.foodSnapshot.proteinG,

          carbohydratesG:
            item.foodSnapshot.carbohydratesG,

          fatG:
            item.foodSnapshot.fatG,

          fiberG:
            item.foodSnapshot.fiberG,
        };

        const itemQuantities:
          NutritionMealItemQuantity[] =
            quantities
              .filter(
                quantity =>
                  quantity.meal_item_id ===
                  item.id,
              )
              .map(
                quantity => ({
                  id:
                    quantity.id as
                      NutritionMealItemQuantityId,

                  mealItemId:
                    quantity.meal_item_id as
                      NutritionMealItemId,

                  userId:
                    quantity.user_id as
                      DkturboUserId,

                  quantity:
                    Number(
                      quantity.quantity,
                    ),

                  createdAt:
                    quantity.created_at,

                  updatedAt:
                    quantity.updated_at,
                }),
              );

        const explicitPreparation =
          item.preparationConversionId ===
            null
            ? null
            : preparationConversions.find(
                conversion =>
                  conversion.id ===
                  item.preparationConversionId,
              ) ??
              null;

        const defaultPreparation =
          preparationConversions.find(
            conversion =>
              conversion.food_id ===
                item.foodId &&
              conversion.is_default,
          ) ??
          null;

        const resolvedPreparation =
          explicitPreparation
            ? {
                conversion:
                  mapPreparationConversion(
                    explicitPreparation,
                  ),

                source:
                  'EXPLICIT' as const,
              }
            : defaultPreparation
              ? {
                  conversion:
                    mapPreparationConversion(
                      defaultPreparation,
                    ),

                  source:
                    'DEFAULT' as const,
                }
              : null;

        return {
          item,

          food:
            historicalFood,

          quantities:
            itemQuantities,

          preparation:
            resolvedPreparation,
        };
      },
    );
  }
}

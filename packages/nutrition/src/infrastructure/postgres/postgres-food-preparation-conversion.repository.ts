import type {
  Kysely,
} from 'kysely';

import type {
  NutritionFoodId,
  NutritionFoodPreparationConversion,
  NutritionFoodPreparationConversionId,
  NutritionUnit,
} from '../../domain/index.js';

import type {
  CreateFoodPreparationConversionData,
  FoodPreparationConversionRepository,
  UpdateFoodPreparationConversionData,
} from '../../ports/index.js';

import type {
  NutritionDatabase,
} from './database.js';

const mapConversion =
  (
    row: {
      id:
        string;

      food_id:
        string;

      name:
        string;

      raw_amount:
        string;

      prepared_amount:
        string;

      prepared_unit:
        string;

      is_default:
        boolean;

      created_at:
        Date;

      updated_at:
        Date;
    },
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

export class PostgresFoodPreparationConversionRepository
implements FoodPreparationConversionRepository {

  public constructor(
    private readonly db:
      Kysely<NutritionDatabase>,
  ) {}

  private async clearDefault(
    foodId:
      NutritionFoodId,
  ): Promise<void> {

    await this.db
      .updateTable(
        'nutrition.food_preparation_conversions',
      )
      .set({
        is_default:
          false,

        updated_at:
          new Date(),
      })
      .where(
        'food_id',
        '=',
        foodId,
      )
      .where(
        'is_default',
        '=',
        true,
      )
      .execute();
  }

  public async create(
    data:
      CreateFoodPreparationConversionData,
  ): Promise<NutritionFoodPreparationConversion> {

    if (
      data.isDefault
    ) {
      await this.clearDefault(
        data.foodId,
      );
    }

    const row =
      await this.db
        .insertInto(
          'nutrition.food_preparation_conversions',
        )
        .values({
          food_id:
            data.foodId,

          name:
            data.name,

          raw_amount:
            String(
              data.rawAmount,
            ),

          prepared_amount:
            String(
              data.preparedAmount,
            ),

          prepared_unit:
            data.preparedUnit,

          is_default:
            data.isDefault,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapConversion(
      row,
    );
  }

  public async update(
    data:
      UpdateFoodPreparationConversionData,
  ): Promise<NutritionFoodPreparationConversion | null> {

    const existing =
      await this.findById(
        data.conversionId,
      );

    if (!existing) {
      return null;
    }

    if (
      data.isDefault
    ) {
      await this.clearDefault(
        existing.foodId,
      );
    }

    const row =
      await this.db
        .updateTable(
          'nutrition.food_preparation_conversions',
        )
        .set({
          name:
            data.name,

          raw_amount:
            String(
              data.rawAmount,
            ),

          prepared_amount:
            String(
              data.preparedAmount,
            ),

          prepared_unit:
            data.preparedUnit,

          is_default:
            data.isDefault,

          updated_at:
            new Date(),
        })
        .where(
          'id',
          '=',
          data.conversionId,
        )
        .returningAll()
        .executeTakeFirst();

    return row
      ? mapConversion(
          row,
        )
      : null;
  }

  public async delete(
    conversionId:
      NutritionFoodPreparationConversionId,
  ): Promise<boolean> {

    const row =
      await this.db
        .deleteFrom(
          'nutrition.food_preparation_conversions',
        )
        .where(
          'id',
          '=',
          conversionId,
        )
        .returning(
          'id',
        )
        .executeTakeFirst();

    return Boolean(
      row,
    );
  }

  public async findById(
    conversionId:
      NutritionFoodPreparationConversionId,
  ): Promise<NutritionFoodPreparationConversion | null> {

    const row =
      await this.db
        .selectFrom(
          'nutrition.food_preparation_conversions',
        )
        .selectAll()
        .where(
          'id',
          '=',
          conversionId,
        )
        .executeTakeFirst();

    return row
      ? mapConversion(
          row,
        )
      : null;
  }

  public async findDefaultForFood(
    foodId:
      NutritionFoodId,
  ): Promise<NutritionFoodPreparationConversion | null> {

    const row =
      await this.db
        .selectFrom(
          'nutrition.food_preparation_conversions',
        )
        .selectAll()
        .where(
          'food_id',
          '=',
          foodId,
        )
        .where(
          'is_default',
          '=',
          true,
        )
        .executeTakeFirst();

    return row
      ? mapConversion(
          row,
        )
      : null;
  }

  public async listForFood(
    foodId:
      NutritionFoodId,
  ): Promise<NutritionFoodPreparationConversion[]> {

    const rows =
      await this.db
        .selectFrom(
          'nutrition.food_preparation_conversions',
        )
        .selectAll()
        .where(
          'food_id',
          '=',
          foodId,
        )
        .orderBy(
          'is_default',
          'desc',
        )
        .orderBy(
          'name',
          'asc',
        )
        .execute();

    return rows.map(
      mapConversion,
    );
  }
}

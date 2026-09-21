import type {
  Kysely,
} from 'kysely';

import type {
  DkturboUserId,
  NutritionFood,
  NutritionFoodId,
  NutritionUnit,
  NutritionFoodCategory,
} from '../../domain/index.js';

import type {
  CreateFoodData,
  FoodRepository,
  UpdateFoodData,
} from '../../ports/index.js';

import type {
  NutritionDatabase,
} from './database.js';

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

export class PostgresFoodRepository
implements FoodRepository {

  public constructor(
    private readonly db:
      Kysely<NutritionDatabase>,
  ) {}

  public async create(
    data:
      CreateFoodData,
  ): Promise<NutritionFood> {

    const row =
      await this.db
        .insertInto(
          'nutrition.foods',
        )
        .values({
          name:
            data.name,

          brand:
            data.brand,

          category:
            data.category,

          reference_amount:
            String(
              data.referenceAmount,
            ),

          reference_unit:
            data.referenceUnit,

          calories_kcal:
            String(
              data.caloriesKcal,
            ),

          protein_g:
            String(
              data.proteinG,
            ),

          carbohydrates_g:
            String(
              data.carbohydratesG,
            ),

          fat_g:
            String(
              data.fatG,
            ),

          fiber_g:
            data.fiberG ===
              null
              ? null
              : String(
                  data.fiberG,
                ),

          created_by_user_id:
            data.createdByUserId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapFood(
      row,
    );
  }

  public async findById(
    foodId:
      NutritionFoodId,
  ): Promise<NutritionFood | null> {

    const row =
      await this.db
        .selectFrom(
          'nutrition.foods',
        )
        .selectAll()
        .where(
          'id',
          '=',
          foodId,
        )
        .executeTakeFirst();

    return row
      ? mapFood(
          row,
        )
      : null;
  }

  public async update(
    data:
      UpdateFoodData,
  ): Promise<NutritionFood | null> {

    const row =
      await this.db
        .updateTable(
          'nutrition.foods',
        )
        .set({
          name:
            data.name,

          brand:
            data.brand,

          category:
            data.category,

          reference_amount:
            String(
              data.referenceAmount,
            ),

          reference_unit:
            data.referenceUnit,

          calories_kcal:
            String(
              data.caloriesKcal,
            ),

          protein_g:
            String(
              data.proteinG,
            ),

          carbohydrates_g:
            String(
              data.carbohydratesG,
            ),

          fat_g:
            String(
              data.fatG,
            ),

          fiber_g:
            data.fiberG ===
              null
              ? null
              : String(
                  data.fiberG,
                ),

          updated_at:
            new Date(),
        })
        .where(
          'id',
          '=',
          data.foodId,
        )
        .where(
          'archived_at',
          'is',
          null,
        )
        .returningAll()
        .executeTakeFirst();

    return row
      ? mapFood(
          row,
        )
      : null;
  }

  public async archive(
    foodId:
      NutritionFoodId,
  ): Promise<boolean> {

    const row =
      await this.db
        .updateTable(
          'nutrition.foods',
        )
        .set({
          archived_at:
            new Date(),

          updated_at:
            new Date(),
        })
        .where(
          'id',
          '=',
          foodId,
        )
        .where(
          'archived_at',
          'is',
          null,
        )
        .returning(
          'id',
        )
        .executeTakeFirst();

    return Boolean(
      row,
    );
  }

  public async searchActive(
    query:
      string,

    category:
      NutritionFoodCategory | null,
  ): Promise<NutritionFood[]> {

    const normalizedQuery =
      query.trim();

    let statement =
      this.db
        .selectFrom(
          'nutrition.foods',
        )
        .selectAll()
        .where(
          'archived_at',
          'is',
          null,
        );

    if (
      normalizedQuery
    ) {
      statement =
        statement.where(
          'name',
          'ilike',
          `%${normalizedQuery}%`,
        );
    }

    if (
      category !==
      null
    ) {
      statement =
        statement.where(
          'category',
          '=',
          category,
        );
    }

    const rows =
      await statement
        .orderBy(
          'name',
          'asc',
        )
        .limit(
          50,
        )
        .execute();

    return rows.map(
      mapFood,
    );
  }
}

import type {
  Kysely,
} from 'kysely';

import type {
  NutritionDayId,
  NutritionMeal,
  NutritionMealId,
} from '../../domain/index.js';

import type {
  CreateNutritionMealData,
  MealRepository,
} from '../../ports/index.js';

import type {
  NutritionDatabase,
} from './database.js';

const normalizeTime =
  (
    value:
      string | null,
  ): string | null => {

    if (
      value ===
        null
    ) {
      return null;
    }

    return value.slice(
      0,
      5,
    );
  };

const mapMeal =
  (
    row: {
      id:
        string;

      day_id:
        string;

      name:
        string;

      planned_time:
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
  ): NutritionMeal => ({
    id:
      row.id as
        NutritionMealId,

    dayId:
      row.day_id as
        NutritionDayId,

    name:
      row.name,

    plannedTime:
      normalizeTime(
        row.planned_time,
      ),

    position:
      row.position,

    notes:
      row.notes,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  });

export class PostgresMealRepository
implements MealRepository {

  public constructor(
    private readonly db:
      Kysely<NutritionDatabase>,
  ) {}

  public async create(
    data:
      CreateNutritionMealData,
  ): Promise<NutritionMeal> {

    const row =
      await this.db
        .insertInto(
          'nutrition.meals',
        )
        .values({
          day_id:
            data.dayId,

          name:
            data.name,

          planned_time:
            data.plannedTime,

          position:
            data.position,

          notes:
            data.notes,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapMeal(
      row,
    );
  }

  public async findById(
    mealId:
      NutritionMealId,
  ): Promise<NutritionMeal | null> {

    const row =
      await this.db
        .selectFrom(
          'nutrition.meals',
        )
        .selectAll()
        .where(
          'id',
          '=',
          mealId,
        )
        .executeTakeFirst();

    return row
      ? mapMeal(
          row,
        )
      : null;
  }

  public async listForDay(
    dayId:
      NutritionDayId,
  ): Promise<NutritionMeal[]> {

    const rows =
      await this.db
        .selectFrom(
          'nutrition.meals',
        )
        .selectAll()
        .where(
          'day_id',
          '=',
          dayId,
        )
        .orderBy(
          'position',
          'asc',
        )
        .execute();

    return rows.map(
      mapMeal,
    );
  }
}

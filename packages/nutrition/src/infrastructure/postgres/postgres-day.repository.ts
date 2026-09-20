import type {
  Kysely,
} from 'kysely';

import type {
  NutritionDay,
  NutritionDayId,
  NutritionPlanId,
} from '../../domain/index.js';

import type {
  CreateNutritionDayData,
  DayRepository,
} from '../../ports/index.js';

import type {
  NutritionDatabase,
} from './database.js';

const normalizeDate =
  (
    value:
      string | Date,
  ): string => {

    if (
      !(value instanceof Date)
    ) {
      return value;
    }

    const year =
      value.getFullYear();

    const month =
      String(
        value.getMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        value.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${day}`;
  };

const mapDay =
  (
    row: {
      id:
        string;

      plan_id:
        string;

      date:
        string | Date;

      notes:
        string | null;

      created_at:
        Date;

      updated_at:
        Date;
    },
  ): NutritionDay => ({
    id:
      row.id as
        NutritionDayId,

    planId:
      row.plan_id as
        NutritionPlanId,

    date:
      normalizeDate(
        row.date,
      ),

    notes:
      row.notes,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  });

export class PostgresDayRepository
implements DayRepository {

  public constructor(
    private readonly db:
      Kysely<NutritionDatabase>,
  ) {}

  public async createMany(
    data:
      CreateNutritionDayData[],
  ): Promise<NutritionDay[]> {

    if (
      data.length ===
      0
    ) {
      return [];
    }

    const rows =
      await this.db
        .insertInto(
          'nutrition.days',
        )
        .values(
          data.map(
            day => ({
              plan_id:
                day.planId,

              date:
                day.date,

              notes:
                day.notes,
            }),
          ),
        )
        .returningAll()
        .execute();

    return rows.map(
      mapDay,
    );
  }

  public async listForPlan(
    planId:
      NutritionPlanId,
  ): Promise<NutritionDay[]> {

    const rows =
      await this.db
        .selectFrom(
          'nutrition.days',
        )
        .selectAll()
        .where(
          'plan_id',
          '=',
          planId,
        )
        .orderBy(
          'date',
          'asc',
        )
        .execute();

    return rows.map(
      mapDay,
    );
  }
}

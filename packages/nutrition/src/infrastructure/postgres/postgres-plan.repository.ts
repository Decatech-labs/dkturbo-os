import type {
  Kysely,
} from 'kysely';

import type {
  DkturboUserId,
  NutritionPlan,
  NutritionPlanId,
  NutritionPlanStatus,
} from '../../domain/index.js';

import type {
  CreateNutritionPlanData,
  PlanRepository,
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

const mapPlan =
  (
    row: {
      id:
        string;

      title:
        string;

      start_date:
        string | Date;

      end_date:
        string | Date;

      status:
        string;

      created_by_user_id:
        string;

      created_at:
        Date;

      updated_at:
        Date;
    },
  ): NutritionPlan => ({
    id:
      row.id as
        NutritionPlanId,

    title:
      row.title,

    startDate:
      normalizeDate(
        row.start_date,
      ),

    endDate:
      normalizeDate(
        row.end_date,
      ),

    status:
      row.status as
        NutritionPlanStatus,

    createdByUserId:
      row.created_by_user_id as
        DkturboUserId,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  });

export class PostgresPlanRepository
implements PlanRepository {

  public constructor(
    private readonly db:
      Kysely<NutritionDatabase>,
  ) {}

  public async create(
    data:
      CreateNutritionPlanData,
  ): Promise<NutritionPlan> {

    const row =
      await this.db
        .insertInto(
          'nutrition.plans',
        )
        .values({
          title:
            data.title,

          start_date:
            data.startDate,

          end_date:
            data.endDate,

          status:
            data.status,

          created_by_user_id:
            data.createdByUserId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapPlan(
      row,
    );
  }

  public async findById(
    planId:
      NutritionPlanId,
  ): Promise<NutritionPlan | null> {

    const row =
      await this.db
        .selectFrom(
          'nutrition.plans',
        )
        .selectAll()
        .where(
          'id',
          '=',
          planId,
        )
        .executeTakeFirst();

    return row
      ? mapPlan(
          row,
        )
      : null;
  }

  public async list():
    Promise<NutritionPlan[]> {

    const rows =
      await this.db
        .selectFrom(
          'nutrition.plans',
        )
        .selectAll()
        .orderBy(
          'start_date',
          'desc',
        )
        .execute();

    return rows.map(
      mapPlan,
    );
  }
}

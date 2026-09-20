import type {
  Kysely,
} from 'kysely';

import type {
  DkturboUserId,
  NutritionPlanId,
  NutritionPlanTarget,
  NutritionPlanTargetId,
} from '../../domain/index.js';

import type {
  PlanTargetRepository,
  SaveNutritionPlanTargetData,
} from '../../ports/index.js';

import type {
  NutritionDatabase,
} from './database.js';

const mapTarget =
  (
    row: {
      id:
        string;

      plan_id:
        string;

      user_id:
        string;

      calories_kcal:
        string | null;

      protein_g:
        string | null;

      carbohydrates_g:
        string | null;

      fat_g:
        string | null;

      fiber_g:
        string | null;

      created_at:
        Date;

      updated_at:
        Date;
    },
  ): NutritionPlanTarget => ({
    id:
      row.id as
        NutritionPlanTargetId,

    planId:
      row.plan_id as
        NutritionPlanId,

    userId:
      row.user_id as
        DkturboUserId,

    caloriesKcal:
      row.calories_kcal ===
        null
        ? null
        : Number(
            row.calories_kcal,
          ),

    proteinG:
      row.protein_g ===
        null
        ? null
        : Number(
            row.protein_g,
          ),

    carbohydratesG:
      row.carbohydrates_g ===
        null
        ? null
        : Number(
            row.carbohydrates_g,
          ),

    fatG:
      row.fat_g ===
        null
        ? null
        : Number(
            row.fat_g,
          ),

    fiberG:
      row.fiber_g ===
        null
        ? null
        : Number(
            row.fiber_g,
          ),

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  });

export class PostgresPlanTargetRepository
implements PlanTargetRepository {

  public constructor(
    private readonly db:
      Kysely<NutritionDatabase>,
  ) {}

  public async save(
    data:
      SaveNutritionPlanTargetData,
  ): Promise<NutritionPlanTarget> {

    const now =
      new Date();

    const row =
      await this.db
        .insertInto(
          'nutrition.plan_targets',
        )
        .values({
          plan_id:
            data.planId,

          user_id:
            data.userId,

          calories_kcal:
            data.caloriesKcal ===
              null
              ? null
              : String(
                  data.caloriesKcal,
                ),

          protein_g:
            data.proteinG ===
              null
              ? null
              : String(
                  data.proteinG,
                ),

          carbohydrates_g:
            data.carbohydratesG ===
              null
              ? null
              : String(
                  data.carbohydratesG,
                ),

          fat_g:
            data.fatG ===
              null
              ? null
              : String(
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
            now,
        })
        .onConflict(
          conflict =>
            conflict
              .columns([
                'plan_id',
                'user_id',
              ])
              .doUpdateSet({
                calories_kcal:
                  data.caloriesKcal ===
                    null
                    ? null
                    : String(
                        data.caloriesKcal,
                      ),

                protein_g:
                  data.proteinG ===
                    null
                    ? null
                    : String(
                        data.proteinG,
                      ),

                carbohydrates_g:
                  data.carbohydratesG ===
                    null
                    ? null
                    : String(
                        data.carbohydratesG,
                      ),

                fat_g:
                  data.fatG ===
                    null
                    ? null
                    : String(
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
                  now,
              }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapTarget(
      row,
    );
  }

  public async findForUser(
    planId:
      NutritionPlanId,

    userId:
      DkturboUserId,
  ): Promise<NutritionPlanTarget | null> {

    const row =
      await this.db
        .selectFrom(
          'nutrition.plan_targets',
        )
        .selectAll()
        .where(
          'plan_id',
          '=',
          planId,
        )
        .where(
          'user_id',
          '=',
          userId,
        )
        .executeTakeFirst();

    return row
      ? mapTarget(
          row,
        )
      : null;
  }

  public async listForPlan(
    planId:
      NutritionPlanId,
  ): Promise<NutritionPlanTarget[]> {

    const rows =
      await this.db
        .selectFrom(
          'nutrition.plan_targets',
        )
        .selectAll()
        .where(
          'plan_id',
          '=',
          planId,
        )
        .orderBy(
          'user_id',
          'asc',
        )
        .execute();

    return rows.map(
      mapTarget,
    );
  }
}

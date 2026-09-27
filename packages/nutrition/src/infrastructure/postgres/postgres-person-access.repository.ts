import type {
  Kysely,
} from 'kysely';

import type {
  DkturboUserId,
  NutritionPersonAccess,
  NutritionPersonAccessId,
  NutritionPersonAccessRole,
} from '../../domain/index.js';

import type {
  GrantNutritionPersonAccessData,
  PersonAccessRepository,
} from '../../ports/index.js';

import type {
  NutritionDatabase,
} from './database.js';

const mapAccess =
  (
    row: {
      id:
        string;

      grantee_user_id:
        string;

      subject_user_id:
        string;

      role:
        string;

      created_at:
        Date;

      updated_at:
        Date;
    },
  ): NutritionPersonAccess => ({
    id:
      row.id as
        NutritionPersonAccessId,

    granteeUserId:
      row.grantee_user_id as
        DkturboUserId,

    subjectUserId:
      row.subject_user_id as
        DkturboUserId,

    role:
      row.role as
        NutritionPersonAccessRole,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  });

export class PostgresPersonAccessRepository
implements PersonAccessRepository {

  public constructor(
    private readonly db:
      Kysely<NutritionDatabase>,
  ) {}

  public async findAccess(
    granteeUserId:
      DkturboUserId,

    subjectUserId:
      DkturboUserId,
  ): Promise<
    NutritionPersonAccess | null
  > {

    const row =
      await this.db
        .selectFrom(
          'nutrition.person_access',
        )
        .selectAll()
        .where(
          'grantee_user_id',
          '=',
          granteeUserId,
        )
        .where(
          'subject_user_id',
          '=',
          subjectUserId,
        )
        .executeTakeFirst();

    return row
      ? mapAccess(
          row,
        )
      : null;
  }

  public async listForGrantee(
    granteeUserId:
      DkturboUserId,
  ): Promise<
    NutritionPersonAccess[]
  > {

    const rows =
      await this.db
        .selectFrom(
          'nutrition.person_access',
        )
        .selectAll()
        .where(
          'grantee_user_id',
          '=',
          granteeUserId,
        )
        .orderBy(
          'subject_user_id',
          'asc',
        )
        .execute();

    return rows.map(
      mapAccess,
    );
  }

  public async grantAccess(
    data:
      GrantNutritionPersonAccessData,
  ): Promise<
    NutritionPersonAccess
  > {

    const now =
      new Date();

    const row =
      await this.db
        .insertInto(
          'nutrition.person_access',
        )
        .values({
          grantee_user_id:
            data.granteeUserId,

          subject_user_id:
            data.subjectUserId,

          role:
            data.role,

          updated_at:
            now,
        })
        .onConflict(
          conflict =>
            conflict
              .columns([
                'grantee_user_id',
                'subject_user_id',
              ])
              .doUpdateSet({
                role:
                  data.role,

                updated_at:
                  now,
              }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapAccess(
      row,
    );
  }

  public async revokeAccess(
    granteeUserId:
      DkturboUserId,

    subjectUserId:
      DkturboUserId,
  ): Promise<boolean> {

    const deleted =
      await this.db
        .deleteFrom(
          'nutrition.person_access',
        )
        .where(
          'grantee_user_id',
          '=',
          granteeUserId,
        )
        .where(
          'subject_user_id',
          '=',
          subjectUserId,
        )
        .returning(
          'id',
        )
        .executeTakeFirst();

    return Boolean(
      deleted,
    );
  }
}

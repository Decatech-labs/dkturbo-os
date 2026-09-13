import type {
  Kysely,
} from 'kysely';

import type {
  Athlete,
  AthleteAccess,
  AthleteAccessRole,
  AthleteId,
  DkturboUserId,
} from '../../domain/index.js';

import type {
  AthleteRepository,
  CreateAthleteData,
  GrantAthleteAccessData,
  AthleteForUser,
} from '../../ports/index.js';

import type {
  TrainingDatabase,
} from './database.js';

const mapAthlete = (
  row: {
    id: string;
    display_name: string;
    created_at: Date;
    updated_at: Date;
  },
): Athlete => ({
  id:
    row.id as AthleteId,

  displayName:
    row.display_name,

  createdAt:
    row.created_at,

  updatedAt:
    row.updated_at,
});

const mapAthleteAccess = (
  row: {
    id: string;
    athlete_id: string;
    user_id: string;
    role: string;
    created_at: Date;
  },
): AthleteAccess => ({
  id:
    row.id,

  athleteId:
    row.athlete_id as
      AthleteId,

  userId:
    row.user_id as
      DkturboUserId,

  role:
    row.role as
      AthleteAccessRole,

  createdAt:
    row.created_at,
});

export class PostgresAthleteRepository
implements AthleteRepository {

  public constructor(
    private readonly db:
      Kysely<TrainingDatabase>,
  ) {}

  public async create(
    data: CreateAthleteData,
  ): Promise<Athlete> {

    const row =
      await this.db
        .insertInto(
          'training.athletes',
        )
        .values({
          display_name:
            data.displayName,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapAthlete(row);
  }

  public async findById(
    athleteId: AthleteId,
  ): Promise<Athlete | null> {

    const row =
      await this.db
        .selectFrom(
          'training.athletes',
        )
        .selectAll()
        .where(
          'id',
          '=',
          athleteId,
        )
        .executeTakeFirst();

    return row
      ? mapAthlete(row)
      : null;
  }

  public async listForUser(
    userId:
      DkturboUserId,
  ): Promise<AthleteForUser[]> {
    const rows =
      await this.db
        .selectFrom(
          'training.athletes as athlete',
        )
        .innerJoin(
          'training.athlete_access as access',
          'access.athlete_id',
          'athlete.id',
        )
        .select([
          'athlete.id as athlete_id',
          'athlete.display_name as athlete_display_name',
          'athlete.created_at as athlete_created_at',
          'athlete.updated_at as athlete_updated_at',

          'access.id as access_id',
          'access.user_id as access_user_id',
          'access.role as access_role',
          'access.created_at as access_created_at',
        ])
        .where(
          'access.user_id',
          '=',
          userId,
        )
        .orderBy(
          'athlete.display_name',
          'asc',
        )
        .execute();

    return rows.map(
      (
        row,
      ) => ({
        athlete: {
          id:
            row.athlete_id as
              AthleteId,

          displayName:
            row.athlete_display_name,

          createdAt:
            row.athlete_created_at,

          updatedAt:
            row.athlete_updated_at,
        },

        access: {
          id:
            row.access_id,

          athleteId:
            row.athlete_id as
              AthleteId,

          userId:
            row.access_user_id as
              DkturboUserId,

          role:
            row.access_role as
              AthleteAccessRole,

          createdAt:
            row.access_created_at,
        },
      }),
    );
  }

  public async grantAccess(
    data: GrantAthleteAccessData,
  ): Promise<AthleteAccess> {

    const row =
      await this.db
        .insertInto(
          'training.athlete_access',
        )
        .values({
          athlete_id:
            data.athleteId,

          user_id:
            data.userId,

          role:
            data.role,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapAthleteAccess(
      row,
    );
  }

  public async findAccess(
    athleteId: AthleteId,
    userId: DkturboUserId,
  ): Promise<AthleteAccess | null> {

    const row =
      await this.db
        .selectFrom(
          'training.athlete_access',
        )
        .selectAll()
        .where(
          'athlete_id',
          '=',
          athleteId,
        )
        .where(
          'user_id',
          '=',
          userId,
        )
        .executeTakeFirst();

    return row
      ? mapAthleteAccess(row)
      : null;
  }
}

import type {
  Kysely,
} from 'kysely';

import type {
  AthleteId,
  DailyCheckin,
  DailyCheckinId,
  DkturboUserId,
  WellnessScore,
} from '../../domain/index.js';

import type {
  DailyCheckinRepository,
  SaveDailyCheckinData,
} from '../../ports/index.js';

import type {
  TrainingDatabase,
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

const mapDailyCheckin =
  (
    row: {
      id:
        string;

      athlete_id:
        string;

      date:
        string | Date;

      weight_kg:
        string | null;

      sleep_quality:
        number | null;

      fatigue:
        number | null;

      soreness:
        number | null;

      stress:
        number | null;

      motivation:
        number | null;

      notes:
        string | null;

      recorded_by_user_id:
        string;

      created_at:
        Date;

      updated_at:
        Date;
    },
  ): DailyCheckin => ({
    id:
      row.id as
        DailyCheckinId,

    athleteId:
      row.athlete_id as
        AthleteId,

    date:
      normalizeDate(
        row.date,
      ),

    weightKg:
      row.weight_kg ===
        null
        ? null
        : Number(
            row.weight_kg,
          ),

    sleepQuality:
      row.sleep_quality as
        WellnessScore | null,

    fatigue:
      row.fatigue as
        WellnessScore | null,

    soreness:
      row.soreness as
        WellnessScore | null,

    stress:
      row.stress as
        WellnessScore | null,

    motivation:
      row.motivation as
        WellnessScore | null,

    notes:
      row.notes,

    recordedByUserId:
      row.recorded_by_user_id as
        DkturboUserId,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  });

export class PostgresDailyCheckinRepository
implements DailyCheckinRepository {

  public constructor(
    private readonly db:
      Kysely<TrainingDatabase>,
  ) {}

  public async findByAthleteAndDate(
    athleteId:
      AthleteId,
    date:
      string,
  ): Promise<DailyCheckin | null> {

    const row =
      await this.db
        .selectFrom(
          'training.daily_checkins',
        )
        .selectAll()
        .where(
          'athlete_id',
          '=',
          athleteId,
        )
        .where(
          'date',
          '=',
          date,
        )
        .executeTakeFirst();

    return row
      ? mapDailyCheckin(
          row,
        )
      : null;
  }

  public async listByAthleteAndDateRange(
    athleteId:
      AthleteId,

    from:
      string,

    to:
      string,
  ): Promise<DailyCheckin[]> {

    const rows =
      await this.db
        .selectFrom(
          'training.daily_checkins',
        )
        .selectAll()
        .where(
          'athlete_id',
          '=',
          athleteId,
        )
        .where(
          'date',
          '>=',
          from,
        )
        .where(
          'date',
          '<=',
          to,
        )
        .orderBy(
          'date',
          'asc',
        )
        .execute();

    return rows.map(
      mapDailyCheckin,
    );
  }

  public async save(
    data:
      SaveDailyCheckinData,
  ): Promise<DailyCheckin> {

    const now =
      new Date();

    const row =
      await this.db
        .insertInto(
          'training.daily_checkins',
        )
        .values({
          athlete_id:
            data.athleteId,

          date:
            data.date,

          weight_kg:
            data.weightKg ===
              null
              ? null
              : String(
                  data.weightKg,
                ),

          sleep_quality:
            data.sleepQuality,

          fatigue:
            data.fatigue,

          soreness:
            data.soreness,

          stress:
            data.stress,

          motivation:
            data.motivation,

          notes:
            data.notes,

          recorded_by_user_id:
            data.recordedByUserId,

          updated_at:
            now,
        })
        .onConflict(
          (
            conflict,
          ) =>
            conflict
              .columns([
                'athlete_id',
                'date',
              ])
              .doUpdateSet({
                weight_kg:
                  data.weightKg ===
                    null
                    ? null
                    : String(
                        data.weightKg,
                      ),

                sleep_quality:
                  data.sleepQuality,

                fatigue:
                  data.fatigue,

                soreness:
                  data.soreness,

                stress:
                  data.stress,

                motivation:
                  data.motivation,

                notes:
                  data.notes,

                recorded_by_user_id:
                  data.recordedByUserId,

                updated_at:
                  now,
              }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapDailyCheckin(
      row,
    );
  }
}

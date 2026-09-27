import type {
  AthleteId,
  DailyCheckin,
  DkturboUserId,
  WellnessScore,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

export class InvalidDailyCheckinError
extends Error {

  public constructor(
    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      'InvalidDailyCheckinError';
  }
}

export interface SaveDailyCheckinInput {
  athleteId:
    AthleteId;

  userId:
    DkturboUserId;

  date:
    string;

  weightKg:
    number | null;

  sleepQuality:
    WellnessScore | null;

  fatigue:
    WellnessScore | null;

  soreness:
    WellnessScore | null;

  stress:
    WellnessScore | null;

  motivation:
    WellnessScore | null;

  notes:
    string | null;
}

const isValidDate =
  (
    value:
      string,
  ): boolean => {

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        value,
      )
    ) {
      return false;
    }

    const [
      year,
      month,
      day,
    ] =
      value
        .split('-')
        .map(Number);

    const date =
      new Date(
        Date.UTC(
          year!,
          month! - 1,
          day!,
        ),
      );

    return (
      date.getUTCFullYear() ===
        year &&
      date.getUTCMonth() ===
        month! - 1 &&
      date.getUTCDate() ===
        day
    );
  };

const assertWellnessScore =
  (
    value:
      WellnessScore | null,

    fieldName:
      string,
  ): void => {

    if (
      value ===
      null
    ) {
      return;
    }

    if (
      !Number.isInteger(
        value,
      ) ||
      value < 1 ||
      value > 5
    ) {
      throw new InvalidDailyCheckinError(
        `${fieldName} must be between 1 and 5`,
      );
    }
  };

export const saveDailyCheckin =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      SaveDailyCheckinInput,
  ): Promise<DailyCheckin> => {

    if (
      !isValidDate(
        input.date,
      )
    ) {
      throw new InvalidDailyCheckinError(
        'date must be a valid YYYY-MM-DD date',
      );
    }

    if (
      input.weightKg !==
        null &&
      (
        !Number.isFinite(
          input.weightKg,
        ) ||
        input.weightKg <=
          0 ||
        input.weightKg >
          500
      )
    ) {
      throw new InvalidDailyCheckinError(
        'weightKg must be greater than 0 and at most 500',
      );
    }

    assertWellnessScore(
      input.sleepQuality,
      'sleepQuality',
    );

    assertWellnessScore(
      input.fatigue,
      'fatigue',
    );

    assertWellnessScore(
      input.soreness,
      'soreness',
    );

    assertWellnessScore(
      input.stress,
      'stress',
    );

    assertWellnessScore(
      input.motivation,
      'motivation',
    );

    const notes =
      input.notes
        ?.trim() ||
      null;

    if (
      notes &&
      notes.length >
        4000
    ) {
      throw new InvalidDailyCheckinError(
        'notes must be at most 4000 characters',
      );
    }

    return unitOfWork.execute(
      async ({
        athletes,
        dailyCheckins,
      }) => {

        await requireAthleteWriteAccess(
          athletes,
          input.athleteId,
          input.userId,
        );

        return dailyCheckins.save({
          athleteId:
            input.athleteId,

          date:
            input.date,

          weightKg:
            input.weightKg,

          sleepQuality:
            input.sleepQuality,

          fatigue:
            input.fatigue,

          soreness:
            input.soreness,

          stress:
            input.stress,

          motivation:
            input.motivation,

          notes,

          recordedByUserId:
            input.userId,
        });
      },
    );
  };

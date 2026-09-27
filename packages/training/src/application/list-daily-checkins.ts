import type {
  AthleteId,
  DailyCheckin,
  DkturboUserId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteReadAccess,
} from './require-athlete-read-access.js';

export class InvalidDailyCheckinRangeError
extends Error {

  public constructor(
    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      'InvalidDailyCheckinRangeError';
  }
}

export interface ListDailyCheckinsInput {
  athleteId:
    AthleteId;

  userId:
    DkturboUserId;

  from:
    string;

  to:
    string;
}

export interface DailyCheckinWeightSummary {
  first:
    number | null;

  last:
    number | null;

  average:
    number | null;

  difference:
    number | null;
}

export interface DailyCheckinAverageSummary {
  sleepQuality:
    number | null;

  fatigue:
    number | null;

  soreness:
    number | null;

  stress:
    number | null;

  motivation:
    number | null;
}

export interface DailyCheckinRangeSummary {
  from:
    string;

  to:
    string;

  recordedDays:
    number;

  periodDays:
    number;

  weight:
    DailyCheckinWeightSummary;

  averages:
    DailyCheckinAverageSummary;
}

export interface DailyCheckinRangeResult {
  checkins:
    DailyCheckin[];

  summary:
    DailyCheckinRangeSummary;
}

const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;

const parseCalendarDate =
  (
    value:
      string,
  ): Date | null => {

    if (
      !DATE_PATTERN.test(
        value,
      )
    ) {
      return null;
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

    if (
      date.getUTCFullYear() !==
        year ||
      date.getUTCMonth() !==
        month! - 1 ||
      date.getUTCDate() !==
        day
    ) {
      return null;
    }

    return date;
  };

const round =
  (
    value:
      number,
  ): number =>
    Math.round(
      value *
      100,
    ) /
    100;

const average =
  (
    values:
      Array<number | null>,
  ): number | null => {

    const available =
      values.filter(
        (
          value,
        ): value is number =>
          value !==
          null,
      );

    if (
      available.length ===
      0
    ) {
      return null;
    }

    const total =
      available.reduce(
        (
          sum,
          value,
        ) =>
          sum +
          value,
        0,
      );

    return round(
      total /
        available.length,
    );
  };

const calculatePeriodDays =
  (
    from:
      Date,

    to:
      Date,
  ): number => {

    const millisecondsPerDay =
      24 *
      60 *
      60 *
      1000;

    return (
      Math.round(
        (
          to.getTime() -
          from.getTime()
        ) /
        millisecondsPerDay,
      ) +
      1
    );
  };

const buildSummary =
  (
    checkins:
      DailyCheckin[],

    from:
      string,

    to:
      string,

    fromDate:
      Date,

    toDate:
      Date,
  ): DailyCheckinRangeSummary => {

    const weightedCheckins =
      checkins.filter(
        (
          checkin,
        ) =>
          checkin.weightKg !==
          null,
      );

    const firstWeight =
      weightedCheckins[
        0
      ]?.weightKg ??
      null;

    const lastWeight =
      weightedCheckins[
        weightedCheckins.length -
          1
      ]?.weightKg ??
      null;

    const weightDifference =
      firstWeight !==
        null &&
      lastWeight !==
        null
        ? round(
            lastWeight -
            firstWeight,
          )
        : null;

    return {
      from,

      to,

      recordedDays:
        checkins.length,

      periodDays:
        calculatePeriodDays(
          fromDate,
          toDate,
        ),

      weight: {
        first:
          firstWeight,

        last:
          lastWeight,

        average:
          average(
            checkins.map(
              checkin =>
                checkin.weightKg,
            ),
          ),

        difference:
          weightDifference,
      },

      averages: {
        sleepQuality:
          average(
            checkins.map(
              checkin =>
                checkin.sleepQuality,
            ),
          ),

        fatigue:
          average(
            checkins.map(
              checkin =>
                checkin.fatigue,
            ),
          ),

        soreness:
          average(
            checkins.map(
              checkin =>
                checkin.soreness,
            ),
          ),

        stress:
          average(
            checkins.map(
              checkin =>
                checkin.stress,
            ),
          ),

        motivation:
          average(
            checkins.map(
              checkin =>
                checkin.motivation,
            ),
          ),
      },
    };
  };

export const listDailyCheckins =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      ListDailyCheckinsInput,
  ): Promise<DailyCheckinRangeResult> => {

    const fromDate =
      parseCalendarDate(
        input.from,
      );

    const toDate =
      parseCalendarDate(
        input.to,
      );

    if (
      !fromDate ||
      !toDate
    ) {
      throw new InvalidDailyCheckinRangeError(
        'from and to must be valid YYYY-MM-DD dates',
      );
    }

    if (
      fromDate.getTime() >
      toDate.getTime()
    ) {
      throw new InvalidDailyCheckinRangeError(
        'from must be before or equal to to',
      );
    }

    return unitOfWork.execute(
      async ({
        athletes,
        dailyCheckins,
      }) => {

        await requireAthleteReadAccess(
          athletes,
          input.athleteId,
          input.userId,
        );

        const checkins =
          await dailyCheckins
            .listByAthleteAndDateRange(
              input.athleteId,
              input.from,
              input.to,
            );

        return {
          checkins,

          summary:
            buildSummary(
              checkins,
              input.from,
              input.to,
              fromDate,
              toDate,
            ),
        };
      },
    );
  };

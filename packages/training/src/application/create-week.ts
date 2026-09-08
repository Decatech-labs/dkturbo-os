import type {
  AthleteId,
  DkturboUserId,
  TrainingDay,
  TrainingWeek,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

export interface CreateWeekInput {
  athleteId:
    AthleteId;

  weekStart:
    string;

  title?:
    string | null;

  notes?:
    string | null;

  createdByUserId:
    DkturboUserId;
}

export interface CreateWeekResult {
  week:
    TrainingWeek;

  days:
    TrainingDay[];
}

const DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})$/;

const parseIsoDate = (
  date:
    string,
): Date | null => {

  const match =
    DATE_PATTERN.exec(
      date,
    );

  if (!match) {
    return null;
  }

  const year =
    Number(
      match[1],
    );

  const month =
    Number(
      match[2],
    );

  const day =
    Number(
      match[3],
    );

  const value =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  if (
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day
  ) {
    return null;
  }

  return value;
};

const formatIsoDate = (
  date:
    Date,
): string =>
  date
    .toISOString()
    .slice(
      0,
      10,
    );

const addDays = (
  date:
    string,

  days:
    number,
): string => {

  const value =
    parseIsoDate(
      date,
    );

  if (!value) {
    throw new Error(
      'Invalid ISO date',
    );
  }

  value.setUTCDate(
    value.getUTCDate() +
      days,
  );

  return formatIsoDate(
    value,
  );
};

const isMonday = (
  date:
    string,
): boolean => {

  const value =
    parseIsoDate(
      date,
    );

  return (
    value !== null &&
    value.getUTCDay() === 1
  );
};

export const createWeek =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      CreateWeekInput,
  ): Promise<CreateWeekResult> => {

    const parsedWeekStart =
      parseIsoDate(
        input.weekStart,
      );

    if (!parsedWeekStart) {
      throw new Error(
        'weekStart must be a valid YYYY-MM-DD date',
      );
    }

    if (
      !isMonday(
        input.weekStart,
      )
    ) {
      throw new Error(
        'weekStart must be a Monday',
      );
    }

    return unitOfWork.execute(
      async ({
        athletes,
        weeks,
      }) => {

        await requireAthleteWriteAccess(
          athletes,
          input.athleteId,
          input.createdByUserId,
        );

        const existingWeek =
          await weeks
            .findWeekByAthleteAndStart(
              input.athleteId,
              input.weekStart,
            );

        if (existingWeek) {
          throw new Error(
            'Training week already exists',
          );
        }

        const week =
          await weeks.createWeek({
            athleteId:
              input.athleteId,

            weekStart:
              input.weekStart,

            title:
              input.title ?? null,

            notes:
              input.notes ?? null,

            createdByUserId:
              input.createdByUserId,
          });

        const days:
          TrainingDay[] = [];

        for (
          let offset = 0;
          offset < 7;
          offset += 1
        ) {

          const day =
            await weeks.createDay({
              weekId:
                week.id,

              athleteId:
                input.athleteId,

              date:
                addDays(
                  input.weekStart,
                  offset,
                ),
            });

          days.push(
            day,
          );
        }

        return {
          week,
          days,
        };
      },
    );
  };

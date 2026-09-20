import type {
  DkturboUserId,
  NutritionDay,
  NutritionPlan,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

export interface CreateWeeklyPlanInput {
  title:
    string;

  weekStart:
    string;

  createdByUserId:
    DkturboUserId;
}

export interface CreateWeeklyPlanResult {
  plan:
    NutritionPlan;

  days:
    NutritionDay[];
}

export class InvalidWeeklyNutritionPlanError
extends Error {}

const DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})$/;

const parseDate =
  (
    value:
      string,
  ): Date | null => {

    const match =
      DATE_PATTERN.exec(
        value,
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

    const date =
      new Date(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0,
      );

    if (
      date.getFullYear() !==
        year ||
      date.getMonth() !==
        month - 1 ||
      date.getDate() !==
        day
    ) {
      return null;
    }

    return date;
  };

const formatDate =
  (
    date:
      Date,
  ): string => {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${day}`;
  };

const addDays =
  (
    date:
      Date,

    amount:
      number,
  ): Date => {

    const result =
      new Date(
        date,
      );

    result.setDate(
      result.getDate() +
        amount,
    );

    return result;
  };

export const createWeeklyPlan =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      CreateWeeklyPlanInput,
  ): Promise<CreateWeeklyPlanResult> => {

    const title =
      input.title.trim();

    if (
      title.length ===
        0 ||
      title.length >
        200
    ) {
      throw new InvalidWeeklyNutritionPlanError(
        'Invalid nutrition plan title',
      );
    }

    const startDate =
      parseDate(
        input.weekStart,
      );

    if (
      !startDate
    ) {
      throw new InvalidWeeklyNutritionPlanError(
        'weekStart must be a valid YYYY-MM-DD date',
      );
    }

    if (
      startDate.getDay() !==
        1
    ) {
      throw new InvalidWeeklyNutritionPlanError(
        'weekStart must be a Monday',
      );
    }

    const endDate =
      addDays(
        startDate,
        6,
      );

    return unitOfWork.execute(
      async ({
        plans,
        days,
      }) => {

        const plan =
          await plans.create({
            title,

            startDate:
              formatDate(
                startDate,
              ),

            endDate:
              formatDate(
                endDate,
              ),

            status:
              'DRAFT',

            createdByUserId:
              input.createdByUserId,
          });

        const createdDays =
          await days.createMany(
            Array.from(
              {
                length:
                  7,
              },
              (
                _,
                index,
              ) => ({
                planId:
                  plan.id,

                date:
                  formatDate(
                    addDays(
                      startDate,
                      index,
                    ),
                  ),

                notes:
                  null,
              }),
            ),
          );

        return {
          plan,
          days:
            createdDays,
        };
      },
    );
  };

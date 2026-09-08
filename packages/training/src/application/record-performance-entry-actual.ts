import type {
  AthleteId,
  DkturboUserId,
  PerformanceEntry,
  PerformanceEntryId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

export interface RecordPerformanceEntryActualInput {
  athleteId:
    AthleteId;

  performanceEntryId:
    PerformanceEntryId;

  reps?:
    number | null;

  loadKg?:
    number | null;

  distanceM?:
    number | null;

  durationMs?:
    number | null;

  resultM?:
    number | null;

  heightM?:
    number | null;

  rpe?:
    number | null;

  rir?:
    number | null;

  restSeconds?:
    number | null;

  success?:
    boolean | null;

  isFoul?:
    boolean | null;

  metrics?:
    Readonly<
      Record<
        string,
        unknown
      >
    >;

  notes?:
    string | null;

  updatedByUserId:
    DkturboUserId;
}

const requireNonNegativeInteger =
  (
    value:
      number | null | undefined,

    field:
      string,
  ): void => {

    if (
      value !== null &&
      value !== undefined &&
      (
        !Number.isInteger(
          value,
        ) ||
        value < 0
      )
    ) {
      throw new Error(
        `${field} must be a non-negative integer`,
      );
    }
  };

const requireNonNegativeNumber =
  (
    value:
      number | null | undefined,

    field:
      string,
  ): void => {

    if (
      value !== null &&
      value !== undefined &&
      (
        !Number.isFinite(
          value,
        ) ||
        value < 0
      )
    ) {
      throw new Error(
        `${field} must be a non-negative number`,
      );
    }
  };

const requireRpe =
  (
    value:
      number | null | undefined,

    field:
      string,
  ): void => {

    if (
      value !== null &&
      value !== undefined &&
      (
        !Number.isFinite(
          value,
        ) ||
        value < 0 ||
        value > 10
      )
    ) {
      throw new Error(
        `${field} must be between 0 and 10`,
      );
    }
  };

export const recordPerformanceEntryActual =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      RecordPerformanceEntryActualInput,
  ): Promise<PerformanceEntry> => {

    requireNonNegativeInteger(
      input.reps,
      'reps',
    );

    requireNonNegativeNumber(
      input.loadKg,
      'loadKg',
    );

    requireNonNegativeNumber(
      input.distanceM,
      'distanceM',
    );

    requireNonNegativeInteger(
      input.durationMs,
      'durationMs',
    );

    requireNonNegativeNumber(
      input.resultM,
      'resultM',
    );

    requireNonNegativeNumber(
      input.heightM,
      'heightM',
    );

    requireRpe(
      input.rpe,
      'rpe',
    );

    requireNonNegativeNumber(
      input.rir,
      'rir',
    );

    requireNonNegativeInteger(
      input.restSeconds,
      'restSeconds',
    );

    return unitOfWork.execute(
      async ({
        athletes,
        sessionStructure,
      }) => {

        await requireAthleteWriteAccess(
          athletes,
          input.athleteId,
          input.updatedByUserId,
        );

        const entry =
          await sessionStructure
            .findPerformanceEntryById(
              input.performanceEntryId,
            );

        if (!entry) {
          throw new Error(
            'Performance entry not found',
          );
        }

        if (
          entry.athleteId !==
          input.athleteId
        ) {
          throw new Error(
            'Performance entry does not belong to athlete',
          );
        }

        return sessionStructure
          .updatePerformanceEntryActual({
            performanceEntryId:
              input.performanceEntryId,

            athleteId:
              input.athleteId,

            actualReps:
              input.reps ??
              null,

            actualLoadKg:
              input.loadKg ??
              null,

            actualDistanceM:
              input.distanceM ??
              null,

            actualDurationMs:
              input.durationMs ??
              null,

            actualResultM:
              input.resultM ??
              null,

            actualHeightM:
              input.heightM ??
              null,

            actualRpe:
              input.rpe ??
              null,

            actualRir:
              input.rir ??
              null,

            actualRestSeconds:
              input.restSeconds ??
              null,

            actualSuccess:
              input.success ??
              null,

            actualIsFoul:
              input.isFoul ??
              null,

            actualMetrics:
              input.metrics ??
              {},

            actualNotes:
              input.notes ??
              null,
          });
      },
    );
  };

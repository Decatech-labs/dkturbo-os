import type {
  AthleteId,
  DkturboUserId,
  PerformanceEntry,
  SessionExerciseId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

export interface PerformanceEntryMetrics {
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

  metrics?:
    Readonly<
      Record<
        string,
        unknown
      >
    >;

  notes?:
    string | null;
}

export interface ActualPerformanceEntryMetrics
extends PerformanceEntryMetrics {
  success?:
    boolean | null;

  isFoul?:
    boolean | null;
}

export interface AddPerformanceEntryInput {
  athleteId:
    AthleteId;

  sessionExerciseId:
    SessionExerciseId;

  position:
    number;

  planned?:
    PerformanceEntryMetrics;

  actual?:
    ActualPerformanceEntryMetrics;

  createdByUserId:
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

const validateMetrics =
  (
    prefix:
      'planned' | 'actual',

    metrics:
      PerformanceEntryMetrics | undefined,
  ): void => {

    if (!metrics) {
      return;
    }

    requireNonNegativeInteger(
      metrics.reps,
      `${prefix}.reps`,
    );

    requireNonNegativeNumber(
      metrics.loadKg,
      `${prefix}.loadKg`,
    );

    requireNonNegativeNumber(
      metrics.distanceM,
      `${prefix}.distanceM`,
    );

    requireNonNegativeInteger(
      metrics.durationMs,
      `${prefix}.durationMs`,
    );

    requireNonNegativeNumber(
      metrics.resultM,
      `${prefix}.resultM`,
    );

    requireNonNegativeNumber(
      metrics.heightM,
      `${prefix}.heightM`,
    );

    requireRpe(
      metrics.rpe,
      `${prefix}.rpe`,
    );

    requireNonNegativeNumber(
      metrics.rir,
      `${prefix}.rir`,
    );

    requireNonNegativeInteger(
      metrics.restSeconds,
      `${prefix}.restSeconds`,
    );
  };

export const addPerformanceEntry =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      AddPerformanceEntryInput,
  ): Promise<PerformanceEntry> => {

    if (
      !Number.isInteger(
        input.position,
      ) ||
      input.position < 0
    ) {
      throw new Error(
        'Performance entry position must be a non-negative integer',
      );
    }

    validateMetrics(
      'planned',
      input.planned,
    );

    validateMetrics(
      'actual',
      input.actual,
    );

    return unitOfWork.execute(
      async ({
        athletes,
        sessionStructure,
      }) => {

        await requireAthleteWriteAccess(
          athletes,
          input.athleteId,
          input.createdByUserId,
        );

        const sessionExercise =
          await sessionStructure
            .findSessionExerciseById(
              input.sessionExerciseId,
            );

        if (!sessionExercise) {
          throw new Error(
            'Session exercise not found',
          );
        }

        if (
          sessionExercise.athleteId !==
          input.athleteId
        ) {
          throw new Error(
            'Session exercise does not belong to athlete',
          );
        }

        return sessionStructure
          .createPerformanceEntry({
            sessionExerciseId:
              input.sessionExerciseId,

            athleteId:
              input.athleteId,

            position:
              input.position,

            plannedReps:
              input.planned?.reps ??
              null,

            actualReps:
              input.actual?.reps ??
              null,

            plannedLoadKg:
              input.planned?.loadKg ??
              null,

            actualLoadKg:
              input.actual?.loadKg ??
              null,

            plannedDistanceM:
              input.planned?.distanceM ??
              null,

            actualDistanceM:
              input.actual?.distanceM ??
              null,

            plannedDurationMs:
              input.planned?.durationMs ??
              null,

            actualDurationMs:
              input.actual?.durationMs ??
              null,

            plannedResultM:
              input.planned?.resultM ??
              null,

            actualResultM:
              input.actual?.resultM ??
              null,

            plannedHeightM:
              input.planned?.heightM ??
              null,

            actualHeightM:
              input.actual?.heightM ??
              null,

            plannedRpe:
              input.planned?.rpe ??
              null,

            actualRpe:
              input.actual?.rpe ??
              null,

            plannedRir:
              input.planned?.rir ??
              null,

            actualRir:
              input.actual?.rir ??
              null,

            plannedRestSeconds:
              input.planned?.restSeconds ??
              null,

            actualRestSeconds:
              input.actual?.restSeconds ??
              null,

            actualSuccess:
              input.actual?.success ??
              null,

            actualIsFoul:
              input.actual?.isFoul ??
              null,

            plannedMetrics:
              input.planned?.metrics ??
              {},

            actualMetrics:
              input.actual?.metrics ??
              {},

            plannedNotes:
              input.planned?.notes ??
              null,

            actualNotes:
              input.actual?.notes ??
              null,
          });
      },
    );
  };

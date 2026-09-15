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

export interface UpdatePerformanceEntryPlannedInput {
  athleteId:
    AthleteId;

  performanceEntryId:
    PerformanceEntryId;

  reps:
    number | null;

  loadKg:
    number | null;

  distanceM:
    number | null;

  durationMs:
    number | null;

  resultM:
    number | null;

  heightM:
    number | null;

  rpe:
    number | null;

  rir:
    number | null;

  restSeconds:
    number | null;

  metrics?:
    Readonly<
      Record<
        string,
        unknown
      >
    >;

  notes:
    string | null;

  updatedByUserId:
    DkturboUserId;
}

const requireNonNegativeInteger =
  (
    value:
      number | null,
    field:
      string,
  ): void => {
    if (
      value !== null &&
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
      number | null,
    field:
      string,
  ): void => {
    if (
      value !== null &&
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
      number | null,
  ): void => {
    if (
      value !== null &&
      (
        !Number.isFinite(
          value,
        ) ||
        value < 0 ||
        value > 10
      )
    ) {
      throw new Error(
        'rpe must be between 0 and 10',
      );
    }
  };

export const updatePerformanceEntryPlanned =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      UpdatePerformanceEntryPlannedInput,
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
          .updatePerformanceEntryPlanned({
            performanceEntryId:
              input.performanceEntryId,

            athleteId:
              input.athleteId,

            plannedReps:
              input.reps,

            plannedLoadKg:
              input.loadKg,

            plannedDistanceM:
              input.distanceM,

            plannedDurationMs:
              input.durationMs,

            plannedResultM:
              input.resultM,

            plannedHeightM:
              input.heightM,

            plannedRpe:
              input.rpe,

            plannedRir:
              input.rir,

            plannedRestSeconds:
              input.restSeconds,

            plannedMetrics:
              input.metrics ??
              entry.plannedMetrics,

            plannedNotes:
              input.notes,
          });
      },
    );
  };

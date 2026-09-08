import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  AthleteAccess,
  AthleteId,
  DkturboUserId,
  PerformanceEntry,
  PerformanceEntryId,
  SessionExerciseId,
} from '../domain/index.js';

import type {
  AthleteRepository,
  SessionRepository,
  SessionStructureRepository,
  TrainingUnitOfWork,
  WeekRepository,
} from '../ports/index.js';

import {
  recordPerformanceEntryActual,
} from './record-performance-entry-actual.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =
  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const performanceEntryId =
  'a0000000-0000-4000-8000-000000000001' as PerformanceEntryId;

const now =
  new Date(
    '2026-09-08T21:00:00Z',
  );

const access:
  AthleteAccess = {
    id:
      '90000000-0000-4000-8000-000000000001',

    athleteId,

    userId,

    role:
      'COACH',

    createdAt:
      now,
  };

const plannedEntry:
  PerformanceEntry = {
    id:
      performanceEntryId,

    sessionExerciseId:
      '80000000-0000-4000-8000-000000000001' as SessionExerciseId,

    athleteId,

    position:
      0,

    plannedReps:
      6,

    actualReps:
      null,

    plannedLoadKg:
      80,

    actualLoadKg:
      null,

    plannedDistanceM:
      null,

    actualDistanceM:
      null,

    plannedDurationMs:
      null,

    actualDurationMs:
      null,

    plannedResultM:
      null,

    actualResultM:
      null,

    plannedHeightM:
      null,

    actualHeightM:
      null,

    plannedRpe:
      8,

    actualRpe:
      null,

    plannedRir:
      2,

    actualRir:
      null,

    plannedRestSeconds:
      180,

    actualRestSeconds:
      null,

    actualSuccess:
      null,

    actualIsFoul:
      null,

    plannedMetrics: {
      tempo:
        '3-1-1',
    },

    actualMetrics:
      {},

    plannedNotes:
      'Plan original',

    actualNotes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };

const updatedEntry:
  PerformanceEntry = {
    ...plannedEntry,

    actualReps:
      6,

    actualLoadKg:
      82.5,

    actualRpe:
      8.5,

    actualRir:
      1,

    actualRestSeconds:
      200,

    actualMetrics: {
      pain:
        1,
    },

    actualNotes:
      'Mejor de lo previsto',

    updatedAt:
      new Date(
        '2026-09-08T21:05:00Z',
      ),
  };

const createAthletes =
  (): AthleteRepository => ({
    create:
      vi.fn(),

    findById:
      vi.fn(),

    listForUser:
      vi.fn(),

    grantAccess:
      vi.fn(),

    findAccess:
      vi.fn()
        .mockResolvedValue(
          access,
        ),
  });

const createStructure =
  (): SessionStructureRepository => ({
    createBlock:
      vi.fn(),

    findBlockById:
      vi.fn(),

    createCustomExercise:
      vi.fn(),

    findExerciseById:
      vi.fn(),

    searchAvailableExercises:
      vi.fn(),

    addExercise:
      vi.fn(),

    findSessionExerciseById:
      vi.fn(),

    listExercisesForBlock:
      vi.fn(),

    createPerformanceEntry:
      vi.fn(),

    findPerformanceEntryById:
      vi.fn()
        .mockResolvedValue(
          plannedEntry,
        ),

    updatePerformanceEntryActual:
      vi.fn()
        .mockResolvedValue(
          updatedEntry,
        ),

    listPerformanceEntries:
      vi.fn(),
  });

const weeks =
  {} as WeekRepository;

const sessions =
  {} as SessionRepository;

const createUnitOfWork =
  (
    athletes:
      AthleteRepository,

    sessionStructure:
      SessionStructureRepository,
  ): TrainingUnitOfWork => ({
    execute:
      async (work) =>
        work({
          athletes,
          weeks,
          sessions,
          sessionStructure,
        }),
  });

describe(
  'recordPerformanceEntryActual',
  () => {

    it(
      'records actual execution for an existing planned entry',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        const result =
          await recordPerformanceEntryActual(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              performanceEntryId,

              reps:
                6,

              loadKg:
                82.5,

              rpe:
                8.5,

              rir:
                1,

              restSeconds:
                200,

              metrics: {
                pain:
                  1,
              },

              notes:
                'Mejor de lo previsto',

              updatedByUserId:
                userId,
            },
          );

        expect(
          structure.updatePerformanceEntryActual,
        ).toHaveBeenCalledWith({
          performanceEntryId,

          athleteId,

          actualReps:
            6,

          actualLoadKg:
            82.5,

          actualDistanceM:
            null,

          actualDurationMs:
            null,

          actualResultM:
            null,

          actualHeightM:
            null,

          actualRpe:
            8.5,

          actualRir:
            1,

          actualRestSeconds:
            200,

          actualSuccess:
            null,

          actualIsFoul:
            null,

          actualMetrics: {
            pain:
              1,
          },

          actualNotes:
            'Mejor de lo previsto',
        });

        expect(
          result,
        ).toEqual(
          updatedEntry,
        );
      },
    );

    it(
      'preserves planned values in the returned entry',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        const result =
          await recordPerformanceEntryActual(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              performanceEntryId,

              reps:
                6,

              loadKg:
                82.5,

              rpe:
                8.5,

              updatedByUserId:
                userId,
            },
          );

        expect(
          result.plannedReps,
        ).toBe(
          6,
        );

        expect(
          result.plannedLoadKg,
        ).toBe(
          80,
        );

        expect(
          result.plannedRpe,
        ).toBe(
          8,
        );

        expect(
          result.plannedRir,
        ).toBe(
          2,
        );

        expect(
          result.plannedRestSeconds,
        ).toBe(
          180,
        );

        expect(
          result.plannedMetrics,
        ).toEqual({
          tempo:
            '3-1-1',
        });

        expect(
          result.plannedNotes,
        ).toBe(
          'Plan original',
        );
      },
    );

    it(
      'records a throwing result without planned values',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.updatePerformanceEntryActual,
        ).mockResolvedValue({
          ...plannedEntry,

          actualResultM:
            63.1,

          actualIsFoul:
            false,
        });

        await recordPerformanceEntryActual(
          createUnitOfWork(
            athletes,
            structure,
          ),
          {
            athleteId,

            performanceEntryId,

            resultM:
              63.1,

            isFoul:
              false,

            updatedByUserId:
              userId,
          },
        );

        expect(
          structure.updatePerformanceEntryActual,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            actualResultM:
              63.1,

            actualIsFoul:
              false,
          }),
        );
      },
    );

    it(
      'records a pole vault attempt',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await recordPerformanceEntryActual(
          createUnitOfWork(
            athletes,
            structure,
          ),
          {
            athleteId,

            performanceEntryId,

            heightM:
              5,

            success:
              true,

            updatedByUserId:
              userId,
          },
        );

        expect(
          structure.updatePerformanceEntryActual,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            actualHeightM:
              5,

            actualSuccess:
              true,
          }),
        );
      },
    );

    it(
      'rejects a missing performance entry',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.findPerformanceEntryById,
        ).mockResolvedValue(
          null,
        );

        await expect(
          recordPerformanceEntryActual(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              performanceEntryId,

              reps:
                6,

              updatedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Performance entry not found',
        );

        expect(
          structure.updatePerformanceEntryActual,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a performance entry belonging to another athlete',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.findPerformanceEntryById,
        ).mockResolvedValue({
          ...plannedEntry,

          athleteId:
            otherAthleteId,
        });

        await expect(
          recordPerformanceEntryActual(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              performanceEntryId,

              reps:
                6,

              updatedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Performance entry does not belong to athlete',
        );

        expect(
          structure.updatePerformanceEntryActual,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a user without athlete write access',
      async () => {

        const athletes =
          createAthletes();

        vi.mocked(
          athletes.findAccess,
        ).mockResolvedValue(
          null,
        );

        const structure =
          createStructure();

        await expect(
          recordPerformanceEntryActual(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              performanceEntryId,

              reps:
                6,

              updatedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'User does not have write access to athlete',
        );

        expect(
          structure.findPerformanceEntryById,
        ).not.toHaveBeenCalled();

        expect(
          structure.updatePerformanceEntryActual,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects negative metrics before opening a transaction',
      async () => {

        const execute =
          vi.fn();

        await expect(
          recordPerformanceEntryActual(
            {
              execute,
            },
            {
              athleteId,

              performanceEntryId,

              loadKg:
                -1,

              updatedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'loadKg must be a non-negative number',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects fractional integer metrics before opening a transaction',
      async () => {

        const execute =
          vi.fn();

        await expect(
          recordPerformanceEntryActual(
            {
              execute,
            },
            {
              athleteId,

              performanceEntryId,

              reps:
                5.5,

              updatedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'reps must be a non-negative integer',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects RPE outside the 0 to 10 range before opening a transaction',
      async () => {

        const execute =
          vi.fn();

        await expect(
          recordPerformanceEntryActual(
            {
              execute,
            },
            {
              athleteId,

              performanceEntryId,

              rpe:
                10.1,

              updatedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'rpe must be between 0 and 10',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );
  },
);

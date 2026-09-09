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
  SessionExercise,
  SessionExerciseId,
  SessionBlockId,
  ExerciseCatalogId,
  TrainingSessionId,
} from '../domain/index.js';

import type {
  AthleteRepository,
  SessionRepository,
  SessionStructureRepository,
  TrainingUnitOfWork,
  WeekRepository,
} from '../ports/index.js';

import {
  addPerformanceEntry,
} from './add-performance-entry.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =
  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const sessionExerciseId =
  '80000000-0000-4000-8000-000000000001' as SessionExerciseId;

const now =
  new Date(
    '2026-09-08T20:30:00Z',
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

const sessionExercise:
  SessionExercise = {
    id:
      sessionExerciseId,

    blockId:
      '60000000-0000-4000-8000-000000000001' as SessionBlockId,

    sessionId:
      '50000000-0000-4000-8000-000000000001' as TrainingSessionId,

    athleteId,

    exerciseId:
      '70000000-0000-4000-8000-000000000001' as ExerciseCatalogId,

    position:
      0,

    plannedNotes:
      null,

    actualNotes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };

const performanceEntry:
  PerformanceEntry = {
    id:
      'a0000000-0000-4000-8000-000000000001' as PerformanceEntryId,

    sessionExerciseId,

    athleteId,

    position:
      0,

    plannedReps:
      6,

    actualReps:
      6,

    plannedLoadKg:
      80,

    actualLoadKg:
      82.5,

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
      8.5,

    plannedRir:
      null,

    actualRir:
      null,

    plannedRestSeconds:
      null,

    actualRestSeconds:
      null,

    actualSuccess:
      null,

    actualIsFoul:
      null,

    plannedMetrics:
      {},

    actualMetrics:
      {},

    plannedNotes:
      null,

    actualNotes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
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
      vi.fn()
        .mockResolvedValue(
          sessionExercise,
        ),

    listExercisesForBlock:
      vi.fn(),

    createPerformanceEntry:
      vi.fn()
        .mockResolvedValue(
          performanceEntry,
        ),

    listPerformanceEntries:
      vi.fn(),

    findPerformanceEntryById:
      vi.fn(),

    updatePerformanceEntryActual:
      vi.fn(),

    listBlocksForSession:
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
  'addPerformanceEntry',
  () => {

    it(
      'creates a strength entry with planned and actual values separated',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        const result =
          await addPerformanceEntry(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              sessionExerciseId,

              position:
                0,

              planned: {
                reps:
                  6,

                loadKg:
                  80,

                rpe:
                  8,
              },

              actual: {
                reps:
                  6,

                loadKg:
                  82.5,

                rpe:
                  8.5,
              },

              createdByUserId:
                userId,
            },
          );

        expect(
          structure.createPerformanceEntry,
        ).toHaveBeenCalledWith({
          sessionExerciseId,

          athleteId,

          position:
            0,

          plannedReps:
            6,

          actualReps:
            6,

          plannedLoadKg:
            80,

          actualLoadKg:
            82.5,

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
            8.5,

          plannedRir:
            null,

          actualRir:
            null,

          plannedRestSeconds:
            null,

          actualRestSeconds:
            null,

          actualSuccess:
            null,

          actualIsFoul:
            null,

          plannedMetrics:
            {},

          actualMetrics:
            {},

          plannedNotes:
            null,

          actualNotes:
            null,
        });

        expect(
          result,
        ).toEqual(
          performanceEntry,
        );
      },
    );

    it(
      'creates a running interval entry',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await addPerformanceEntry(
          createUnitOfWork(
            athletes,
            structure,
          ),
          {
            athleteId,

            sessionExerciseId,

            position:
              1,

            planned: {
              distanceM:
                300,

              durationMs:
                38_000,

              restSeconds:
                240,
            },

            actual: {
              distanceM:
                300,

              durationMs:
                37_720,

              restSeconds:
                240,
            },

            createdByUserId:
              userId,
          },
        );

        expect(
          structure.createPerformanceEntry,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            plannedDistanceM:
              300,

            actualDistanceM:
              300,

            plannedDurationMs:
              38_000,

            actualDurationMs:
              37_720,

            plannedRestSeconds:
              240,

            actualRestSeconds:
              240,
          }),
        );
      },
    );

    it(
      'creates a throwing attempt with result and foul state',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await addPerformanceEntry(
          createUnitOfWork(
            athletes,
            structure,
          ),
          {
            athleteId,

            sessionExerciseId,

            position:
              2,

            actual: {
              resultM:
                63.1,

              isFoul:
                false,
            },

            createdByUserId:
              userId,
          },
        );

        expect(
          structure.createPerformanceEntry,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            plannedResultM:
              null,

            actualResultM:
              63.1,

            actualIsFoul:
              false,
          }),
        );
      },
    );

    it(
      'creates a pole vault attempt with height and success',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await addPerformanceEntry(
          createUnitOfWork(
            athletes,
            structure,
          ),
          {
            athleteId,

            sessionExerciseId,

            position:
              3,

            actual: {
              heightM:
                5,

              success:
                true,
            },

            createdByUserId:
              userId,
          },
        );

        expect(
          structure.createPerformanceEntry,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            plannedHeightM:
              null,

            actualHeightM:
              5,

            actualSuccess:
              true,
          }),
        );
      },
    );

    it(
      'allows an actual-only improvised entry',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await addPerformanceEntry(
          createUnitOfWork(
            athletes,
            structure,
          ),
          {
            athleteId,

            sessionExerciseId,

            position:
              4,

            actual: {
              reps:
                12,

              loadKg:
                20,

              metrics: {
                pain:
                  2,

                romDegrees:
                  110,
              },

              notes:
                'Añadido durante la sesión',
            },

            createdByUserId:
              userId,
          },
        );

        expect(
          structure.createPerformanceEntry,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            plannedReps:
              null,

            actualReps:
              12,

            plannedLoadKg:
              null,

            actualLoadKg:
              20,

            plannedMetrics:
              {},

            actualMetrics: {
              pain:
                2,

              romDegrees:
                110,
            },

            actualNotes:
              'Añadido durante la sesión',
          }),
        );
      },
    );

    it(
      'rejects a session exercise belonging to another athlete',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.findSessionExerciseById,
        ).mockResolvedValue({
          ...sessionExercise,

          athleteId:
            otherAthleteId,
        });

        await expect(
          addPerformanceEntry(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              sessionExerciseId,

              position:
                0,

              actual: {
                reps:
                  6,
              },

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Session exercise does not belong to athlete',
        );

        expect(
          structure.createPerformanceEntry,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a missing session exercise',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.findSessionExerciseById,
        ).mockResolvedValue(
          null,
        );

        await expect(
          addPerformanceEntry(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              sessionExerciseId,

              position:
                0,

              actual: {
                reps:
                  6,
              },

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Session exercise not found',
        );

        expect(
          structure.createPerformanceEntry,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects an invalid position before opening a transaction',
      async () => {

        const execute =
          vi.fn();

        await expect(
          addPerformanceEntry(
            {
              execute,
            },
            {
              athleteId,

              sessionExerciseId,

              position:
                -1,

              actual: {
                reps:
                  6,
              },

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Performance entry position must be a non-negative integer',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects negative metrics before opening a transaction',
      async () => {

        const execute =
          vi.fn();

        await expect(
          addPerformanceEntry(
            {
              execute,
            },
            {
              athleteId,

              sessionExerciseId,

              position:
                0,

              actual: {
                loadKg:
                  -10,
              },

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'actual.loadKg must be a non-negative number',
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
          addPerformanceEntry(
            {
              execute,
            },
            {
              athleteId,

              sessionExerciseId,

              position:
                0,

              actual: {
                rpe:
                  11,
              },

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'actual.rpe must be between 0 and 10',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects fractional values for integer metrics',
      async () => {

        const execute =
          vi.fn();

        await expect(
          addPerformanceEntry(
            {
              execute,
            },
            {
              athleteId,

              sessionExerciseId,

              position:
                0,

              actual: {
                reps:
                  6.5,
              },

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'actual.reps must be a non-negative integer',
        );

        expect(
          execute,
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
          addPerformanceEntry(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              sessionExerciseId,

              position:
                0,

              actual: {
                reps:
                  6,
              },

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'User does not have write access to athlete',
        );

        expect(
          structure.createPerformanceEntry,
        ).not.toHaveBeenCalled();
      },
    );
  },
);

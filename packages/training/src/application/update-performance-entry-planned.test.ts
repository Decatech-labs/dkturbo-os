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
  updatePerformanceEntryPlanned,
} from './update-performance-entry-planned.js';

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
    '2026-09-14T15:30:00Z',
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

const performanceEntry:
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
    ...performanceEntry,

    plannedReps:
      8,

    plannedLoadKg:
      82.5,

    plannedRpe:
      8.5,

    plannedRir:
      1,

    plannedRestSeconds:
      150,

    plannedMetrics: {
      tempo:
        '2-1-1',
    },

    plannedNotes:
      'Plan actualizado',

    updatedAt:
      new Date(
        '2026-09-14T15:35:00Z',
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

    listPerformanceEntries:
      vi.fn(),

    findPerformanceEntryById:
      vi.fn()
        .mockResolvedValue(
          performanceEntry,
        ),

    updatePerformanceEntryActual:
      vi.fn(),

    updatePerformanceEntryPlanned:
      vi.fn()
        .mockResolvedValue(
          updatedEntry,
        ),

    deletePerformanceEntry:
      vi.fn(),

    reorderPerformanceEntries:
      vi.fn(),

    listBlocksForSession:
      vi.fn(),

    updateBlock:
      vi.fn(),

    deleteBlock:
      vi.fn(),

    reorderBlocks:
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

const createInput =
  () => ({
    athleteId,

    performanceEntryId,

    reps:
      8,

    loadKg:
      82.5,

    distanceM:
      null,

    durationMs:
      null,

    resultM:
      null,

    heightM:
      null,

    rpe:
      8.5,

    rir:
      1,

    restSeconds:
      150,

    metrics: {
      tempo:
        '2-1-1',
    },

    notes:
      'Plan actualizado',

    updatedByUserId:
      userId,
  });

describe(
  'updatePerformanceEntryPlanned',
  () => {
    it(
      'updates planned values for an existing performance entry',
      async () => {
        const athletes =
          createAthletes();

        const structure =
          createStructure();

        const result =
          await updatePerformanceEntryPlanned(
            createUnitOfWork(
              athletes,
              structure,
            ),
            createInput(),
          );

        expect(
          structure.updatePerformanceEntryPlanned,
        ).toHaveBeenCalledWith({
          performanceEntryId,

          athleteId,

          plannedReps:
            8,

          plannedLoadKg:
            82.5,

          plannedDistanceM:
            null,

          plannedDurationMs:
            null,

          plannedResultM:
            null,

          plannedHeightM:
            null,

          plannedRpe:
            8.5,

          plannedRir:
            1,

          plannedRestSeconds:
            150,

          plannedMetrics: {
            tempo:
              '2-1-1',
          },

          plannedNotes:
            'Plan actualizado',
        });

        expect(
          result,
        ).toEqual(
          updatedEntry,
        );
      },
    );

    it(
      'allows clearing optional planned values',
      async () => {
        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await updatePerformanceEntryPlanned(
          createUnitOfWork(
            athletes,
            structure,
          ),
          {
            ...createInput(),

            reps:
              null,

            loadKg:
              null,

            rpe:
              null,

            rir:
              null,

            restSeconds:
              null,

            metrics:
              {},

            notes:
              null,
          },
        );

        expect(
          structure.updatePerformanceEntryPlanned,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            plannedReps:
              null,

            plannedLoadKg:
              null,

            plannedRpe:
              null,

            plannedRir:
              null,

            plannedRestSeconds:
              null,

            plannedMetrics:
              {},

            plannedNotes:
              null,
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
          updatePerformanceEntryPlanned(
            createUnitOfWork(
              athletes,
              structure,
            ),
            createInput(),
          ),
        ).rejects.toThrow(
          'Performance entry not found',
        );

        expect(
          structure.updatePerformanceEntryPlanned,
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
          ...performanceEntry,

          athleteId:
            otherAthleteId,
        });

        await expect(
          updatePerformanceEntryPlanned(
            createUnitOfWork(
              athletes,
              structure,
            ),
            createInput(),
          ),
        ).rejects.toThrow(
          'Performance entry does not belong to athlete',
        );

        expect(
          structure.updatePerformanceEntryPlanned,
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
          updatePerformanceEntryPlanned(
            createUnitOfWork(
              athletes,
              structure,
            ),
            createInput(),
          ),
        ).rejects.toThrow(
          'User does not have write access to athlete',
        );

        expect(
          structure.findPerformanceEntryById,
        ).not.toHaveBeenCalled();

        expect(
          structure.updatePerformanceEntryPlanned,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects VIEWER access',
      async () => {
        const athletes =
          createAthletes();

        vi.mocked(
          athletes.findAccess,
        ).mockResolvedValue({
          ...access,

          role:
            'VIEWER',
        });

        const structure =
          createStructure();

        await expect(
          updatePerformanceEntryPlanned(
            createUnitOfWork(
              athletes,
              structure,
            ),
            createInput(),
          ),
        ).rejects.toThrow(
          'User does not have write access to athlete',
        );

        expect(
          structure.updatePerformanceEntryPlanned,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects RPE above 10 before opening a transaction',
      async () => {
        const execute =
          vi.fn();

        await expect(
          updatePerformanceEntryPlanned(
            {
              execute,
            },
            {
              ...createInput(),

              rpe:
                11,
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

    it(
      'rejects negative numeric values before opening a transaction',
      async () => {
        const execute =
          vi.fn();

        await expect(
          updatePerformanceEntryPlanned(
            {
              execute,
            },
            {
              ...createInput(),

              loadKg:
                -1,
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
          updatePerformanceEntryPlanned(
            {
              execute,
            },
            {
              ...createInput(),

              reps:
                7.5,
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
  },
);

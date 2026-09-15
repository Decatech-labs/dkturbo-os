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
  deletePerformanceEntry,
} from './delete-performance-entry.js';

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
      vi.fn(),

    deletePerformanceEntry:
      vi.fn()
        .mockResolvedValue(
          true,
        ),

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

describe(
  'deletePerformanceEntry',
  () => {
    it(
      'deletes an existing performance entry',
      async () => {
        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await deletePerformanceEntry(
          createUnitOfWork(
            athletes,
            structure,
          ),
          {
            athleteId,

            performanceEntryId,

            deletedByUserId:
              userId,
          },
        );

        expect(
          structure.deletePerformanceEntry,
        ).toHaveBeenCalledWith(
          performanceEntryId,
          athleteId,
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
          deletePerformanceEntry(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              performanceEntryId,

              deletedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Performance entry not found',
        );

        expect(
          structure.deletePerformanceEntry,
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
          deletePerformanceEntry(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              performanceEntryId,

              deletedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Performance entry does not belong to athlete',
        );

        expect(
          structure.deletePerformanceEntry,
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
          deletePerformanceEntry(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              performanceEntryId,

              deletedByUserId:
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
          structure.deletePerformanceEntry,
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
          deletePerformanceEntry(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              performanceEntryId,

              deletedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'User does not have write access to athlete',
        );

        expect(
          structure.deletePerformanceEntry,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'reports not found if the repository cannot delete the entry',
      async () => {
        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.deletePerformanceEntry,
        ).mockResolvedValue(
          false,
        );

        await expect(
          deletePerformanceEntry(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,

              performanceEntryId,

              deletedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Performance entry not found',
        );

        expect(
          structure.deletePerformanceEntry,
        ).toHaveBeenCalledWith(
          performanceEntryId,
          athleteId,
        );
      },
    );
  },
);

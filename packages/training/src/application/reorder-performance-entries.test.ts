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

  ExerciseCatalogId,

  PerformanceEntry,

  PerformanceEntryId,

  SessionBlockId,

  SessionExercise,

  SessionExerciseId,

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

  reorderPerformanceEntries,

} from './reorder-performance-entries.js';

const athleteId =

  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =

  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =

  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const sessionExerciseId =

  '80000000-0000-4000-8000-000000000001' as SessionExerciseId;

const entryId1 =

  'a0000000-0000-4000-8000-000000000001' as PerformanceEntryId;

const entryId2 =

  'a0000000-0000-4000-8000-000000000002' as PerformanceEntryId;

const entryId3 =

  'a0000000-0000-4000-8000-000000000003' as PerformanceEntryId;

const now =

  new Date(
    '2026-09-14T16:45:00Z',
  );

const access:

  AthleteAccess = {

    id:
      '90000000-0000-4000-8000-000000000001',

    athleteId,

    userId,

    role:
      'SELF',

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

const createEntry =

  (
    id:
      PerformanceEntryId,

    position:
      number,

  ): PerformanceEntry => ({

    id,

    sessionExerciseId,

    athleteId,

    position,

    plannedReps:
      8,

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
      7,

    actualRpe:
      null,

    plannedRir:
      2,

    actualRir:
      null,

    plannedRestSeconds:
      120,

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

  });

const entry1 =
  createEntry(
    entryId1,
    0,
  );

const entry2 =
  createEntry(
    entryId2,
    1,
  );

const entry3 =
  createEntry(
    entryId3,
    2,
  );

const createAthletes =

  (): AthleteRepository => ({

    create:
      vi.fn(),

    findById:
      vi.fn(),

    listAll:
      vi.fn(),

    listForUser:
      vi.fn(),

    grantAccess:
      vi.fn(),

    revokeAccess:
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

    listBlocksForSession:
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
      vi.fn(),

    listPerformanceEntries:
      vi.fn()
        .mockResolvedValue([
          entry1,
          entry2,
          entry3,
        ]),

    findPerformanceEntryById:
      vi.fn(),

    updatePerformanceEntryPlanned:
      vi.fn(),

    deletePerformanceEntry:
      vi.fn(),

    reorderPerformanceEntries:
      vi.fn()
        .mockResolvedValue([
          {
            ...entry3,
            position:
              0,
          },
          {
            ...entry1,
            position:
              1,
          },
          {
            ...entry2,
            position:
              2,
          },
        ]),

    updatePerformanceEntryActual:
      vi.fn(),

    updateBlock:
      vi.fn(),

    deleteBlock:
      vi.fn(),

    reorderBlocks:
      vi.fn(),

    updateSessionExercisePlanned:
      vi.fn(),

    deleteSessionExercise:
      vi.fn(),

    applySessionExerciseLayout:
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
      async (
        work,
      ) =>
        work({

          athletes,

          weeks,

          sessions,

          sessionStructure,

          dailyCheckins:
            {} as never,

        }),

  });

describe(

  'reorderPerformanceEntries',

  () => {

    it(

      'reorders every performance entry of the session exercise',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        const result =

          await reorderPerformanceEntries(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              orderedIds: [
                entryId3,
                entryId1,
                entryId2,
              ],

              updatedByUserId:
                userId,

            },

          );

        expect(
          structure.reorderPerformanceEntries,
        ).toHaveBeenCalledWith(

          sessionExerciseId,

          athleteId,

          [
            entryId3,
            entryId1,
            entryId2,
          ],

        );

        expect(
          result.map(
            entry =>
              entry.id,
          ),
        ).toEqual([
          entryId3,
          entryId1,
          entryId2,
        ]);

      },

    );

    it(

      'rejects duplicate ids before opening a transaction',

      async () => {

        const execute =
          vi.fn();

        await expect(

          reorderPerformanceEntries(

            {
              execute,
            },

            {

              athleteId,

              sessionExerciseId,

              orderedIds: [
                entryId1,
                entryId1,
                entryId3,
              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(

          'Performance entry order contains duplicate ids',

        );

        expect(
          execute,
        ).not.toHaveBeenCalled();

      },

    );

    it(

      'rejects an incomplete order',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await expect(

          reorderPerformanceEntries(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              orderedIds: [
                entryId1,
                entryId2,
              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(

          'Performance entry order must contain every entry exactly once',

        );

        expect(
          structure.reorderPerformanceEntries,
        ).not.toHaveBeenCalled();

      },

    );

    it(

      'rejects an order containing an entry from outside the exercise',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        const foreignEntryId =
          'a0000000-0000-4000-8000-000000000099' as PerformanceEntryId;

        await expect(

          reorderPerformanceEntries(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              orderedIds: [
                entryId1,
                entryId2,
                foreignEntryId,
              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(

          'Performance entry order must contain every entry exactly once',

        );

        expect(
          structure.reorderPerformanceEntries,
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

          reorderPerformanceEntries(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              orderedIds: [
                entryId1,
                entryId2,
                entryId3,
              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(

          'Session exercise not found',

        );

        expect(
          structure.reorderPerformanceEntries,
        ).not.toHaveBeenCalled();

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

          reorderPerformanceEntries(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              orderedIds: [
                entryId1,
                entryId2,
                entryId3,
              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(

          'Session exercise does not belong to athlete',

        );

        expect(
          structure.reorderPerformanceEntries,
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

          reorderPerformanceEntries(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              orderedIds: [
                entryId1,
                entryId2,
                entryId3,
              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(

          'User does not have write access to athlete',

        );

        expect(
          structure.findSessionExerciseById,
        ).not.toHaveBeenCalled();

        expect(
          structure.reorderPerformanceEntries,
        ).not.toHaveBeenCalled();

      },

    );

  },

);

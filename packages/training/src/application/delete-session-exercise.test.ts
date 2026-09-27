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

  deleteSessionExercise,

} from './delete-session-exercise.js';

const athleteId =

  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =

  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =

  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const sessionId =

  '50000000-0000-4000-8000-000000000001' as TrainingSessionId;

const blockId =

  '60000000-0000-4000-8000-000000000001' as SessionBlockId;

const sessionExerciseId =

  '80000000-0000-4000-8000-000000000001' as SessionExerciseId;

const exerciseId =

  '90000000-0000-4000-8000-000000000001' as ExerciseCatalogId;

const now =

  new Date(
    '2026-09-15T15:15:00Z',
  );

const access:

  AthleteAccess = {

    id:
      '70000000-0000-4000-8000-000000000001',

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

    blockId,

    sessionId,

    athleteId,

    exerciseId,

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

    updateBlock:
      vi.fn(),

    deleteBlock:
      vi.fn(),

    reorderBlocks:
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

    updateSessionExercisePlanned:
      vi.fn(),

    deleteSessionExercise:
      vi.fn()
        .mockResolvedValue(
          true,
        ),

    applySessionExerciseLayout:
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
      vi.fn(),

    findPerformanceEntryById:
      vi.fn(),

    updatePerformanceEntryPlanned:
      vi.fn(),

    deletePerformanceEntry:
      vi.fn(),

    reorderPerformanceEntries:
      vi.fn(),

    updatePerformanceEntryActual:
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

  'deleteSessionExercise',

  () => {

    it(

      'deletes a session exercise for an authorized athlete',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await deleteSessionExercise(

          createUnitOfWork(
            athletes,
            structure,
          ),

          {

            athleteId,

            sessionExerciseId,

            deletedByUserId:
              userId,

          },

        );

        expect(

          structure.deleteSessionExercise,

        ).toHaveBeenCalledWith(
          sessionExerciseId,
          athleteId,
        );

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

          deleteSessionExercise(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              deletedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Session exercise not found',
        );

        expect(

          structure.deleteSessionExercise,

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

          deleteSessionExercise(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              deletedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Session exercise does not belong to athlete',
        );

        expect(

          structure.deleteSessionExercise,

        ).not.toHaveBeenCalled();

      },

    );

    it(

      'rejects when the scoped delete no longer finds the exercise',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.deleteSessionExercise,
        ).mockResolvedValue(
          false,
        );

        await expect(

          deleteSessionExercise(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              deletedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Session exercise not found',
        );

      },

    );

  },

);

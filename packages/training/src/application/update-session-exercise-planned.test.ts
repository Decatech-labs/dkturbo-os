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

  updateSessionExercisePlanned,

} from './update-session-exercise-planned.js';

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
      'SELF',

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
      'Técnica estricta',

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
      vi.fn()
        .mockResolvedValue({

          ...sessionExercise,

          plannedNotes:
            'Más control',

        }),

    deleteSessionExercise:
      vi.fn(),

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

  'updateSessionExercisePlanned',

  () => {

    it(

      'updates planned notes for an authorized athlete',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        const result =

          await updateSessionExercisePlanned(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              plannedNotes:
                '  Más control  ',

              updatedByUserId:
                userId,

            },

          );

        expect(

          structure.updateSessionExercisePlanned,

        ).toHaveBeenCalledWith({

          sessionExerciseId,

          athleteId,

          plannedNotes:
            'Más control',

        });

        expect(
          result.plannedNotes,
        ).toBe(
          'Más control',
        );

      },

    );

    it(

      'normalizes empty planned notes to null',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await updateSessionExercisePlanned(

          createUnitOfWork(
            athletes,
            structure,
          ),

          {

            athleteId,

            sessionExerciseId,

            plannedNotes:
              '   ',

            updatedByUserId:
              userId,

          },

        );

        expect(

          structure.updateSessionExercisePlanned,

        ).toHaveBeenCalledWith({

          sessionExerciseId,

          athleteId,

          plannedNotes:
            null,

        });

      },

    );

    it(

      'allows coach write access',

      async () => {

        const athletes =
          createAthletes();

        vi.mocked(
          athletes.findAccess,
        ).mockResolvedValue({

          ...access,

          role:
            'COACH',

        });

        const structure =
          createStructure();

        await updateSessionExercisePlanned(

          createUnitOfWork(
            athletes,
            structure,
          ),

          {

            athleteId,

            sessionExerciseId,

            plannedNotes:
              'Control técnico',

            updatedByUserId:
              userId,

          },

        );

        expect(

          structure.updateSessionExercisePlanned,

        ).toHaveBeenCalledOnce();

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

          updateSessionExercisePlanned(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              plannedNotes:
                null,

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Session exercise not found',
        );

        expect(

          structure.updateSessionExercisePlanned,

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

          updateSessionExercisePlanned(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {

              athleteId,

              sessionExerciseId,

              plannedNotes:
                null,

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Session exercise does not belong to athlete',
        );

        expect(

          structure.updateSessionExercisePlanned,

        ).not.toHaveBeenCalled();

      },

    );

  },

);

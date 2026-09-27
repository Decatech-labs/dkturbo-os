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

  SessionBlock,

  SessionBlockId,

  SessionExercise,

  SessionExerciseId,

  TrainingDayId,

  TrainingSession,

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

  applySessionExerciseLayout,

} from './apply-session-exercise-layout.js';

const athleteId =

  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =

  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =

  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const sessionId =

  '50000000-0000-4000-8000-000000000001' as TrainingSessionId;

const blockId1 =

  '60000000-0000-4000-8000-000000000001' as SessionBlockId;

const blockId2 =

  '60000000-0000-4000-8000-000000000002' as SessionBlockId;

const exerciseId1 =

  '80000000-0000-4000-8000-000000000001' as SessionExerciseId;

const exerciseId2 =

  '80000000-0000-4000-8000-000000000002' as SessionExerciseId;

const exerciseId3 =

  '80000000-0000-4000-8000-000000000003' as SessionExerciseId;

const catalogExerciseId1 =

  '90000000-0000-4000-8000-000000000001' as ExerciseCatalogId;

const catalogExerciseId2 =

  '90000000-0000-4000-8000-000000000002' as ExerciseCatalogId;

const catalogExerciseId3 =

  '90000000-0000-4000-8000-000000000003' as ExerciseCatalogId;

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

const session:

  TrainingSession = {

    id:
      sessionId,

    dayId:
      '40000000-0000-4000-8000-000000000001' as TrainingDayId,

    athleteId,

    type:
      'STRENGTH',

    title:
      'Gimnasio',

    plannedStartTime:
      null,

    plannedDurationMinutes:
      null,

    actualStartTime:
      null,

    actualDurationMinutes:
      null,

    status:
      'PLANNED',

    plannedNotes:
      null,

    actualNotes:
      null,

    plannedRpe:
      null,

    actualRpe:
      null,

    source:
      'MANUAL',

    externalId:
      null,

    createdByUserId:
      userId,

    createdAt:
      now,

    updatedAt:
      now,

  };

const block1:

  SessionBlock = {

    id:
      blockId1,

    sessionId,

    athleteId,

    position:
      0,

    title:
      'Principal',

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,

  };

const block2:

  SessionBlock = {

    id:
      blockId2,

    sessionId,

    athleteId,

    position:
      1,

    title:
      'Accesorios',

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,

  };

const createExercise =

  (

    id:
      SessionExerciseId,

    blockId:
      SessionBlockId,

    exerciseId:
      ExerciseCatalogId,

    position:
      number,

  ): SessionExercise => ({

    id,

    blockId,

    sessionId,

    athleteId,

    exerciseId,

    position,

    plannedNotes:
      null,

    actualNotes:
      null,

    createdAt:
      now,

    updatedAt:
      now,

  });

const exercise1 =

  createExercise(
    exerciseId1,
    blockId1,
    catalogExerciseId1,
    0,
  );

const exercise2 =

  createExercise(
    exerciseId2,
    blockId1,
    catalogExerciseId2,
    1,
  );

const exercise3 =

  createExercise(
    exerciseId3,
    blockId2,
    catalogExerciseId3,
    0,
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

const createSessions =

  (): SessionRepository => ({

    createPlanned:
      vi.fn(),

    updatePlanned:
      vi.fn(),

    delete:
      vi.fn(),

    findById:
      vi.fn()
        .mockResolvedValue(
          session,
        ),

    listForDay:
      vi.fn(),

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
      vi.fn()
        .mockResolvedValue([
          block1,
          block2,
        ]),

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
      vi.fn(),

    applySessionExerciseLayout:
      vi.fn()
        .mockResolvedValue([
          {
            ...exercise2,
            position:
              0,
          },
          {
            ...exercise3,
            blockId:
              blockId1,
            position:
              1,
          },
          {
            ...exercise1,
            blockId:
              blockId2,
            position:
              0,
          },
        ]),

    findSessionExerciseById:
      vi.fn(),

    listExercisesForBlock:
      vi.fn()
        .mockImplementation(

          async (
            blockId,
          ) => {

            if (
              blockId ===
              blockId1
            ) {

              return [
                exercise1,
                exercise2,
              ];

            }

            if (
              blockId ===
              blockId2
            ) {

              return [
                exercise3,
              ];

            }

            return [];

          },

        ),

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

const createUnitOfWork =

  (

    athletes:
      AthleteRepository,

    sessions:
      SessionRepository,

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

  'applySessionExerciseLayout',

  () => {

    it(

      'reorders exercises and moves them between blocks',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        const structure =
          createStructure();

        const layout = [

          {

            blockId:
              blockId1,

            orderedIds: [
              exerciseId2,
              exerciseId3,
            ],

          },

          {

            blockId:
              blockId2,

            orderedIds: [
              exerciseId1,
            ],

          },

        ] as const;

        const result =

          await applySessionExerciseLayout(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {

              athleteId,

              sessionId,

              blocks:
                layout,

              updatedByUserId:
                userId,

            },

          );

        expect(

          structure.applySessionExerciseLayout,

        ).toHaveBeenCalledWith(

          sessionId,

          athleteId,

          layout,

        );

        expect(
          result,
        ).toHaveLength(
          3,
        );

      },

    );

    it(

      'reorders exercises within the same block',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        const structure =
          createStructure();

        const layout = [

          {

            blockId:
              blockId1,

            orderedIds: [
              exerciseId2,
              exerciseId1,
            ],

          },

          {

            blockId:
              blockId2,

            orderedIds: [
              exerciseId3,
            ],

          },

        ] as const;

        await applySessionExerciseLayout(

          createUnitOfWork(
            athletes,
            sessions,
            structure,
          ),

          {

            athleteId,

            sessionId,

            blocks:
              layout,

            updatedByUserId:
              userId,

          },

        );

        expect(

          structure.applySessionExerciseLayout,

        ).toHaveBeenCalledWith(

          sessionId,

          athleteId,

          layout,

        );

      },

    );

    it(

      'rejects duplicate block ids before opening a transaction',

      async () => {

        const execute =
          vi.fn();

        await expect(

          applySessionExerciseLayout(

            {
              execute,
            },

            {

              athleteId,

              sessionId,

              blocks: [

                {

                  blockId:
                    blockId1,

                  orderedIds: [
                    exerciseId1,
                    exerciseId2,
                  ],

                },

                {

                  blockId:
                    blockId1,

                  orderedIds: [
                    exerciseId3,
                  ],

                },

              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Session exercise layout contains duplicate block ids',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();

      },

    );

    it(

      'rejects duplicate exercise ids before opening a transaction',

      async () => {

        const execute =
          vi.fn();

        await expect(

          applySessionExerciseLayout(

            {
              execute,
            },

            {

              athleteId,

              sessionId,

              blocks: [

                {

                  blockId:
                    blockId1,

                  orderedIds: [
                    exerciseId1,
                    exerciseId2,
                  ],

                },

                {

                  blockId:
                    blockId2,

                  orderedIds: [
                    exerciseId1,
                  ],

                },

              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Session exercise layout contains duplicate exercise ids',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();

      },

    );

    it(

      'rejects a missing block from the layout',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        const structure =
          createStructure();

        await expect(

          applySessionExerciseLayout(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {

              athleteId,

              sessionId,

              blocks: [

                {

                  blockId:
                    blockId1,

                  orderedIds: [
                    exerciseId1,
                    exerciseId2,
                    exerciseId3,
                  ],

                },

              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Session exercise layout must contain every block exactly once',
        );

        expect(

          structure.applySessionExerciseLayout,

        ).not.toHaveBeenCalled();

      },

    );

    it(

      'rejects a layout containing a foreign exercise id',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        const structure =
          createStructure();

        const foreignExerciseId =

          '80000000-0000-4000-8000-000000000099' as SessionExerciseId;

        await expect(

          applySessionExerciseLayout(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {

              athleteId,

              sessionId,

              blocks: [

                {

                  blockId:
                    blockId1,

                  orderedIds: [
                    exerciseId1,
                    exerciseId2,
                  ],

                },

                {

                  blockId:
                    blockId2,

                  orderedIds: [
                    foreignExerciseId,
                  ],

                },

              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Session exercise layout must contain every exercise exactly once',
        );

        expect(

          structure.applySessionExerciseLayout,

        ).not.toHaveBeenCalled();

      },

    );

    it(

      'rejects an incomplete exercise layout',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        const structure =
          createStructure();

        await expect(

          applySessionExerciseLayout(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {

              athleteId,

              sessionId,

              blocks: [

                {

                  blockId:
                    blockId1,

                  orderedIds: [
                    exerciseId1,
                  ],

                },

                {

                  blockId:
                    blockId2,

                  orderedIds: [
                    exerciseId3,
                  ],

                },

              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Session exercise layout must contain every exercise exactly once',
        );

        expect(

          structure.applySessionExerciseLayout,

        ).not.toHaveBeenCalled();

      },

    );

    it(

      'rejects a missing session',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        vi.mocked(
          sessions.findById,
        ).mockResolvedValue(
          null,
        );

        const structure =
          createStructure();

        await expect(

          applySessionExerciseLayout(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {

              athleteId,

              sessionId,

              blocks: [

                {

                  blockId:
                    blockId1,

                  orderedIds: [
                    exerciseId1,
                    exerciseId2,
                  ],

                },

                {

                  blockId:
                    blockId2,

                  orderedIds: [
                    exerciseId3,
                  ],

                },

              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Training session not found',
        );

        expect(

          structure.applySessionExerciseLayout,

        ).not.toHaveBeenCalled();

      },

    );

    it(

      'rejects a session belonging to another athlete',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        vi.mocked(
          sessions.findById,
        ).mockResolvedValue({

          ...session,

          athleteId:
            otherAthleteId,

        });

        const structure =
          createStructure();

        await expect(

          applySessionExerciseLayout(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {

              athleteId,

              sessionId,

              blocks: [

                {

                  blockId:
                    blockId1,

                  orderedIds: [
                    exerciseId1,
                    exerciseId2,
                  ],

                },

                {

                  blockId:
                    blockId2,

                  orderedIds: [
                    exerciseId3,
                  ],

                },

              ],

              updatedByUserId:
                userId,

            },

          ),

        ).rejects.toThrow(
          'Training session does not belong to athlete',
        );

        expect(

          structure.applySessionExerciseLayout,

        ).not.toHaveBeenCalled();

      },

    );

  },

);

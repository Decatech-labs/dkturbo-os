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
  SessionBlock,
  SessionBlockId,
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
  createSessionBlock,
} from './create-session-block.js';

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

const now =
  new Date(
    '2026-09-08T20:00:00Z',
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

const block:
  SessionBlock = {
    id:
      blockId,

    sessionId,

    athleteId,

    position:
      0,

    title:
      'Fuerza principal',

    notes:
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

const createSessions =
  (): SessionRepository => ({
    createPlanned:
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
      vi.fn()
        .mockResolvedValue(
          block,
        ),

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

    listExercisesForBlock:
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
      async (work) =>
        work({
          athletes,
          weeks,
          sessions,
          sessionStructure,
        }),
  });

describe(
  'createSessionBlock',
  () => {

    it(
      'creates a block for an authorized session',
      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        const structure =
          createStructure();

        const result =
          await createSessionBlock(
            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),
            {
              athleteId,
              sessionId,
              position:
                0,
              title:
                '  Fuerza principal  ',
              createdByUserId:
                userId,
            },
          );

        expect(
          structure.createBlock,
        ).toHaveBeenCalledWith({
          sessionId,
          athleteId,
          position:
            0,
          title:
            'Fuerza principal',
          notes:
            null,
        });

        expect(
          result,
        ).toEqual(
          block,
        );
      },
    );

    it(
      'rejects an empty title before opening a transaction',
      async () => {

        const execute =
          vi.fn();

        await expect(
          createSessionBlock(
            {
              execute,
            },
            {
              athleteId,
              sessionId,
              position:
                0,
              title:
                '   ',
              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Session block title is required',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects an invalid position',
      async () => {

        const execute =
          vi.fn();

        await expect(
          createSessionBlock(
            {
              execute,
            },
            {
              athleteId,
              sessionId,
              position:
                -1,
              title:
                'Fuerza',
              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Session block position must be a non-negative integer',
        );

        expect(
          execute,
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
          createSessionBlock(
            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),
            {
              athleteId,
              sessionId,
              position:
                0,
              title:
                'Fuerza',
              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Training session not found',
        );

        expect(
          structure.createBlock,
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
          createSessionBlock(
            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),
            {
              athleteId,
              sessionId,
              position:
                0,
              title:
                'Fuerza',
              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Training session does not belong to athlete',
        );

        expect(
          structure.createBlock,
        ).not.toHaveBeenCalled();
      },
    );
  },
);

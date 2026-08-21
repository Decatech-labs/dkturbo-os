import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { Clock } from '../../time/clock.port.js';
import {
  type ActionExecution,
  type ActionExecutionId,
} from '../domain/action-execution.js';
import {
  createActionKey,
} from '../domain/action-key.js';
import type {
  ActionRequest,
} from '../domain/action-request.js';
import type {
  ActionExecutionGateway,
} from '../ports/action-execution-gateway.port.js';
import type {
  ActionExecutionRepository,
} from '../ports/action-execution-repository.port.js';
import type {
  ActionRequestRepository,
} from '../ports/action-request-repository.port.js';
import {
  ExecuteActionExecution,
} from './execute-action-execution.js';
import {
  createActorRef,
} from '../../actors/actor-ref.js';
import {
  createResourceRef,
} from '../../resources/resource-ref.js';

const executionId =
  '11111111-1111-4111-8111-111111111111' as ActionExecutionId;

const actionRequestId =
  '22222222-2222-4222-8222-222222222222';

const nodeId =
  '33333333-3333-4333-8333-333333333333';

const createdAt =
  new Date('2026-08-22T00:00:00.000Z');

const startedAt =
  new Date('2026-08-22T00:00:01.000Z');

const finishedAt =
  new Date('2026-08-22T00:00:02.000Z');

describe(
  'ExecuteActionExecution',
  () => {
    it(
      'executes a pending action and marks it succeeded',
      async () => {
        let currentExecution:
          ActionExecution = {
          id: executionId,
          actionRequestId:
            actionRequestId as never,
          nodeId,
          requiredCapability:
            'system.metrics',
          status: 'PENDING',
          createdAt,
          startedAt: null,
          finishedAt: null,
          result: null,
          errorCode: null,
          errorMessage: null,
        };

        const executions: ActionExecutionRepository =
          {
            save: vi.fn(),

            findById:
              vi.fn(
                async () =>
                  currentExecution,
              ),

            markRunning:
              vi.fn(
                async (
                  id,
                  value,
                ) => {
                  currentExecution = {
                    ...currentExecution,
                    id,
                    status:
                      'RUNNING',
                    startedAt:
                      value,
                  };
                },
              ),

            markSucceeded:
              vi.fn(
                async (
                  id,
                  result,
                  value,
                ) => {
                  currentExecution = {
                    ...currentExecution,
                    id,
                    status:
                      'SUCCEEDED',
                    result,
                    finishedAt:
                      value,
                  };
                },
              ),

            markFailed:
              vi.fn(),
          };

        const actionRequest: ActionRequest =
          {
            id:
              actionRequestId as never,

            actionKey:
              createActionKey(
                'node.system.info.read',
              ),

            target:
              createResourceRef({
                kind: 'infra.node',
                id: nodeId,
              }),

            requestedBy:
              createActorRef({
                kind: 'user',
                id:
                  '44444444-4444-4444-8444-444444444444',
              }),

            parameters: {},

            status: 'READY',

            requestedAt:
              createdAt,
          };

        const actionRequests =
          {
            findById:
              vi.fn(
                async () =>
                  actionRequest,
              ),
          } as unknown as ActionRequestRepository;

        const gateway: ActionExecutionGateway =
          {
            execute:
              vi.fn(
                async () => ({
                  system: {
                    hostname:
                      'dk-node-home-01',
                  },
                }),
              ),
          };

        const times = [
          startedAt,
          finishedAt,
        ];

        const clock: Clock = {
          now: vi.fn(
            () =>
              times.shift() ??
              finishedAt,
          ),
        };

        const useCase =
          new ExecuteActionExecution(
            executions,
            actionRequests,
            gateway,
            clock,
          );

        const result =
          await useCase.execute(
            executionId,
          );

        expect(
          gateway.execute,
        ).toHaveBeenCalledWith({
          actionKey:
            actionRequest.actionKey,
          nodeId,
          parameters: {},
        });

        expect(
          executions.markRunning,
        ).toHaveBeenCalledWith(
          executionId,
          startedAt,
        );

        expect(
          executions.markSucceeded,
        ).toHaveBeenCalled();

        expect(
          executions.markFailed,
        ).not.toHaveBeenCalled();

        expect(result.status)
          .toBe('SUCCEEDED');

        expect(result.result)
          .toEqual({
            system: {
              hostname:
                'dk-node-home-01',
            },
          });
      },
    );

    it(
      'persists FAILED when the gateway fails',
      async () => {
        let currentExecution:
          ActionExecution = {
          id: executionId,
          actionRequestId:
            actionRequestId as never,
          nodeId,
          requiredCapability:
            'system.metrics',
          status: 'PENDING',
          createdAt,
          startedAt: null,
          finishedAt: null,
          result: null,
          errorCode: null,
          errorMessage: null,
        };

        const executions: ActionExecutionRepository =
          {
            save: vi.fn(),

            findById:
              vi.fn(
                async () =>
                  currentExecution,
              ),

            markRunning:
              vi.fn(
                async (
                  id,
                  value,
                ) => {
                  currentExecution = {
                    ...currentExecution,
                    id,
                    status:
                      'RUNNING',
                    startedAt:
                      value,
                  };
                },
              ),

            markSucceeded:
              vi.fn(),

            markFailed:
              vi.fn(
                async (
                  id,
                  errorCode,
                  errorMessage,
                  value,
                ) => {
                  currentExecution = {
                    ...currentExecution,
                    id,
                    status:
                      'FAILED',
                    finishedAt:
                      value,
                    errorCode,
                    errorMessage,
                  };
                },
              ),
          };

        const actionRequest: ActionRequest =
          {
            id:
              actionRequestId as never,

            actionKey:
              createActionKey(
                'node.system.info.read',
              ),

            target:
              createResourceRef({
                kind: 'infra.node',
                id: nodeId,
              }),

            requestedBy:
              createActorRef({
                kind: 'user',
                id:
                  '44444444-4444-4444-8444-444444444444',
              }),

            parameters: {},

            status: 'READY',

            requestedAt:
              createdAt,
          };

        const actionRequests =
          {
            findById:
              vi.fn(
                async () =>
                  actionRequest,
              ),
          } as unknown as ActionRequestRepository;

        const gateway: ActionExecutionGateway =
          {
            execute:
              vi.fn(
                async () => {
                  throw new Error(
                    'SSH unavailable',
                  );
                },
              ),
          };

        const times = [
          startedAt,
          finishedAt,
        ];

        const clock: Clock = {
          now: vi.fn(
            () =>
              times.shift() ??
              finishedAt,
          ),
        };

        const useCase =
          new ExecuteActionExecution(
            executions,
            actionRequests,
            gateway,
            clock,
          );

        const result =
          await useCase.execute(
            executionId,
          );

        expect(
          executions.markFailed,
        ).toHaveBeenCalledWith(
          executionId,
          'execution_failed',
          'SSH unavailable',
          finishedAt,
        );

        expect(
          executions.markSucceeded,
        ).not.toHaveBeenCalled();

        expect(result.status)
          .toBe('FAILED');

        expect(result.errorCode)
          .toBe(
            'execution_failed',
          );

        expect(result.errorMessage)
          .toBe(
            'SSH unavailable',
          );
      },
    );
  },
);

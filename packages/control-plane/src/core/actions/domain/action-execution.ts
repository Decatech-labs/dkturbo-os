import { randomUUID } from 'node:crypto';

import type { ActionRequestId } from './action-request.js';

export type ActionExecutionId = string & {
  readonly __brand: 'ActionExecutionId';
};

export type ActionExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED';

export type ActionExecutionResult =
  Record<string, unknown>;

export interface ActionExecution {
  id: ActionExecutionId;
  actionRequestId: ActionRequestId;
  nodeId: string;
  requiredCapability: string;
  status: ActionExecutionStatus;

  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;

  result: ActionExecutionResult | null;
  errorCode: string | null;
  errorMessage: string | null;
}

export const createActionExecution = (
  input: {
    actionRequestId: ActionRequestId;
    nodeId: string;
    requiredCapability: string;
    createdAt: Date;
  },
): ActionExecution => ({
  id: randomUUID() as ActionExecutionId,

  ...input,

  status: 'PENDING',

  startedAt: null,
  finishedAt: null,

  result: null,
  errorCode: null,
  errorMessage: null,
});

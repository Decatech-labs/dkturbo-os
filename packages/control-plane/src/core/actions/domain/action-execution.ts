import { randomUUID } from 'node:crypto';

import type { ActionRequestId } from './action-request.js';

export type ActionExecutionId = string & {
  readonly __brand: 'ActionExecutionId';
};

export type ActionExecutionStatus =
  'PENDING';

export interface ActionExecution {
  id: ActionExecutionId;
  actionRequestId: ActionRequestId;
  nodeId: string;
  requiredCapability: string;
  status: ActionExecutionStatus;
  createdAt: Date;
}

export const createActionExecution = (
  input: Omit<
    ActionExecution,
    'id' | 'status'
  >,
): ActionExecution => ({
  id: randomUUID() as ActionExecutionId,
  ...input,
  status: 'PENDING',
});

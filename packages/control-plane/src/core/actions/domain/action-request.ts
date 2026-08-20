import { randomUUID } from 'node:crypto';

import type { ResourceRef } from '../../resources/index.js';
import {
  createActionKey,
  type ActionKey,
} from './action-key.js';

export type ActionRequestId = string & {
  readonly __brand: 'ActionRequestId';
};

export type ActionRequestStatus =
  'REQUESTED';

export type ActionParameters =
  Record<string, unknown>;

export interface ActionRequest {
  id: ActionRequestId;
  actionKey: ActionKey;
  target: ResourceRef;
  parameters: ActionParameters;
  status: ActionRequestStatus;
  requestedAt: Date;
}

export interface CreateActionRequestInput {
  actionKey: string;
  target: ResourceRef;
  parameters?: ActionParameters;
  requestedAt: Date;
}

export const createActionRequest = ({
  actionKey,
  target,
  parameters = {},
  requestedAt,
}: CreateActionRequestInput): ActionRequest => {
  return {
    id: randomUUID() as ActionRequestId,
    actionKey: createActionKey(actionKey),
    target,
    parameters,
    status: 'REQUESTED',
    requestedAt,
  };
};

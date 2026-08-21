import { randomUUID } from 'node:crypto';

import type { ActorRef } from '../../actors/index.js';
import type { ResourceRef } from '../../resources/index.js';
import {
  createActionKey,
  type ActionKey,
} from './action-key.js';

export type ActionRequestId = string & {
  readonly __brand: 'ActionRequestId';
};

export type ActionRequestStatus =
  | 'REQUESTED'
  | 'AWAITING_APPROVAL'
  | 'READY'
  | 'DENIED';

export type ActionParameters =
  Record<string, unknown>;

export interface ActionRequest {
  id: ActionRequestId;
  actionKey: ActionKey;
  target: ResourceRef;
  requestedBy: ActorRef;
  parameters: ActionParameters;
  status: ActionRequestStatus;
  requestedAt: Date;
}

export interface CreateActionRequestInput {
  actionKey: string;
  target: ResourceRef;
  requestedBy: ActorRef;
  parameters?: ActionParameters;
  requestedAt: Date;
}

export const createActionRequest = ({
  actionKey,
  target,
  requestedBy,
  parameters = {},
  requestedAt,
}: CreateActionRequestInput): ActionRequest => ({
  id: randomUUID() as ActionRequestId,
  actionKey: createActionKey(actionKey),
  target,
  requestedBy,
  parameters,
  status: 'REQUESTED',
  requestedAt,
});

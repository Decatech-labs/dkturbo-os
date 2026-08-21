import { randomUUID } from 'node:crypto';

import type { ActorRef } from '../../actors/index.js';
import type { ActionRequestId } from '../../actions/domain/action-request.js';

export type ApprovalRequestId = string & {
  readonly __brand: 'ApprovalRequestId';
};

export type ApprovalRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface ApprovalRequest {
  id: ApprovalRequestId;
  actionRequestId: ActionRequestId;
  status: ApprovalRequestStatus;
  requestedAt: Date;
  decidedAt: Date | null;
  decidedBy: ActorRef | null;
}

export const createApprovalRequest = (
  actionRequestId: ActionRequestId,
  requestedAt: Date,
): ApprovalRequest => ({
  id: randomUUID() as ApprovalRequestId,
  actionRequestId,
  status: 'PENDING',
  requestedAt,
  decidedAt: null,
  decidedBy: null,
});
